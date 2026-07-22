import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    kind?: string; // "admin" | "customer"
    rol?: string;
    customerId?: string;
    phone?: string | null;
    requiresPhone?: boolean;
  }
  interface Session {
    user: {
      kind?: string;
      rol?: string;
      customerId?: string;
      phone?: string | null;
      requiresPhone?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    kind?: string;
    rol?: string;
    customerId?: string;
    phone?: string | null;
    requiresPhone?: boolean;
  }
}
