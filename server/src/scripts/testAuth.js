/**
 * Authentication System Test Script
 * Tests all authentication endpoints and functionality
 */

const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test data
const testUser = {
    email: 'test@example.com',
    username: 'testuser123',
    password: 'TestPass123',
    firstName: 'Test',
    lastName: 'User'
};

const testUser2 = {
    email: 'test2@example.com',
    username: 'testuser456',
    password: 'TestPass456',
    firstName: 'Test2',
    lastName: 'User2'
};

let authTokens = {};

/**
 * Helper function to make API requests
 */
const apiRequest = async (method, endpoint, data = null, token = null) => {
    try {
        const config = {
            method,
            url: `${API_URL}${endpoint}`,
            headers: {}
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (data) {
            config.data = data;
            config.headers['Content-Type'] = 'application/json';
        }

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status || 500
        };
    }
};

/**
 * Test user registration
 */
const testRegister = async () => {
    console.log('\n🧪 Testing User Registration...');

    // Test successful registration
    const result = await apiRequest('POST', '/auth/register', testUser);

    if (result.success) {
        console.log('✅ Registration successful');
        console.log(`   User ID: ${result.data.data.user.id}`);
        console.log(`   Username: ${result.data.data.user.username}`);
        console.log(`   Email: ${result.data.data.user.email}`);

        // Store tokens for later tests
        authTokens.accessToken = result.data.data.accessToken;
        authTokens.refreshToken = result.data.data.refreshToken;
        authTokens.userId = result.data.data.user.id;

        return true;
    } else {
        console.log('❌ Registration failed:', result.error.message);
        return false;
    }
};

/**
 * Test duplicate registration (should fail)
 */
const testDuplicateRegister = async () => {
    console.log('\n🧪 Testing Duplicate Registration (should fail)...');

    const result = await apiRequest('POST', '/auth/register', testUser);

    if (!result.success && result.status === 409) {
        console.log('✅ Duplicate registration correctly rejected');
        return true;
    } else {
        console.log('❌ Duplicate registration should have failed');
        return false;
    }
};

/**
 * Test user login
 */
const testLogin = async () => {
    console.log('\n🧪 Testing User Login...');

    // Test login with email
    const emailLogin = await apiRequest('POST', '/auth/login', {
        identifier: testUser.email,
        password: testUser.password
    });

    if (emailLogin.success) {
        console.log('✅ Email login successful');

        // Test login with username
        const usernameLogin = await apiRequest('POST', '/auth/login', {
            identifier: testUser.username,
            password: testUser.password
        });

        if (usernameLogin.success) {
            console.log('✅ Username login successful');

            // Update tokens
            authTokens.accessToken = usernameLogin.data.data.accessToken;
            authTokens.refreshToken = usernameLogin.data.data.refreshToken;

            return true;
        } else {
            console.log('❌ Username login failed:', usernameLogin.error.message);
            return false;
        }
    } else {
        console.log('❌ Email login failed:', emailLogin.error.message);
        return false;
    }
};

/**
 * Test invalid login (should fail)
 */
const testInvalidLogin = async () => {
    console.log('\n🧪 Testing Invalid Login (should fail)...');

    const result = await apiRequest('POST', '/auth/login', {
        identifier: testUser.email,
        password: 'wrongpassword'
    });

    if (!result.success && result.status === 401) {
        console.log('✅ Invalid login correctly rejected');
        return true;
    } else {
        console.log('❌ Invalid login should have failed');
        return false;
    }
};

/**
 * Test getting current user profile
 */
const testGetMe = async () => {
    console.log('\n🧪 Testing Get Current User...');

    const result = await apiRequest('GET', '/auth/me', null, authTokens.accessToken);

    if (result.success) {
        console.log('✅ Get current user successful');
        console.log(`   User: ${result.data.data.user.firstName} ${result.data.data.user.lastName}`);
        console.log(`   Posts: ${result.data.data.user.postsCount}`);
        console.log(`   Followers: ${result.data.data.user.followersCount}`);
        console.log(`   Following: ${result.data.data.user.followingCount}`);
        return true;
    } else {
        console.log('❌ Get current user failed:', result.error.message);
        return false;
    }
};

/**
 * Test unauthorized access (should fail)
 */
const testUnauthorizedAccess = async () => {
    console.log('\n🧪 Testing Unauthorized Access (should fail)...');

    const result = await apiRequest('GET', '/auth/me');

    if (!result.success && result.status === 401) {
        console.log('✅ Unauthorized access correctly rejected');
        return true;
    } else {
        console.log('❌ Unauthorized access should have failed');
        return false;
    }
};

/**
 * Test token refresh
 */
const testRefreshToken = async () => {
    console.log('\n🧪 Testing Token Refresh...');

    const result = await apiRequest('POST', '/auth/refresh', {
        refreshToken: authTokens.refreshToken
    });

    if (result.success) {
        console.log('✅ Token refresh successful');

        // Update tokens
        authTokens.accessToken = result.data.data.accessToken;
        authTokens.refreshToken = result.data.data.refreshToken;

        return true;
    } else {
        console.log('❌ Token refresh failed:', result.error.message);
        return false;
    }
};

/**
 * Test password change
 */
const testChangePassword = async () => {
    console.log('\n🧪 Testing Password Change...');

    const newPassword = 'NewTestPass123';

    const result = await apiRequest('PUT', '/auth/change-password', {
        currentPassword: testUser.password,
        newPassword: newPassword
    }, authTokens.accessToken);

    if (result.success) {
        console.log('✅ Password change successful');

        // Test login with new password
        const loginResult = await apiRequest('POST', '/auth/login', {
            identifier: testUser.email,
            password: newPassword
        });

        if (loginResult.success) {
            console.log('✅ Login with new password successful');
            authTokens.accessToken = loginResult.data.data.accessToken;
            authTokens.refreshToken = loginResult.data.data.refreshToken;
            return true;
        } else {
            console.log('❌ Login with new password failed');
            return false;
        }
    } else {
        console.log('❌ Password change failed:', result.error.message);
        return false;
    }
};

/**
 * Test logout
 */
const testLogout = async () => {
    console.log('\n🧪 Testing Logout...');

    const result = await apiRequest('POST', '/auth/logout', null, authTokens.accessToken);

    if (result.success) {
        console.log('✅ Logout successful');

        // Test that old token is now invalid
        const meResult = await apiRequest('GET', '/auth/me', null, authTokens.accessToken);

        if (!meResult.success && meResult.status === 401) {
            console.log('✅ Token invalidated after logout');
            return true;
        } else {
            console.log('❌ Token should be invalid after logout');
            return false;
        }
    } else {
        console.log('❌ Logout failed:', result.error.message);
        return false;
    }
};

/**
 * Test input validation
 */
const testValidation = async () => {
    console.log('\n🧪 Testing Input Validation...');

    // Test invalid email
    const invalidEmail = await apiRequest('POST', '/auth/register', {
        ...testUser2,
        email: 'invalid-email'
    });

    if (!invalidEmail.success && invalidEmail.status === 400) {
        console.log('✅ Invalid email correctly rejected');
    } else {
        console.log('❌ Invalid email should have been rejected');
        return false;
    }

    // Test weak password
    const weakPassword = await apiRequest('POST', '/auth/register', {
        ...testUser2,
        password: '123'
    });

    if (!weakPassword.success && weakPassword.status === 400) {
        console.log('✅ Weak password correctly rejected');
    } else {
        console.log('❌ Weak password should have been rejected');
        return false;
    }

    // Test invalid username
    const invalidUsername = await apiRequest('POST', '/auth/register', {
        ...testUser2,
        username: 'ab'
    });

    if (!invalidUsername.success && invalidUsername.status === 400) {
        console.log('✅ Invalid username correctly rejected');
        return true;
    } else {
        console.log('❌ Invalid username should have been rejected');
        return false;
    }
};

/**
 * Run all tests
 */
const runAllTests = async () => {
    console.log('🚀 Starting Authentication System Tests...');
    console.log(`📡 API URL: ${API_URL}`);

    const tests = [
        { name: 'User Registration', fn: testRegister },
        { name: 'Duplicate Registration', fn: testDuplicateRegister },
        { name: 'User Login', fn: testLogin },
        { name: 'Invalid Login', fn: testInvalidLogin },
        { name: 'Get Current User', fn: testGetMe },
        { name: 'Unauthorized Access', fn: testUnauthorizedAccess },
        { name: 'Token Refresh', fn: testRefreshToken },
        { name: 'Password Change', fn: testChangePassword },
        { name: 'Input Validation', fn: testValidation },
        { name: 'User Logout', fn: testLogout }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} threw an error:`, error.message);
            failed++;
        }

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
        console.log('\n🎉 All tests passed! Authentication system is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the implementation.');
    }
};

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    runAllTests,
    testRegister,
    testLogin,
    testGetMe,
    testRefreshToken,
    testLogout
};