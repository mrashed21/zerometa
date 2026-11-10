import {
  FileSearch,
  Eraser,
  GitCompare,
  SlidersHorizontal,
  Camera,
  MapPin,
  FileText,
  EyeOff,
  Layers,
  type LucideIcon,
} from "lucide-react";

export interface ToolItem {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
}

export const TOOLS_LIST: ToolItem[] = [
  {
    title: "Metadata Viewer",
    href: "/metadata-viewer",
    description: "Deep inspection of EXIF, IPTC, XMP, GPS, camera details & C2PA",
    icon: FileSearch,
  },
  {
    title: "Metadata Remover",
    href: "/metadata-remover",
    description: "Strip all hidden tags while preserving original media dimensions & quality",
    icon: Eraser,
  },
  {
    title: "Metadata Comparison",
    href: "/metadata-comparison",
    description: "Compare original vs cleaned files with field-by-field diff reports",
    icon: GitCompare,
  },
  {
    title: "Metadata Editor",
    href: "/metadata-editor",
    description: "Customize Author, Creator, Copyright, and Description tags safely",
    icon: SlidersHorizontal,
  },
  {
    title: "EXIF Remover",
    href: "/exif-remover",
    description: "Specialized photography cleaner neutralizing camera & lens fingerprints",
    icon: Camera,
  },
  {
    title: "GPS Metadata Remover",
    href: "/gps-remover",
    description: "Detect & strip geolocation coordinates and altitude records",
    icon: MapPin,
  },
  {
    title: "PDF Metadata Cleaner",
    href: "/pdf-metadata-remover",
    description: "Sanitize PDF Document Info dictionaries and XMP packages",
    icon: FileText,
  },
  {
    title: "Image Privacy Tools",
    href: "/image-privacy-tools",
    description: "Interactive browser canvas for face blur, license plate blur & redaction",
    icon: EyeOff,
  },
  {
    title: "Batch Media Cleaner",
    href: "/batch-metadata-remover",
    description: "Bulk cleaner supporting up to 50+ images, videos, audio & PDFs with ZIP export",
    icon: Layers,
  },
];

