"use client";

import { Button } from "@/components/ui/button";
import { Check, Download, Share2 } from "lucide-react";
import { useCallback, useState } from "react";

interface ShareButtonProps {
  blob: Blob;
  fileName: string;
}

export function ShareButton({ blob, fileName }: ShareButtonProps) {
  const [shared, setShared] = useState(false);

  const canShare =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function";

  const handleShare = useCallback(async () => {
    try {
      const file = new File([blob], fileName, { type: blob.type });
      const shareData = { files: [file], title: "CleanExif AI - Processed Image" };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } else {
        downloadBlob(blob, fileName);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        
        downloadBlob(blob, fileName);
      }
    }
  }, [blob, fileName]);

  const handleDownload = useCallback(() => {
    downloadBlob(blob, fileName);
  }, [blob, fileName]);

  if (canShare) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="gap-1.5"
      >
        {shared ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Shared!
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5" />
            Share
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      className="gap-1.5"
    >
      <Download className="w-3.5 h-3.5" />
      Download
    </Button>
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
