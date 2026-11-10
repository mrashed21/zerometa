/* eslint-disable @next/next/no-img-element */
"use client";

import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CompareSliderProps {
  originalSrc?: string;
  processedSrc?: string;
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function CompareSlider({
  originalSrc,
  processedSrc,
  beforeImage,
  afterImage,
  beforeLabel = "Original",
  afterLabel = "Cleaned",
  className,
}: CompareSliderProps) {
  const actualOriginal = originalSrc || beforeImage || "";
  const actualProcessed = processedSrc || afterImage || "";
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    },
    [isDragging, handleMove],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    },
    [isDragging, handleMove],
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(0, prev - 2));
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(100, prev + 2));
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-neutral-100",
        className,
      )}
    >
      <div
        ref={containerRef}
        className="relative aspect-video cursor-col-resize select-none"
        onMouseDown={(e) => {
          handleMouseDown();
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          handleMouseDown();
          if (e.touches.length > 0) handleMove(e.touches[0].clientX);
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label="Compare before and after"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <img
          src={actualProcessed}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={actualOriginal}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-contain"
            style={{
              width: containerWidth > 0 ? `${containerWidth}px` : "100%",
              maxWidth: "none",
            }}
            draggable={false}
          />
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-600 shadow-sm z-10"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-neutral-300 shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-neutral-600" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 z-20">
          <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm text-xs font-semibold text-neutral-800 border border-neutral-200 shadow-xs">
            Original
          </span>
        </div>
        <div className="absolute top-3 right-3 z-20">
          <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm text-xs font-semibold text-emerald-700 border border-emerald-200 shadow-xs">
            Processed
          </span>
        </div>
      </div>
    </motion.div>
  );
}
