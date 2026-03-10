import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@hubspot-clone.local',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });
    console.log('Created admin user: admin@hubspot-clone.local / admin123');
  } else {
    console.log('Admin user already exists, skipping seed');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
