import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-xs",
        secondary: "border-border bg-muted text-muted-foreground",
        outline: "border-border bg-background text-foreground/80",

        brand:
          "border-blue-200 bg-blue-50 text-blue-700",

        purple:
          "border-purple-200 bg-purple-50 text-purple-700",

        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700",

        warning:
          "border-amber-200 bg-amber-50 text-amber-700",

        destructive:
          "border-red-200 bg-red-50 text-red-700",

        processing:
          "border-blue-200 bg-blue-50 text-blue-700 animate-pulse",
      },

      size: {
        sm: "text-[10px] px-2 py-px",
        default: "text-xs   px-2.5 py-0.5",
        lg: "text-sm   px-3 py-1 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
