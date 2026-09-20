const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@danphehealth.com';
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      console.error('NOT_FOUND');
      process.exit(2);
    }
    console.log(JSON.stringify({ email: user.email, role: user.role, id: user.id }));
  } catch (e) {
    console.error('ERROR', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
