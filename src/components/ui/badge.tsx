import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        health:
          "border-transparent bg-health-primary/20 text-health-primary dark:text-health-primary",
        income:
          "border-transparent bg-finance-income/20 text-emerald-700 dark:text-emerald-400",
        expense:
          "border-transparent bg-finance-expense/20 text-rose-700 dark:text-rose-400",
        pending:
          "border-transparent bg-finance-pending/20 text-amber-700 dark:text-amber-400",
        gemini:
          "border-transparent bg-gradient-to-r from-gemini-purple/20 via-gemini-blue/20 to-gemini-cyan/20 text-purple-700 dark:text-purple-300 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
