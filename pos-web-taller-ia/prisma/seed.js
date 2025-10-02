const { PrismaClient } = require("@prisma/client");
const { randomBytes, scryptSync } = require("crypto");

const prisma = new PrismaClient();
const KEY_LENGTH = 64;

function hashPassword(password) {
  if (typeof password !== "string" || password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function upsertAdminUser() {
  const correo = "admin@admin.com";
  const password = "123456";

  const hashedPassword = hashPassword(password);

  await prisma.users.upsert({
    where: { correo },
    update: {},
    create: {
      correo,
      password: hashedPassword,
      nombreUsuario: "Administrador",
      activo: true,
    },
  });
}

async function main() {
  await upsertAdminUser();
  console.log("Usuario administrador asegurado correctamente.");
}

main()
  .catch((error) => {
    console.error("Error al ejecutar el seed de Prisma", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
