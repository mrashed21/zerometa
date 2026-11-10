export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://www.zerometa.tech/#founder",
        name: "Muhammad Rashed",
        jobTitle: "Full Stack Developer",
        image: "https://www.zerometa.tech/muhammad_rashed.webp",
        url: "https://www.mrashed21.me/",
        sameAs: [
          "https://www.mrashed21.me/",
          "https://muhammadrashed.dev/",
          "https://github.com/mrashed21",
          "https://linkedin.com/in/mrashed21",
        ],
        knowsAbout: [
          "Full Stack Software Development",
          "React",
          "Next.js",
          "Node.js",
          "Client-Side Privacy Architecture",
          "Metadata Sanitization",
        ],
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://www.zerometa.tech/#app",
        name: "ZeroMeta",
        url: "https://www.zerometa.tech",
        description:
          "Privacy-focused digital media privacy toolkit to inspect, remove, compare, and edit EXIF, IPTC, XMP, and GPS metadata across images, videos, audio, and PDF documents completely offline.",
        applicationCategory: "SecurityApplication",
        operatingSystem: "Web Browser (Chrome, Safari, Firefox, Edge)",
        author: {
          "@type": "Person",
          "@id": "https://www.zerometa.tech/#founder",
          name: "Muhammad Rashed",
        },
        founder: {
          "@type": "Person",
          "@id": "https://www.zerometa.tech/#founder",
          name: "Muhammad Rashed",
          url: "https://www.mrashed21.me/",
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Client-side EXIF removal",
          "GPS coordinate stripping",
          "PDF document metadata cleaner",
          "Audio ID3 tag cleaner",
          "Video QuickTime atom neutralizer",
          "Face and license plate blur redaction",
          "Before and after metadata comparison",
        ],
      },
      {
        "@type": "Organization",
        "@id": "https://www.zerometa.tech/#organization",
        name: "ZeroMeta",
        url: "https://www.zerometa.tech",
        logo: "https://www.zerometa.tech/icon-512.png",
        founder: {
          "@type": "Person",
          "@id": "https://www.zerometa.tech/#founder",
          name: "Muhammad Rashed",
          url: "https://www.mrashed21.me/",
        },
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.zerometa.tech/#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "Why should I remove EXIF metadata before sharing photos?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Photos and videos automatically capture hidden metadata including exact GPS coordinates, camera serial numbers, and device models. Removing this data protects your identity and exact physical location when sharing online.",
            },
          },
          {
            "@type": "Question",
            name: "Does ZeroMeta reduce image resolution or compress files?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. ZeroMeta preserves your original image resolution and pixel dimensions. Canvas re-encoding defaults to 95% high quality, and audio/video processing copies original streams without compression.",
            },
          },
          {
            "@type": "Question",
            name: "Does metadata removal remove visible watermarks or SynthID?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Metadata cleaning removes hidden digital header tags (EXIF, IPTC, XMP, GPS). Visible watermarks are drawn in image pixels and require pixel redaction. Invisible AI watermarks like Google SynthID are embedded in latent statistical distributions and cannot be removed via metadata stripping.",
            },
          },
          {
            "@type": "Question",
            name: "Is my media uploaded to a remote server?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "In standard client-side mode, all processing is performed locally in your web browser using HTML5 Canvas and WebAssembly. Your files are never uploaded to any remote server or persistent database.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
