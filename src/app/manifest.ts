import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Serviceer — Service Marketplace",
    short_name: "Serviceer",
    description: "Find trusted service providers for plumbing, electrical, cleaning, and more.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    orientation: "portrait-primary",
    categories: ["business", "lifestyle"],
    icons: [
      { src: "/serviceer-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/serviceer-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
