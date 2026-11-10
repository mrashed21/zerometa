"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { Toast as ToastPrimitive } from "radix-ui";
import * as React from "react";

const toastVariants = cva(
  [
    "group relative flex w-full items-start gap-3",
    "overflow-hidden rounded-xl border p-4 pr-8",
    "shadow-lg shadow-black/30 backdrop-blur-sm",
    "transition-all duration-300",
    "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-4 data-[state=open]:fade-in-0",
    "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full data-[state=closed]:fade-out-80",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full",
    "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out]",
  ],
  {
    variants: {
      variant: {
        default: "bg-white border-neutral-200 text-neutral-900 shadow-md",
        success: [
          "bg-emerald-50 border-emerald-200",
          "text-emerald-950 shadow-md",
        ],
        error: [
          "bg-red-50 border-red-200",
          "text-red-950 shadow-md",
        ],
        warning: [
          "bg-amber-50 border-amber-200",
          "text-amber-950 shadow-md",
        ],
        info: [
          "bg-blue-50 border-blue-200",
          "text-blue-950 shadow-md",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const iconMap: Record<string, React.ReactNode> = {
  success: (
    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
  ),
  error: (
    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
  ),
  warning: (
    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  ),
  info: (
    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  ),
};

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-100",
      "flex max-h-screen w-full flex-col-reverse gap-2 p-4",
      "sm:max-w-105",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

interface ToastProps
  extends
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, variant = "default", children, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  >
    {/* Icon */}
    {variant && variant !== "default" && iconMap[variant]}
    <div className="flex-1 min-w-0">{children}</div>

    <ToastPrimitive.Close
      className={cn(
        "absolute right-2 top-2 rounded-md p-1",
        "text-muted-foreground opacity-60",
        "transition-opacity hover:opacity-100",
        "focus:outline-none focus:ring-1 focus:ring-ring",
        "group-hover:opacity-100",
      )}
      aria-label="Close notification"
    >
      <X className="h-3.5 w-3.5" />
    </ToastPrimitive.Close>
  </ToastPrimitive.Root>
));
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-tight", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn(
      "mt-0.5 text-xs text-muted-foreground leading-relaxed",
      className,
    )}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

const ToastAction = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      "mt-2 inline-flex h-7 shrink-0 items-center justify-center",
      "rounded-md border border-border px-3 text-xs font-medium",
      "text-foreground/80 transition-colors",
      "hover:bg-muted hover:text-foreground",
      "focus:outline-none focus:ring-1 focus:ring-ring",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

export interface ToastMessage {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: ToastMessage[];
  toast: (msg: Omit<ToastMessage, "id">) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback((msg: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...msg, id }]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = React.useCallback(() => setToasts([]), []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      <ToastProvider swipeDirection="right">
        {children}

        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            duration={t.duration ?? 5000}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id);
            }}
          >
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            {t.description && (
              <ToastDescription>{t.description}</ToastDescription>
            )}
            {t.action && (
              <ToastAction altText={t.action.label} onClick={t.action.onClick}>
                {t.action.label}
              </ToastAction>
            )}
          </Toast>
        ))}

        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx)
    throw new Error("useToast must be used inside <ToastContextProvider>");
  return ctx;
}

export {
  Toast,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
};
