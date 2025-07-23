import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: hashedPassword,
    },
  });

  // Create test posts
  await prisma.post.createMany({
    data: [
      {
        title: 'Welcome to Cp-Vibe-Code',
        content: 'This is the first post in our application. Built with Next.js 15, Bun, and Prisma!',
        published: true,
        authorId: user1.id,
      },
      {
        title: 'Getting Started Guide',
        content: 'Learn how to use this full-stack application effectively.',
        published: true,
        authorId: user1.id,
      },
      {
        title: 'Draft Post',
        content: 'This is a draft post that is not yet published.',
        published: false,
        authorId: user2.id,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Test users created:');
  console.log('   - admin@example.com (password: password123)');
  console.log('   - user@example.com (password: password123)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
