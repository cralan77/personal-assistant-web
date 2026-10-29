import { TrainingLoad } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

interface TrimpBadgeProps {
  trainingLoad?: TrainingLoad | null;
}

export function TrimpBadge({ trainingLoad }: TrimpBadgeProps) {
  if (!trainingLoad || trainingLoad.trimpScore <= 0) {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground">
        Sem dados de FC
      </Badge>
    );
  }

  const { trimpScore, exertionLevel } = trainingLoad;

  const getStyle = () => {
    switch (exertionLevel) {
      case "LIGHT":
        return "bg-zones-1/20 text-slate-700 dark:text-slate-300 border-zones-1/40";
      case "MODERATE":
        return "bg-zones-3/20 text-emerald-700 dark:text-emerald-400 border-zones-3/40";
      case "HARD":
        return "bg-zones-4/20 text-amber-700 dark:text-amber-400 border-zones-4/40";
      case "VERY_HARD":
        return "bg-zones-5/20 text-rose-700 dark:text-rose-400 border-zones-5/40";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getLabel = () => {
    switch (exertionLevel) {
      case "LIGHT":
        return "Leve";
      case "MODERATE":
        return "Moderado";
      case "HARD":
        return "Intenso";
      case "VERY_HARD":
        return "Exaustivo";
    }
  };

  return (
    <div
      className={`inline-flex items-center space-x-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStyle()}`}
      title={trainingLoad.description}
    >
      <Flame className="h-3 w-3" />
      <span>TRIMP {trimpScore}</span>
      <span className="opacity-70 font-normal">({getLabel()})</span>
    </div>
  );
}
