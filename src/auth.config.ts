import type { NextAuthConfig } from "next-auth";

/**
 * Config base compartida (edge-safe, sin Prisma).
 * La usa el proxy para proteger /admin. Distingue dos tipos de sesión:
 *  - kind "admin"    → dueño/staff (login con credenciales)
 *  - kind "customer" → cliente (login con Google, opcional y no bloqueante)
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const kind = (auth?.user as { kind?: string } | undefined)?.kind;
      const isAdminArea = nextUrl.pathname.startsWith("/admin");
      const isLogin = nextUrl.pathname === "/admin/login";

      if (isLogin) {
        if (kind === "admin") {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }
      // El área /admin sólo para sesiones de tipo admin.
      if (isAdminArea) return kind === "admin";
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as {
          kind?: string;
          rol?: string;
          customerId?: string;
          phone?: string | null;
          requiresPhone?: boolean;
        };
        token.kind = u.kind;
        token.rol = u.rol;
        token.customerId = u.customerId;
        token.phone = u.phone;
        token.requiresPhone = u.requiresPhone;
        if (user.name) token.name = user.name;
        if (user.image) token.picture = user.image;
      }
      if (trigger === "update" && session) {
        if (session.customerId) token.customerId = session.customerId;
        if (session.phone !== undefined) token.phone = session.phone;
        if (session.requiresPhone !== undefined) token.requiresPhone = session.requiresPhone;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.kind = token.kind as string | undefined;
        session.user.rol = token.rol as string | undefined;
        session.user.customerId = token.customerId as string | undefined;
        session.user.phone = token.phone as string | null | undefined;
        session.user.requiresPhone = token.requiresPhone as boolean | undefined;
      }
      return session;
    },
  },
  providers: [], // se completan en auth.ts (Node)
} satisfies NextAuthConfig;
