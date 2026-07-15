import { cache } from "react";
import { prisma } from "@/lib/db";
import {
  BusinessSettings,
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
} from "@/domain/settings";

export const getSettings = cache(async (): Promise<BusinessSettings> => {
  const row = await prisma.setting.findUnique({ where: { clave: SETTINGS_KEY } });
  if (!row) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(row.valor as Partial<BusinessSettings>) };
});

export async function saveSettings(data: BusinessSettings) {
  await prisma.setting.upsert({
    where: { clave: SETTINGS_KEY },
    create: { clave: SETTINGS_KEY, valor: data },
    update: { valor: data },
  });
}
