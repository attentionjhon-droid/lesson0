import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      coupons: 500,
      name: 'Bosh Administrator',
    },
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      coupons: 500,
      name: 'Bosh Administrator',
    },
  });

  console.log('Admin account successfully configured:', {
    id: admin.id,
    username: admin.username,
    role: admin.role,
    coupons: admin.coupons,
    name: admin.name,
    passwordHashed: admin.password.startsWith('$2'),
  });
}

main()
  .catch((e) => {
    console.error('Error configuring admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
