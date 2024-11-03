import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("--- start create user");
  const user = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice",
    },
  });
  console.log("Created user:", user);
}

await main();

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

async function listUsers() {
  console.log("--- start list users");
  const users = await prisma.user.findMany();
  console.log("All users:", users);
}

await listUsers();
