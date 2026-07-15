import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "El Gusto",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6ec",
    theme_color: "#c57b2c",
    lang: "es-AR",
    categories: ["food", "shopping"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
