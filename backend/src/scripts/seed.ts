import { PrismaClient } from '@prisma/client';
import { startOfDay } from 'date-fns';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Create sample users
    const user1 = await prisma.user.create({
      data: {
        fid: 1001,
        fname: 'alice',
        wallets: ['0x1234567890123456789012345678901234567890'],
        lensProfile: 'alice.lens',
        creditsBalanceCents: 1000, // $10.00 in credits
      }
    });

    const user2 = await prisma.user.create({
      data: {
        fid: 1002,
        fname: 'bob',
        wallets: ['0x2345678901234567890123456789012345678901'],
        lensProfile: 'bob.lens',
        creditsBalanceCents: 500, // $5.00 in credits
      }
    });

    const user3 = await prisma.user.create({
      data: {
        fid: 1003,
        fname: 'charlie',
        wallets: [],
        creditsBalanceCents: 2000, // $20.00 in credits
      }
    });

    console.log('👥 Created sample users');

    // Create sample posts
    const post1 = await prisma.post.create({
      data: {
        userId: user1.id,
        imageUrl: 'https://example.com/images/sample1.jpg',
        promptTag: 'nature',
        likeCountPublic: 5,
      }
    });

    const post2 = await prisma.post.create({
      data: {
        userId: user2.id,
        imageUrl: 'https://example.com/images/sample2.jpg',
        promptTag: 'architecture',
        likeCountPublic: 3,
      }
    });

    console.log('📸 Created sample posts');

    // Create sample notes
    await prisma.note.create({
      data: {
        userId: user1.id,
        entryNumber: 1,
        bodyMd: '# My First Note\n\nThis is a sample note in **Markdown** format!',
        isPublic: true,
      }
    });

    await prisma.note.create({
      data: {
        userId: user1.id,
        entryNumber: 2,
        bodyMd: '## Another Note\n\nThis one has some *italic* text and a [link](https://example.com).',
        isPublic: true,
      }
    });

    await prisma.note.create({
      data: {
        userId: user2.id,
        entryNumber: 1,
        bodyMd: '# Bob\'s Private Thoughts\n\nThis is a private note that only Bob can see.',
        isPublic: false,
      }
    });

    console.log('📝 Created sample notes');

    // Create today's daily tasks
    const today = startOfDay(new Date());
    const tasks = [
      {
        id: 'welcome_task',
        title: 'Welcome to Snel OS!',
        description: 'Complete your first action in the app',
        rewardType: 'free_image' as const,
      },
      {
        id: 'social_task',
        title: 'Be Social',
        description: 'Like 2 posts from other users',
        rewardType: 'free_like' as const,
      },
      {
        id: 'creator_task',
        title: 'Create Content',
        description: 'Post your first image',
        rewardType: 'free_image' as const,
      }
    ];

    await prisma.dailyTask.create({
      data: {
        dateUtc: today,
        tasksJson: tasks,
      }
    });

    console.log('📋 Created daily tasks');

    // Create sample eligibility records
    await prisma.eligibility.createMany({
      data: [
        { dateUtc: today, userId: user1.id, isEligible: true },
        { dateUtc: today, userId: user2.id, isEligible: true },
        { dateUtc: today, userId: user3.id, isEligible: false }, // No Lens profile
      ]
    });

    console.log('✅ Created eligibility records');

    // Create some sample chat messages
    await prisma.chatMessage.createMany({
      data: [
        {
          room: 'general',
          userId: user1.id,
          text: 'Hello everyone! 👋',
        },
        {
          room: 'general',
          userId: user2.id,
          text: 'Welcome to Snel OS chat!',
        },
        {
          room: 'dev',
          userId: user1.id,
          text: 'Testing the chat system... looks good! 🚀',
        }
      ]
    });

    console.log('💬 Created sample chat messages');

    // Initialize treasury
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();

    await prisma.treasury.create({
      data: {
        id: 'main',
        totalCredits: 0n,
        totalUsers: userCount,
        totalPosts: postCount,
      }
    });

    console.log('🏦 Initialized treasury');

    // Create some sample credits ledger entries
    await prisma.creditsLedger.createMany({
      data: [
        {
          userId: user1.id,
          deltaCents: 1000,
          reason: 'admin_adjustment',
          meta: { note: 'Initial credits' }
        },
        {
          userId: user2.id,
          deltaCents: 500,
          reason: 'admin_adjustment',
          meta: { note: 'Initial credits' }
        },
        {
          userId: user3.id,
          deltaCents: 2000,
          reason: 'admin_adjustment',
          meta: { note: 'Initial credits' }
        }
      ]
    });

    console.log('💰 Created credits ledger entries');

    console.log('✨ Database seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Posts: ${postCount}`);
    console.log(`   Notes: ${await prisma.note.count()}`);
    console.log(`   Chat Messages: ${await prisma.chatMessage.count()}`);
    console.log(`   Daily Tasks: ${tasks.length}`);

  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { seed };
