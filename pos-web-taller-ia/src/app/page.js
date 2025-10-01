"use client";

import { useState } from "react";

export default function Home() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [recordar, setRecordar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMensaje("");
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password, recordar }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "No se pudo iniciar sesión.");
      }

      setMensaje(
        `Bienvenido ${data.usuario?.nombreUsuario ?? ""}. Puerto activo: ${data.puerto}`,
      );
    } catch (err) {
      setError(err.message ?? "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.12),_transparent_55%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl grid gap-12 rounded-3xl bg-slate-900/70 p-10 shadow-2xl backdrop-blur-md sm:grid-cols-[1.1fr_1fr]">
          <div className="hidden flex-col justify-between text-slate-200 sm:flex">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Panel Administrativo</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight">
                Controla tus usuarios y ventas con una sola plataforma.
              </h1>
              <p className="mt-6 text-base text-slate-300">
                Accede al panel centralizado para gestionar inventario, ventas y reportes en cuestión de segundos.
                Refuerza la seguridad de tu operación con credenciales únicas y auditorías automáticas.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/50 p-6">
              <p className="text-sm font-medium text-slate-200">¿Necesitas una cuenta?</p>
              <p className="mt-2 text-sm text-slate-400">
                Contacta al equipo de TI para habilitar tu usuario o restablecer el acceso de tu equipo.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/60 bg-slate-950/50 p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Iniciar sesión</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Ingresa tus credenciales corporativas para continuar.
                </p>
              </div>
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
                Acceso seguro
              </span>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {mensaje && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {mensaje}
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="correo">
                  Correo corporativo
                </label>
                <input
                  id="correo"
                  type="email"
                  required
                  autoComplete="email"
                  value={correo}
                  onChange={(event) => setCorreo(event.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="tu.nombre@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={recordar}
                    onChange={(event) => setRecordar(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  Recordar este dispositivo
                </label>
                <a className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200" href="#">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-400 hover:via-sky-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Verificando credenciales..." : "Entrar al panel"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-500">
              Acceso cifrado y monitoreado. Si detectas algún inconveniente con tu inicio de sesión comunícate con la mesa de ayuda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
