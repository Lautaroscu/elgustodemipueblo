"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { saveSettings } from "@/data/settings";
import type { BusinessSettings } from "@/domain/settings";

export async function updateSettings(data: BusinessSettings) {
  await requireAdmin();
  await saveSettings(data);
  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracion");
  return { ok: true };
}
