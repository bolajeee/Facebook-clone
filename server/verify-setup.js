/**
 * Setup Verification Script
 * 
 * Run this script to verify your backend setup is correct.
 * Usage: node verify-setup.js
 */

const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
require('dotenv').config();

const prisma = new PrismaClient();
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: () => null, // Don't retry on failure
});

async function verifySetup() {
    console.log('🔍 Verifying Backend Setup...\n');

    const checks = {
        env: false,
        database: false,
        redis: false,
    };

    // Check 1: Environment Variables
    console.log('1️⃣  Checking environment variables...');
    const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length === 0) {
        console.log('   ✅ All required environment variables are set\n');
        checks.env = true;
    } else {
        console.log('   ❌ Missing environment variables:', missingVars.join(', '));
        console.log('   → Check your .env file\n');
    }

    // Check 2: Database Connection
    console.log('2️⃣  Checking database connection...');
    try {
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
        console.log('   ✅ Database connection successful');

        // Check if tables exist
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

        if (tables.length > 0) {
            console.log(`   ✅ Found ${tables.length} tables in database`);
            checks.database = true;
        } else {
            console.log('   ⚠️  No tables found. Run: npm run db:push');
        }
        console.log();
    } catch (error) {
        console.log('   ❌ Database connection failed:', error.message);
        console.log('   → Check DATABASE_URL in .env');
        console.log('   → Ensure PostgreSQL is running');
        console.log('   → Run: npm run db:push\n');
    }

    // Check 3: Redis Connection
    console.log('3️⃣  Checking Redis connection...');
    try {
        const pong = await redis.ping();
        if (pong === 'PONG') {
            console.log('   ✅ Redis connection successful\n');
            checks.redis = true;
        }
    } catch (error) {
        console.log('   ❌ Redis connection failed:', error.message);
        console.log('   → Ensure Redis is running');
        console.log('   → Check REDIS_HOST and REDIS_PORT in .env\n');
    }

    // Summary
    console.log('📊 Setup Summary:');
    console.log('─────────────────────────────────────');
    console.log(`Environment Variables: ${checks.env ? '✅' : '❌'}`);
    console.log(`Database Connection:   ${checks.database ? '✅' : '❌'}`);
    console.log(`Redis Connection:      ${checks.redis ? '✅' : '❌'}`);
    console.log('─────────────────────────────────────\n');

    const allChecks = Object.values(checks).every(check => check === true);

    if (allChecks) {
        console.log('🎉 All checks passed! You can start the server with: npm run dev\n');
    } else {
        console.log('⚠️  Some checks failed. Please fix the issues above before starting the server.\n');
    }

    // Cleanup
    await prisma.$disconnect();
    redis.disconnect();

    process.exit(allChecks ? 0 : 1);
}

verifySetup().catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
});
