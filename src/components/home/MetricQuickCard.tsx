import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricQuickCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
}

export function MetricQuickCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  trend,
  onClick,
}: MetricQuickCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "border-border shadow-sm transition-all hover:shadow-md",
        onClick && "cursor-pointer hover:border-health-primary/50"
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              iconBg,
              iconColor
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 min-w-0">
          <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground truncate" title={String(value)}>
            {value}
          </h3>
          {(subtitle || trend) && (
            <div className="mt-1 flex items-center space-x-2 text-xs">
              {trend && (
                <span
                  className={cn(
                    "font-semibold",
                    trend.isPositive ? "text-emerald-500" : "text-rose-500"
                  )}
                >
                  {trend.value}
                </span>
              )}
              {subtitle && (
                <span className="text-muted-foreground truncate">{subtitle}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
