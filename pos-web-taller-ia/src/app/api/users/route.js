import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { hashPassword } from "../../../lib/auth";

function mapUser(user) {
  if (!user) return null;

  return {
    id: user.user_id,
    correo: user.correo,
    nombreUsuario: user.nombreUsuario,
    activo: user.activo,
    fechaCreacion: user.fechaCreacion,
  };
}

function resolveActivoInput(value) {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }

  return undefined;
}

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      orderBy: { user_id: "desc" },
      select: {
        user_id: true,
        correo: true,
        nombreUsuario: true,
        activo: true,
        fechaCreacion: true,
      },
    });

    return NextResponse.json(users.map(mapUser));
  } catch (error) {
    console.error("Error al listar usuarios", error);
    return NextResponse.json(
      { message: "No se pudieron obtener los usuarios." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { correo, password, nombreUsuario, activo } = body ?? {};

    if (!correo || !password || !nombreUsuario) {
      return NextResponse.json(
        { message: "Correo, contraseña y nombre de usuario son obligatorios." },
        { status: 400 },
      );
    }

    const activoValue = resolveActivoInput(activo);

    if (activo !== undefined && activoValue === undefined) {
      return NextResponse.json(
        { message: "El campo 'activo' debe ser booleano, 1/0 o true/false." },
        { status: 400 },
      );
    }

    const hashedPassword = hashPassword(password);

    const newUser = await prisma.users.create({
      data: {
        correo,
        password: hashedPassword,
        nombreUsuario,
        activo: activoValue ?? true,
      },
      select: {
        user_id: true,
        correo: true,
        nombreUsuario: true,
        activo: true,
        fechaCreacion: true,
      },
    });

    return NextResponse.json(mapUser(newUser), { status: 201 });
  } catch (error) {
    console.error("Error al crear usuario", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Ya existe un usuario con ese correo." },
        { status: 409 },
      );
    }

    const statusCode =
      typeof error.message === "string" && error.message.includes("contraseña")
        ? 400
        : 500;

    return NextResponse.json(
      { message: error.message ?? "No se pudo crear el usuario." },
      { status: statusCode },
    );
  }
}
