import "server-only";
import { auth } from "@/auth";

/** Lanza si no hay sesión de admin. Usar al inicio de cada server action admin. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado.");
  }
  return session.user;
}
