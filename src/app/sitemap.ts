import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.zerometa.tech";
  const now = new Date();

  const routes = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/metadata-remover", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/metadata-viewer", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/metadata-comparison", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/metadata-editor", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/exif-remover", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/gps-remover", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/pdf-metadata-remover", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/image-privacy-tools", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/batch-metadata-remover", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/image-metadata-remover", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/video-metadata-remover", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/audio-metadata-remover", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/guides", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/guides/what-is-exif", priority: 0.75, changeFrequency: "monthly" as const },
    { path: "/guides/how-to-remove-photo-location", priority: 0.75, changeFrequency: "monthly" as const },
    { path: "/guides/what-is-image-metadata", priority: 0.75, changeFrequency: "monthly" as const },
    { path: "/guides/metadata-vs-watermark", priority: 0.75, changeFrequency: "monthly" as const },
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
