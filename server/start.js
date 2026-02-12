/**
 * Startup Script with Pre-flight Checks
 * 
 * This script performs checks before starting the server
 * to ensure all dependencies are available.
 */

const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
require('dotenv').config();

const prisma = new PrismaClient();
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: () => null,
});

async function checkDependencies() {
    console.log('🔍 Performing pre-flight checks...\n');

    let allChecksPass = true;

    // Check 1: Environment Variables
    console.log('1️⃣  Checking environment variables...');
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
    const missingVars = requiredVars.filter(v => !process.env[v]);

    if (missingVars.length === 0) {
        console.log('   ✅ All required environment variables are set\n');
    } else {
        console.log(`   ❌ Missing: ${missingVars.join(', ')}\n`);
        allChecksPass = false;
    }

    // Check 2: Database
    console.log('2️⃣  Checking database connection...');
    try {
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
        console.log('   ✅ Database connection successful\n');
    } catch (error) {
        console.log('   ❌ Database connection failed:', error.message);
        console.log('   → Check DATABASE_URL in .env');
        console.log('   → Ensure PostgreSQL is running');
        console.log('   → Run: npm run db:push\n');
        allChecksPass = false;
    }

    // Check 3: Redis
    console.log('3️⃣  Checking Redis connection...');
    try {
        const pong = await redis.ping();
        if (pong === 'PONG') {
            console.log('   ✅ Redis connection successful\n');
        }
    } catch (error) {
        console.log('   ❌ Redis connection failed:', error.message);
        console.log('   → Ensure Redis is running');
        console.log('   → Check REDIS_HOST and REDIS_PORT in .env\n');
        allChecksPass = false;
    }

    

    // Cleanup
    await prisma.$disconnect();
    redis.disconnect();

    if (allChecksPass) {
        console.log('✅ All checks passed! Starting server...\n');
        console.log('─────────────────────────────────────\n');

        // Start the actual server
        require('./src/index.js');
    } else {
        console.log('❌ Some checks failed. Please fix the issues above before starting the server.\n');
        process.exit(1);
    }
}

checkDependencies().catch((error) => {
    console.error('❌ Pre-flight check failed:', error);
    process.exit(1);
});
