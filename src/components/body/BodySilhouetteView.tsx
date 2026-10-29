import { CircumferenceMeasurements, SkinfoldMeasurements } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler, Sparkles } from "lucide-react";

interface BodySilhouetteViewProps {
  circumferences?: CircumferenceMeasurements | null;
  skinfolds?: SkinfoldMeasurements | null;
}

export function BodySilhouetteView({
  circumferences,
  skinfolds,
}: BodySilhouetteViewProps) {
  const circItems = [
    { label: "Pescoço", value: circumferences?.neckCm, unit: "cm" },
    { label: "Tórax", value: circumferences?.chestCm, unit: "cm" },
    { label: "Braço Direito", value: circumferences?.rightArmCm, unit: "cm" },
    { label: "Braço Esquerdo", value: circumferences?.leftArmCm, unit: "cm" },
    { label: "Cintura", value: circumferences?.waistCm, unit: "cm" },
    { label: "Abdômen", value: circumferences?.abdomenCm, unit: "cm" },
    { label: "Quadril", value: circumferences?.hipsCm, unit: "cm" },
    { label: "Coxa Direita", value: circumferences?.rightThighCm, unit: "cm" },
    { label: "Coxa Esquerda", value: circumferences?.leftThighCm, unit: "cm" },
    { label: "Panturrilha Dir.", value: circumferences?.rightCalfCm, unit: "cm" },
    { label: "Panturrilha Esq.", value: circumferences?.leftCalfCm, unit: "cm" },
  ];

  const skinfoldItems = [
    { label: "Peitoral", value: skinfolds?.chestMm, unit: "mm" },
    { label: "Abdominal", value: skinfolds?.abdominalMm, unit: "mm" },
    { label: "Coxa", value: skinfolds?.thighMm, unit: "mm" },
    { label: "Tríceps", value: skinfolds?.tricepsMm, unit: "mm" },
    { label: "Subescapular", value: skinfolds?.subscapularMm, unit: "mm" },
    { label: "Suprailíaca", value: skinfolds?.suprailiacMm, unit: "mm" },
    { label: "Axilar Média", value: skinfolds?.midaxillaryMm, unit: "mm" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Perímetros Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Ruler className="h-5 w-5 text-secondary" />
            <CardTitle className="text-base font-semibold">
              Perímetros & Circunferências
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {circItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-muted/40 border border-border/50 p-2.5"
              >
                <p className="text-[11px] font-medium text-muted-foreground truncate">
                  {item.label}
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {item.value != null ? `${item.value} ${item.unit}` : "-"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dobras Cutâneas Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-health-primary" />
            <CardTitle className="text-base font-semibold">
              Dobras Cutâneas (Adipômetro)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {skinfoldItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-muted/40 border border-border/50 p-2.5"
              >
                <p className="text-[11px] font-medium text-muted-foreground truncate">
                  {item.label}
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {item.value != null ? `${item.value} ${item.unit}` : "-"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
