import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium leading-none",
  {
    variants: {
      variant: {
        default: "bg-cream-2 text-cocoa-soft",
        caramel: "bg-caramel/15 text-caramel-deep",
        cocoa: "bg-cocoa text-cream",
        berry: "bg-berry/12 text-berry",
        success: "bg-success/15 text-success",
        outline: "border border-border text-cocoa-soft",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
