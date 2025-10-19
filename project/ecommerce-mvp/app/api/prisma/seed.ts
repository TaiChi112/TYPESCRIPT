import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Laptop Pro 15"',
        description: 'High-performance laptop with 16GB RAM and 512GB SSD',
        price: 1299.99,
        stock: 15,
        imageUrl: 'https://via.placeholder.com/300x200?text=Laptop',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking',
        price: 29.99,
        stock: 50,
        imageUrl: 'https://via.placeholder.com/300x200?text=Mouse',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mechanical Keyboard',
        description: 'RGB backlit mechanical keyboard with blue switches',
        price: 89.99,
        stock: 30,
        imageUrl: 'https://via.placeholder.com/300x200?text=Keyboard',
      },
    }),
    prisma.product.create({
      data: {
        name: 'USB-C Hub',
        description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader',
        price: 49.99,
        stock: 25,
        imageUrl: 'https://via.placeholder.com/300x200?text=USB-Hub',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Noise-Cancelling Headphones',
        description: 'Premium wireless headphones with active noise cancellation',
        price: 199.99,
        stock: 20,
        imageUrl: 'https://via.placeholder.com/300x200?text=Headphones',
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'user@test.com',
        password: '$2a$10$X9JQrH9P.HlE3y7Y7J9pYeSVQ5cZ7sJ7h0F4K9gQ8aY3J9pYe9pYe', // TestPass123!
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: '$2a$10$X9JQrH9P.HlE3y7Y7J9pYeSVQ5cZ7sJ7h0F4K9gQ8aY3J9pYe9pYe', // AdminPass123!
        role: 'ADMIN',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
