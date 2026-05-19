"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-[color-mix(in_oklab,var(--primary)_88%,black)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-[color-mix(in_oklab,var(--secondary)_90%,white)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:opacity-90",
        outline:
          "border border-border bg-background hover:bg-muted/60 text-foreground",
        ghost: "hover:bg-muted/60 text-foreground",
        link: "text-[color:var(--link)] underline-offset-4 hover:underline",
        amazon:
          "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] border border-[color:var(--primary-strong)] shadow-sm hover:bg-[color:var(--primary-strong)] font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-6 text-base",
        icon: "size-10",
        pill: "h-9 rounded-full px-4",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
