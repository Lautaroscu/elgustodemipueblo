import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db";
import { adminLoginSchema } from "@/lib/validations";

const googleId = process.env.GOOGLE_CLIENT_ID ?? "";
const googleSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";

/** Google se ofrece sólo si está configurado (nunca bloquea el checkout). */
export const isGoogleConfigured = googleId.length > 10 && googleSecret.length > 5;

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Contraseña", type: "password" },
    },
    async authorize(credentials) {
      const parsed = adminLoginSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const user = await prisma.adminUser.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });
      if (!user) return null;

      const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!ok) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.nombre,
        kind: "admin",
        rol: user.rol,
      };
    },
  }),
];

if (isGoogleConfigured) {
  providers.push(
    Google({
      clientId: googleId,
      clientSecret: googleSecret,
      // Crea/vincula el Customer en el momento del login (Node, con Prisma).
      async profile(profile) {
        const email = profile.email;
        const customer = await prisma.customer.upsert({
          where: { email },
          create: {
            email,
            nombre: profile.name ?? "Cliente",
            googleId: profile.sub,
            imagen: profile.picture,
          },
          update: {
            googleId: profile.sub,
            imagen: profile.picture,
            ...(profile.name ? { nombre: profile.name } : {}),
          },
        });
        return {
          id: customer.id,
          email: customer.email ?? email,
          name: customer.nombre,
          image: customer.imagen,
          kind: "customer",
          customerId: customer.id,
          phone: customer.telefono,
          requiresPhone: !customer.telefono,
        };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
});
