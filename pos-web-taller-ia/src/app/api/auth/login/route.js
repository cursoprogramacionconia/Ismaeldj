import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { verifyPassword } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { correo, password } = body ?? {};

    if (!correo || !password) {
      return NextResponse.json(
        { message: "Debe proporcionar correo y contraseña." },
        { status: 400 },
      );
    }

    const user = await prisma.users.findUnique({
      where: { correo },
      select: {
        user_id: true,
        correo: true,
        password: true,
        nombreUsuario: true,
        activo: true,
        fechaCreacion: true,
      },
    });

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json(
        { message: "Credenciales inválidas." },
        { status: 401 },
      );
    }

    if (!user.activo) {
      return NextResponse.json(
        { message: "El usuario está inactivo. Contacte al administrador." },
        { status: 403 },
      );
    }

    return NextResponse.json({
      message: "Inicio de sesión exitoso.",
      usuario: {
        id: user.user_id,
        correo: user.correo,
        nombreUsuario: user.nombreUsuario,
        activo: user.activo,
        fechaCreacion: user.fechaCreacion,
      },
      puerto: process.env.PORT ?? "3000",
    });
  } catch (error) {
    console.error("Error al iniciar sesión", error);
    return NextResponse.json(
      { message: "No se pudo completar el inicio de sesión." },
      { status: 500 },
    );
  }
}
