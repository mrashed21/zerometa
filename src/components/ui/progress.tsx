"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Progress as ProgressPrimitive } from "radix-ui";
import * as React from "react";

const progressTrackVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-neutral-200",
  {
    variants: {
      size: {
        xs: "h-1",
        sm: "h-1.5",
        default: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-300 ease-out rounded-full",
  {
    variants: {
      colorScheme: {
        brand: "bg-blue-600",
        success: "bg-emerald-600",
        danger: "bg-red-600",
        warning: "bg-amber-500",
        neutral: "bg-neutral-400",
      },
    },
    defaultVariants: {
      colorScheme: "brand",
    },
  },
);

export interface ProgressProps
  extends
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressTrackVariants>,
    VariantProps<typeof progressIndicatorVariants> {
  showLabel?: boolean;
  label?: string;
  indeterminate?: boolean;
}

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value,
      size,
      colorScheme,
      showLabel,
      label,
      indeterminate,
      ...props
    },
    ref,
  ) => (
    <div className="flex items-center gap-2 w-full">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressTrackVariants({ size }), "flex-1", className)}
        value={indeterminate ? undefined : value}
        {...props}
      >
        {indeterminate ? (
          /* Indeterminate: sliding shimmer */
          <div
            className={cn(
              "absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite]",
              "bg-linear-to-r from-transparent via-white/10 to-transparent",
            )}
          />
        ) : (
          <ProgressPrimitive.Indicator
            className={cn(progressIndicatorVariants({ colorScheme }))}
            style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
          />
        )}
      </ProgressPrimitive.Root>

      {showLabel && !indeterminate && (
        <span className="text-xs tabular-nums text-muted-foreground w-8 text-right shrink-0">
          {label ?? `${Math.round(value ?? 0)}%`}
        </span>
      )}
    </div>
  ),
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
