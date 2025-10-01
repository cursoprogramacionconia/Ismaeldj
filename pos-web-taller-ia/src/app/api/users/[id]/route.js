import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/auth";

function parseUserId(id) {
  const parsed = Number(id);
  return Number.isInteger(parsed) ? parsed : null;
}

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

export async function GET(_request, { params }) {
  const userId = parseUserId(params?.id);

  if (userId === null) {
    return NextResponse.json({ message: "Identificador inválido." }, { status: 400 });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        correo: true,
        nombreUsuario: true,
        activo: true,
        fechaCreacion: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    return NextResponse.json(mapUser(user));
  } catch (error) {
    console.error("Error al obtener usuario", error);
    return NextResponse.json(
      { message: "No se pudo obtener el usuario." },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  const userId = parseUserId(params?.id);

  if (userId === null) {
    return NextResponse.json({ message: "Identificador inválido." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { correo, password, nombreUsuario, activo } = body ?? {};

    const data = {};

    if (correo !== undefined) data.correo = correo;
    if (nombreUsuario !== undefined) data.nombreUsuario = nombreUsuario;
    if (password) data.password = hashPassword(password);

    const activoValue = resolveActivoInput(activo);

    if (activo !== undefined && activoValue === undefined) {
      return NextResponse.json(
        { message: "El campo 'activo' debe ser booleano, 1/0 o true/false." },
        { status: 400 },
      );
    }

    if (activoValue !== undefined) {
      data.activo = activoValue;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "Debe proporcionar al menos un campo para actualizar." },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.users.update({
      where: { user_id: userId },
      data,
      select: {
        user_id: true,
        correo: true,
        nombreUsuario: true,
        activo: true,
        fechaCreacion: true,
      },
    });

    return NextResponse.json(mapUser(updatedUser));
  } catch (error) {
    console.error("Error al actualizar usuario", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Ya existe un usuario con ese correo." },
        { status: 409 },
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Usuario no encontrado." },
        { status: 404 },
      );
    }

    const statusCode =
      typeof error.message === "string" && error.message.includes("contraseña")
        ? 400
        : 500;

    return NextResponse.json(
      { message: error.message ?? "No se pudo actualizar el usuario." },
      { status: statusCode },
    );
  }
}

export async function DELETE(_request, { params }) {
  const userId = parseUserId(params?.id);

  if (userId === null) {
    return NextResponse.json({ message: "Identificador inválido." }, { status: 400 });
  }

  try {
    await prisma.users.delete({ where: { user_id: userId } });
    return NextResponse.json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar usuario", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Usuario no encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "No se pudo eliminar el usuario." },
      { status: 500 },
    );
  }
}
