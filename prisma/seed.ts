import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Technology', slug: 'technology' },
  { name: 'Finance', slug: 'finance' },
  { name: 'Healthcare', slug: 'healthcare' },
  { name: 'Science', slug: 'science' },
  { name: 'Legal', slug: 'legal' },
  { name: 'Engineering', slug: 'engineering' },
  { name: 'Design', slug: 'design' },
  { name: 'Sales', slug: 'sales' },
  { name: 'Investment', slug: 'investment' },
  { name: 'Consulting', slug: 'consulting' },
  { name: 'Research', slug: 'research' },
  { name: 'Real Estate', slug: 'real-estate' },
  { name: 'Operations', slug: 'operations' },
  { name: 'Literature', slug: 'literature' },
  { name: 'AI', slug: 'ai' },
  { name: 'Media', slug: 'media' },
  { name: 'Entrepreneurship', slug: 'entrepreneurship' },
  { name: 'Data Science', slug: 'data-science' },
  { name: 'Cybersecurity', slug: 'cybersecurity' },
  { name: 'News', slug: 'news' },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log('Seeded 20 categories.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
