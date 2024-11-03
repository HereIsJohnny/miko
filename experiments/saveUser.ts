import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const generateRandomUser = () => {
  return {
    email: `user-${Math.random()}@example.com`,
    name: `User ${Math.random()}`,
  };
};

async function main() {
  console.log("--- start create user");
  const user = await prisma.user.create({
    data: generateRandomUser(),
  });
  console.log("Created user:", user);
}

await main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });

async function listUsers() {
  console.log("--- start list users");
  const users = await prisma.user.findMany();
  console.log("All users:", users);
}

await listUsers();
