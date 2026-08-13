import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "\n❌  Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env\n" +
        "   Add them to your .env file, e.g.:\n" +
        "     ADMIN_EMAIL=admin@danphehealth.com\n" +
        "     ADMIN_PASSWORD=your-secure-password\n",
    );
    process.exit(1);
  }

  // Idempotent — skip if admin already exists
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`\n✔  Admin user already exists: ${email}`);
    console.log(`   Role: ${existing.role}`);
    return;
  }

  const passwordHash = await hash(password, 12);

  const admin = await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      name: "Danphe Admin",
      role: "SUPER_ADMIN",
    },
  });

  console.log(`\n✔  SUPER_ADMIN created successfully:`);
  console.log(`   Email : ${admin.email}`);
  console.log(`   Role  : ${admin.role}`);
  console.log(`   ID    : ${admin.id}\n`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
