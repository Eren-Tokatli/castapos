import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const email = "admin@castapos.com";
  const password = "admin1234";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("already exists:", existing.email, existing.role);
    return;
  }
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      firstName: "Castapos",
      lastName: "Admin",
      role: "ADMIN",
    },
  });
  console.log("created:", user.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
