import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    kind?: string; // "admin" | "customer"
    rol?: string;
    customerId?: string;
  }
  interface Session {
    user: {
      kind?: string;
      rol?: string;
      customerId?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    kind?: string;
    rol?: string;
    customerId?: string;
  }
}
