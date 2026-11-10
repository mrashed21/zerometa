import type {
  AudioProcessingOptions,
  BrandingConfig,
  ImageProcessingOptions,
  PrivacyMode,
  VideoProcessingOptions,
} from "./types";

/** The default privacy mode on first load */
export const DEFAULT_PRIVACY_MODE: PrivacyMode = "privacy-clean";

export const DEFAULT_BRANDING_CONFIG: BrandingConfig = {
  creator: "",
  author: "",
  software: "ZeroMeta Toolkit",
  keywords: [],
};

export const DEFAULT_IMAGE_OPTIONS: ImageProcessingOptions = {
  removeExif: true,
  removeGps: true,
  removeIptc: true,
  removeXmp: true,
  preserveOrientation: true,
  preserveDimensions: true,
  outputFormat: "jpeg",
  outputQuality: 95,
  microCrop: 0,
  colorShift: 0,
  noiseInjection: 0,
};

export const DEFAULT_VIDEO_OPTIONS: VideoProcessingOptions = {
  removeMetadata: true,
  preserveResolution: true,
  preserveAudio: true,
  forceReencode: false,
};

export const DEFAULT_AUDIO_OPTIONS: AudioProcessingOptions = {
  removeId3Tags: true,
  removeArtist: true,
  removeAlbum: true,
  removeTitle: true,
  removeComment: true,
  removeEncoder: true,
  preserveAudioQuality: true,
};

/** EXIF / IPTC / XMP tags that reveal GPS / location data */
export const GPS_TAGS = new Set([
  "GPSLatitude",
  "GPSLongitude",
  "GPSAltitude",
  "GPSLatitudeRef",
  "GPSLongitudeRef",
  "GPSAltitudeRef",
  "GPSTimeStamp",
  "GPSDateStamp",
  "GPSImgDirection",
  "GPSImgDirectionRef",
  "GPSSpeed",
  "GPSSpeedRef",
  "GPSTrack",
  "GPSTrackRef",
  "GPSMapDatum",
  "GPSDestLatitude",
  "GPSDestLongitude",
  "GPSDestBearing",
  "GPS",
]);

/** EXIF tags that reveal camera / device information */
export const CAMERA_TAGS = new Set([
  "Make",
  "Model",
  "Software",
  "LensMake",
  "LensModel",
  "LensInfo",
  "FocalLength",
  "FocalLengthIn35mmFormat",
  "Aperture",
  "FNumber",
  "ShutterSpeedValue",
  "ExposureTime",
  "ISOSpeedRatings",
  "ISO",
  "ExposureMode",
  "ExposureProgram",
  "WhiteBalance",
  "Flash",
  "MeteringMode",
  "Saturation",
  "Sharpness",
  "Contrast",
  "SceneCaptureType",
  "BodySerialNumber",
  "LensSerialNumber",
  "CameraOwnerName",
]);

/** Tags indicating AI-generated or AI-processed content */
export const AI_TAGS = new Set([
  "C2PA",
  "c2pa",
  "SynthID",
  "synthid",
  "StableDiffusion",
  "AUTOMATIC1111",
  "MidJourney",
  "midjourney",
  "DALL-E",
  "StabilityAI",
  "Generator",
  "AIGenerator",
  "GenerativeModel",
]);

/** Software / editor tags */
export const SOFTWARE_TAGS = new Set([
  "Software",
  "ProcessingSoftware",
  "CreatorTool",
  "HistorySoftwareAgent",
  "WriterName",
  "Photoshop",
  "XMPToolkit",
  "AdobePhotoshop",
]);

/** IPTC fields to strip */
export const IPTC_TAGS = new Set([
  "By-line",
  "By-lineTitle",
  "Caption-Abstract",
  "City",
  "Contact",
  "ContentLocationCode",
  "ContentLocationName",
  "Country-PrimaryLocationCode",
  "Country-PrimaryLocationName",
  "Credit",
  "DateCreated",
  "Headline",
  "Keywords",
  "ObjectName",
  "OriginalTransmissionReference",
  "Province-State",
  "Source",
  "SpecialInstructions",
  "Sub-location",
  "SupplementalCategories",
  "TimeCreated",
  "Writer-Editor",
]);

/** Audio ID3 tags to strip */
export const ID3_TAGS_TO_STRIP = [
  "title",
  "artist",
  "album",
  "albumartist",
  "comment",
  "composer",
  "genre",
  "date",
  "year",
  "track",
  "disc",
  "encoder",
  "encoded_by",
  "copyright",
  "description",
  "grouping",
  "lyrics",
  "TXXX",
  "COMM",
  "USLT",
  "APIC",
] as const;

/** Video metadata keys to strip (FFmpeg tag names) */
export const VIDEO_METADATA_KEYS_TO_STRIP = [
  "title",
  "author",
  "artist",
  "album",
  "comment",
  "description",
  "encoder",
  "handler_name",
  "vendor_id",
  "creation_time",
  "location",
  "com.apple.quicktime.location.ISO6709",
  "com.apple.quicktime.make",
  "com.apple.quicktime.model",
  "com.apple.quicktime.software",
  "com.apple.quicktime.creationdate",
] as const;

export type MetadataCategory =
  | "camera"
  | "location"
  | "ai"
  | "software"
  | "other";

export function categorizeMetadataField(key: string): MetadataCategory {
  if (
    GPS_TAGS.has(key) ||
    key.toLowerCase().includes("gps") ||
    key.toLowerCase().includes("location")
  ) {
    return "location";
  }
  if (
    AI_TAGS.has(key) ||
    key.toLowerCase().includes("ai") ||
    key.toLowerCase().includes("synthid") ||
    key.toLowerCase().includes("c2pa")
  ) {
    return "ai";
  }
  if (
    SOFTWARE_TAGS.has(key) ||
    key.toLowerCase().includes("software") ||
    key.toLowerCase().includes("tool")
  ) {
    return "software";
  }
  if (CAMERA_TAGS.has(key)) {
    return "camera";
  }
  return "other";
}
