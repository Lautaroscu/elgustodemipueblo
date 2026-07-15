import "server-only";
import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? "";
const apiKey = process.env.CLOUDINARY_API_KEY ?? "";
const apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";

export function isCloudinaryConfigured(): boolean {
  return !!(cloudName && apiKey && apiSecret);
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/** Sube una imagen (data URL o URL remota) y devuelve url + publicId. */
export async function uploadImage(
  dataUrl: string,
): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary no está configurado.");
  }
  const res = await cloudinary.uploader.upload(dataUrl, {
    folder: "egmp/products",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return { url: res.secure_url, publicId: res.public_id };
}

export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured()) return;
  await cloudinary.uploader.destroy(publicId);
}
