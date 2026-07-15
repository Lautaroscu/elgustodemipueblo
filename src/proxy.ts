import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Proxy (ex middleware) edge-safe: sólo usa la config base (sin Prisma).
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
