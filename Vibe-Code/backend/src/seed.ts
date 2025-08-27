import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Sample data for proposal software
  const sampleData = [
    {
      name: 'PandaDoc',
      description: 'Complete document automation platform for creating, sending, and e-signing proposals',
      category: 'Document Automation',
      pricing: 'Starting at $19/month',
      features: ['E-signatures', 'Templates', 'Analytics', 'CRM Integration', 'Payment Processing'],
      website: 'https://www.pandadoc.com',
      company: 'PandaDoc Inc.',
      rating: 4.5,
      reviewCount: 1250,
    },
    {
      name: 'Proposify',
      description: 'Proposal software that helps sales teams create winning proposals faster',
      category: 'Sales Proposals',
      pricing: 'Starting at $49/month',
      features: ['Proposal Templates', 'Content Library', 'E-signatures', 'Analytics', 'Team Collaboration'],
      website: 'https://www.proposify.com',
      company: 'Proposify',
      rating: 4.3,
      reviewCount: 890,
    },
    {
      name: 'HubSpot Sales Hub',
      description: 'All-in-one sales software with proposal and quote capabilities',
      category: 'CRM & Sales',
      pricing: 'Free tier available, paid plans from $45/month',
      features: ['CRM Integration', 'Quote Builder', 'Deal Tracking', 'Email Templates', 'Reporting'],
      website: 'https://www.hubspot.com/products/sales',
      company: 'HubSpot',
      rating: 4.4,
      reviewCount: 2150,
    },
    {
      name: 'Qwilr',
      description: 'Interactive proposals and quotes that look like web pages',
      category: 'Interactive Proposals',
      pricing: 'Starting at $35/month',
      features: ['Interactive Content', 'Analytics', 'E-signatures', 'Payment Integration', 'Custom Branding'],
      website: 'https://qwilr.com',
      company: 'Qwilr',
      rating: 4.2,
      reviewCount: 670,
    },
  ];

  console.log('🌱 Seeding database...');

  for (const data of sampleData) {
    await prisma.proposalSoftware.create({
      data,
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
