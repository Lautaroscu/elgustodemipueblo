"use server";

import { signIn, signOut, isGoogleConfigured } from "@/auth";
import { getCustomerSession } from "@/lib/customer-auth";

export async function getCustomerSessionAction() {
  const session = await getCustomerSession();
  return {
    session,
    googleConfigured: isGoogleConfigured,
  };
}

export async function signInWithGoogle(redirectTo?: string) {
  await signIn("google", { redirectTo: redirectTo || "/mi-cuenta" });
}

export async function signOutCustomer(redirectTo?: string) {
  await signOut({ redirectTo: redirectTo || "/" });
}
