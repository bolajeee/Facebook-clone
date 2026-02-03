/**
 * Database Seeding Script
 * Creates sample data for development and testing
 */

const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Hash password for seeded users
 */
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

/**
 * Create sample users
 */
const createUsers = async () => {
    logger.info('Creating sample users...');

    const users = [
        {
            email: 'john.doe@example.com',
            username: 'johndoe',
            password: await hashPassword('password123'),
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Software developer passionate about building great products.',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
            isVerified: true
        },
        {
            email: 'jane.smith@example.com',
            username: 'janesmith',
            password: await hashPassword('password123'),
            firstName: 'Jane',
            lastName: 'Smith',
            bio: 'UX designer who loves creating beautiful user experiences.',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
            isVerified: true
        },
        {
            email: 'mike.johnson@example.com',
            username: 'mikejohnson',
            password: await hashPassword('password123'),
            firstName: 'Mike',
            lastName: 'Johnson',
            bio: 'Product manager and tech enthusiast.',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
            isVerified: false
        },
        {
            email: 'sarah.wilson@example.com',
            username: 'sarahwilson',
            password: await hashPassword('password123'),
            firstName: 'Sarah',
            lastName: 'Wilson',
            bio: 'Marketing specialist and content creator.',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
            isVerified: true
        },
        {
            email: 'alex.brown@example.com',
            username: 'alexbrown',
            password: await hashPassword('password123'),
            firstName: 'Alex',
            lastName: 'Brown',
            bio: 'Full-stack developer and open source contributor.',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
            isVerified: true
        }
    ];

    const createdUsers = [];

    for (const userData of users) {
        try {
            const user = await prisma.user.create({
                data: userData
            });
            createdUsers.push(user);
            logger.info(`Created user: ${user.username}`);
        } catch (error) {
            if (error.code === 'P2002') {
                logger.warn(`User ${userData.username} already exists, skipping...`);
                // Get existing user
                const existingUser = await prisma.user.findUnique({
                    where: { username: userData.username }
                });
                if (existingUser) {
                    createdUsers.push(existingUser);
                }
            } else {
                logger.error(`Failed to create user ${userData.username}:`, error);
            }
        }
    }

    return createdUsers;
};

/**
 * Create follow relationships
 */
const createFollows = async (users) => {
    logger.info('Creating follow relationships...');

    const followRelationships = [
        { follower: 'johndoe', following: 'janesmith' },
        { follower: 'johndoe', following: 'mikejohnson' },
        { follower: 'johndoe', following: 'sarahwilson' },
        { follower: 'janesmith', following: 'johndoe' },
        { follower: 'janesmith', following: 'alexbrown' },
        { follower: 'mikejohnson', following: 'johndoe' },
        { follower: 'mikejohnson', following: 'janesmith' },
        { follower: 'sarahwilson', following: 'johndoe' },
        { follower: 'sarahwilson', following: 'janesmith' },
        { follower: 'sarahwilson', following: 'alexbrown' },
        { follower: 'alexbrown', following: 'janesmith' },
        { follower: 'alexbrown', following: 'sarahwilson' }
    ];

    for (const relationship of followRelationships) {
        try {
            const follower = users.find(u => u.username === relationship.follower);
            const following = users.find(u => u.username === relationship.following);

            if (follower && following) {
                await prisma.follow.create({
                    data: {
                        followerId: follower.id,
                        followingId: following.id
                    }
                });
                logger.info(`${follower.username} is now following ${following.username}`);
            }
        } catch (error) {
            if (error.code === 'P2002') {
                logger.warn(`Follow relationship already exists, skipping...`);
            } else {
                logger.error('Failed to create follow relationship:', error);
            }
        }
    }
};

/**
 * Create sample posts
 */
const createPosts = async (users) => {
    logger.info('Creating sample posts...');

    const posts = [
        {
            author: 'johndoe',
            content: 'Just finished building a new React component library! Excited to share it with the community. 🚀',
            imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop'
        },
        {
            author: 'janesmith',
            content: 'Working on some new UI designs for our mobile app. The user experience is everything! ✨',
            imageUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=600&fit=crop'
        },
        {
            author: 'johndoe',
            content: 'Beautiful sunset from my office window today. Sometimes you need to take a moment to appreciate the simple things in life. 🌅'
        },
        {
            author: 'mikejohnson',
            content: 'Just launched our new product feature! The team worked incredibly hard on this. Proud of what we accomplished together. 💪',
            imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'
        },
        {
            author: 'sarahwilson',
            content: 'Content marketing tip: Always write for your audience, not for yourself. Understanding your users is key to creating engaging content. 📝'
        },
        {
            author: 'alexbrown',
            content: 'Open source contribution of the day: Fixed a critical bug in a popular JavaScript library. Love giving back to the community! 🔧',
            imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop'
        },
        {
            author: 'janesmith',
            content: 'Attending an amazing design conference today. So many inspiring talks about the future of user experience design. 🎨'
        },
        {
            author: 'johndoe',
            content: 'Coffee and code - the perfect combination for a productive morning. What\'s your favorite coding fuel? ☕'
        },
        {
            author: 'sarahwilson',
            content: 'Just published a new blog post about social media marketing trends for 2024. Check it out and let me know your thoughts! 📊',
            imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
        },
        {
            author: 'mikejohnson',
            content: 'Team retrospective went great today. It\'s amazing how much we can improve when we take time to reflect and learn together. 🤝'
        }
    ];

    const createdPosts = [];

    for (const postData of posts) {
        try {
            const author = users.find(u => u.username === postData.author);

            if (author) {
                const post = await prisma.post.create({
                    data: {
                        content: postData.content,
                        imageUrl: postData.imageUrl || null,
                        authorId: author.id
                    }
                });
                createdPosts.push(post);
                logger.info(`Created post by ${author.username}: ${post.content.substring(0, 50)}...`);
            }
        } catch (error) {
            logger.error('Failed to create post:', error);
        }
    }

    return createdPosts;
};

/**
 * Create sample comments
 */
const createComments = async (users, posts) => {
    logger.info('Creating sample comments...');

    const comments = [
        {
            author: 'janesmith',
            postIndex: 0,
            content: 'This looks amazing! Can\'t wait to try it out in my next project.'
        },
        {
            author: 'mikejohnson',
            postIndex: 0,
            content: 'Great work! The documentation looks really comprehensive.'
        },
        {
            author: 'johndoe',
            postIndex: 1,
            content: 'Love the clean design aesthetic! The color palette is perfect.'
        },
        {
            author: 'alexbrown',
            postIndex: 1,
            content: 'The user flow looks intuitive. Great job on the UX research!'
        },
        {
            author: 'sarahwilson',
            postIndex: 2,
            content: 'Beautiful photo! Where was this taken?'
        },
        {
            author: 'janesmith',
            postIndex: 3,
            content: 'Congratulations on the launch! The feature looks really useful.'
        },
        {
            author: 'johndoe',
            postIndex: 4,
            content: 'Great tip! Understanding the audience is definitely crucial for content success.'
        },
        {
            author: 'mikejohnson',
            postIndex: 5,
            content: 'Thanks for contributing to open source! Which library was it?'
        },
        {
            author: 'alexbrown',
            postIndex: 6,
            content: 'Sounds like an inspiring event! Any key takeaways you can share?'
        },
        {
            author: 'sarahwilson',
            postIndex: 7,
            content: 'Definitely coffee! Though I\'m more of a tea person myself. 🍵'
        }
    ];

    for (const commentData of comments) {
        try {
            const author = users.find(u => u.username === commentData.author);
            const post = posts[commentData.postIndex];

            if (author && post) {
                await prisma.comment.create({
                    data: {
                        content: commentData.content,
                        authorId: author.id,
                        postId: post.id
                    }
                });
                logger.info(`Created comment by ${author.username} on post ${commentData.postIndex}`);
            }
        } catch (error) {
            logger.error('Failed to create comment:', error);
        }
    }
};

/**
 * Create sample likes
 */
const createLikes = async (users, posts) => {
    logger.info('Creating sample likes...');

    // Create random likes for posts
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const numLikes = Math.floor(Math.random() * users.length) + 1;

        // Shuffle users and take first numLikes
        const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
        const likingUsers = shuffledUsers.slice(0, numLikes);

        for (const user of likingUsers) {
            try {
                // Don't let users like their own posts
                if (user.id !== post.authorId) {
                    await prisma.like.create({
                        data: {
                            userId: user.id,
                            postId: post.id
                        }
                    });
                    logger.info(`${user.username} liked post ${i}`);
                }
            } catch (error) {
                if (error.code === 'P2002') {
                    logger.warn(`Like already exists, skipping...`);
                } else {
                    logger.error('Failed to create like:', error);
                }
            }
        }
    }
};

/**
 * Create sample notifications
 */
const createNotifications = async (users, posts) => {
    logger.info('Creating sample notifications...');

    // Create some sample notifications
    const notifications = [
        {
            userId: users[0].id, // johndoe
            type: 'LIKE',
            message: `${users[1].firstName} ${users[1].lastName} liked your post`
        },
        {
            userId: users[0].id, // johndoe
            type: 'COMMENT',
            message: `${users[2].firstName} ${users[2].lastName} commented on your post`
        },
        {
            userId: users[1].id, // janesmith
            type: 'FOLLOW',
            message: `${users[0].firstName} ${users[0].lastName} started following you`
        },
        {
            userId: users[2].id, // mikejohnson
            type: 'LIKE',
            message: `${users[3].firstName} ${users[3].lastName} liked your post`
        }
    ];

    for (const notificationData of notifications) {
        try {
            await prisma.notification.create({
                data: notificationData
            });
            logger.info(`Created notification for user ${notificationData.userId}`);
        } catch (error) {
            logger.error('Failed to create notification:', error);
        }
    }
};

/**
 * Clear all data (for fresh seeding)
 */
const clearData = async () => {
    logger.info('Clearing existing data...');

    // Delete in correct order to respect foreign key constraints
    await prisma.notification.deleteMany();
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.user.deleteMany();

    logger.info('All data cleared');
};

/**
 * Main seeding function
 */
const seed = async () => {
    try {
        logger.info('🌱 Starting database seeding...');

        // Clear existing data
        await clearData();

        // Create sample data
        const users = await createUsers();
        await createFollows(users);
        const posts = await createPosts(users);
        await createComments(users, posts);
        await createLikes(users, posts);
        await createNotifications(users, posts);

        logger.info('✅ Database seeding completed successfully!');
        logger.info(`Created ${users.length} users, ${posts.length} posts, and sample interactions`);

        // Display login credentials
        console.log('\n📋 Sample User Credentials:');
        console.log('Email: john.doe@example.com | Password: password123');
        console.log('Email: jane.smith@example.com | Password: password123');
        console.log('Email: mike.johnson@example.com | Password: password123');
        console.log('Email: sarah.wilson@example.com | Password: password123');
        console.log('Email: alex.brown@example.com | Password: password123');

    } catch (error) {
        logger.error('❌ Database seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    seed().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}

module.exports = { seed, clearData };