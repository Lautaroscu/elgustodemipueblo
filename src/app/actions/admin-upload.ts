"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { uploadImage, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function uploadProductImage(
  dataUrl: string,
): Promise<
  | { ok: true; url: string; publicId: string }
  | { ok: false; error: string }
> {
  await requireAdmin();
  if (!isCloudinaryConfigured()) {
    return {
      ok: false,
      error:
        "Cloudinary no está configurado. Podés pegar la URL de una imagen mientras tanto.",
    };
  }
  try {
    const { url, publicId } = await uploadImage(dataUrl);
    return { ok: true, url, publicId };
  } catch {
    return { ok: false, error: "No se pudo subir la imagen." };
  }
}
