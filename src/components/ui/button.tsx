import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-caramel text-primary-foreground shadow-[0_6px_20px_-8px_rgba(197,123,44,0.7)] hover:bg-caramel-deep hover:shadow-[0_10px_28px_-8px_rgba(197,123,44,0.8)]",
        cocoa:
          "bg-cocoa text-cream hover:bg-cocoa-deep shadow-[0_6px_20px_-10px_rgba(35,22,13,0.8)]",
        secondary:
          "bg-surface text-cocoa border border-border hover:border-caramel/60 hover:bg-cream-2",
        outline:
          "border border-cocoa/25 text-cocoa hover:bg-cocoa hover:text-cream",
        ghost: "text-cocoa hover:bg-cream-2",
        link: "text-caramel-deep underline-offset-4 hover:underline",
        danger: "bg-danger text-white hover:brightness-95",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-[3.25rem] px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
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
