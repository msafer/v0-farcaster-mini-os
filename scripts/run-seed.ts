import { neon } from "@neondatabase/serverless"

// Simple Prisma-like client for seeding
const sql = neon(process.env.DATABASE_URL!)

async function runSeed() {
  console.log("🌱 Starting database seed...")

  try {
    // Create tables first
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        fid INTEGER UNIQUE NOT NULL,
        fname TEXT NOT NULL,
        wallets TEXT[] DEFAULT '{}',
        lens_profile TEXT,
        credits_balance_cents INTEGER DEFAULT 0,
        free_image_used_on TIMESTAMP,
        free_like_used_on TIMESTAMP,
        joined_at TIMESTAMP DEFAULT NOW(),
        last_reroll_at TIMESTAMP
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        prompt_tag TEXT,
        created_at_utc TIMESTAMP DEFAULT NOW(),
        like_count_public INTEGER DEFAULT 0
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        entry_number INTEGER NOT NULL,
        body_md TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        is_public BOOLEAN DEFAULT true,
        UNIQUE(user_id, entry_number)
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS daily_tasks (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        date_utc DATE UNIQUE NOT NULL,
        tasks_json JSONB NOT NULL
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        room TEXT NOT NULL,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS treasury (
        id TEXT PRIMARY KEY,
        total_credits BIGINT DEFAULT 0,
        total_posts INTEGER DEFAULT 0,
        total_users INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT NOW()
      );
    `

    console.log("📋 Created database tables")

    // Insert sample users
    const users = await sql`
      INSERT INTO users (fid, fname, wallets, lens_profile, credits_balance_cents)
      VALUES 
        (1001, 'alice', ARRAY['0x1234567890123456789012345678901234567890'], 'alice.lens', 1000),
        (1002, 'bob', ARRAY['0x2345678901234567890123456789012345678901'], 'bob.lens', 500),
        (1003, 'charlie', ARRAY[]::TEXT[], NULL, 2000)
      RETURNING id, fname;
    `

    console.log("👥 Created sample users:", users.map((u) => u.fname).join(", "))

    // Insert sample posts
    await sql`
      INSERT INTO posts (user_id, image_url, prompt_tag, like_count_public)
      VALUES 
        (${users[0].id}, '/serene-mountain-valley.png', 'nature', 5),
        (${users[1].id}, '/modern-architecture-building.png', 'architecture', 3);
    `

    console.log("📸 Created sample posts")

    // Insert sample notes
    await sql`
      INSERT INTO notes (user_id, entry_number, body_md, is_public)
      VALUES 
        (${users[0].id}, 1, '# My First Note\n\nThis is a sample note in **Markdown** format!', true),
        (${users[0].id}, 2, '## Another Note\n\nThis one has some *italic* text and a [link](https://example.com).', true),
        (${users[1].id}, 1, '# Bob''s Private Thoughts\n\nThis is a private note that only Bob can see.', false);
    `

    console.log("📝 Created sample notes")

    // Insert today's daily tasks
    const tasks = [
      {
        id: "welcome_task",
        title: "Welcome to Snel OS!",
        description: "Complete your first action in the app",
        rewardType: "free_image",
      },
      {
        id: "social_task",
        title: "Be Social",
        description: "Like 2 posts from other users",
        rewardType: "free_like",
      },
      {
        id: "creator_task",
        title: "Create Content",
        description: "Post your first image",
        rewardType: "free_image",
      },
    ]

    await sql`
      INSERT INTO daily_tasks (date_utc, tasks_json)
      VALUES (CURRENT_DATE, ${JSON.stringify(tasks)});
    `

    console.log("📋 Created daily tasks")

    // Insert sample chat messages
    await sql`
      INSERT INTO chat_messages (room, user_id, text)
      VALUES 
        ('lobby', ${users[0].id}, 'Hello everyone! 👋'),
        ('lobby', ${users[1].id}, 'Welcome to Snel OS chat!'),
        ('build', ${users[0].id}, 'Testing the chat system... looks good! 🚀');
    `

    console.log("💬 Created sample chat messages")

    // Initialize treasury
    const userCount = await sql`SELECT COUNT(*) as count FROM users`
    const postCount = await sql`SELECT COUNT(*) as count FROM posts`

    await sql`
      INSERT INTO treasury (id, total_credits, total_users, total_posts)
      VALUES ('main', 0, ${userCount[0].count}, ${postCount[0].count});
    `

    console.log("🏦 Initialized treasury")

    console.log("✨ Database seed completed successfully!")
    console.log("\n📊 Summary:")
    console.log(`   Users: ${userCount[0].count}`)
    console.log(`   Posts: ${postCount[0].count}`)
    console.log(`   Notes: 3`)
    console.log(`   Chat Messages: 3`)
    console.log(`   Daily Tasks: ${tasks.length}`)
  } catch (error) {
    console.error("❌ Error during seed:", error)
    throw error
  }
}

// Run the seed
runSeed().catch(console.error)
