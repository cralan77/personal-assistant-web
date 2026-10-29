import { ExertionLevel, TrainingLoad } from "@/types";

/**
 * Calcula o TRIMP (Training Impulse) baseado no modelo de Banister.
 * Avalia o estresse fisiológico acumulado no treino com base na duração,
 * frequência cardíaca média e frequência cardíaca de reserva.
 *
 * Fórmula Banister padrão: D * deltaHR * 0.64 * exp(1.92 * deltaHR)
 * onde D é a duração em minutos e deltaHR = (avgBpm - restBpm) / (maxBpm - restBpm).
 */
export function calculateTrimp(
  durationSeconds: number,
  avgBpm?: number | null,
  restBpm: number = 60.0,
  maxBpm: number = 190.0
): TrainingLoad {
  if (
    avgBpm == null ||
    durationSeconds <= 0 ||
    maxBpm <= restBpm
  ) {
    return {
      trimpScore: 0.0,
      exertionLevel: "LIGHT",
      description: "Dados insuficientes de frequência cardíaca.",
    };
  }

  const durationMinutes = durationSeconds / 60.0;
  const rawFraction = (avgBpm - restBpm) / (maxBpm - restBpm);
  const hrReserveFraction = Math.max(0.0, Math.min(1.0, rawFraction));

  const trimp =
    durationMinutes *
    hrReserveFraction *
    0.64 *
    Math.exp(1.92 * hrReserveFraction);
  const roundedTrimp = Math.round(trimp * 10.0) / 10.0;

  let exertionLevel: ExertionLevel = "LIGHT";
  let description = "Treino regenerativo / baixa sobrecarga cardiovascular.";

  if (roundedTrimp < 50.0) {
    exertionLevel = "LIGHT";
    description = "Treino regenerativo / baixa sobrecarga cardiovascular.";
  } else if (roundedTrimp < 120.0) {
    exertionLevel = "MODERATE";
    description = "Carga aeróbica ideal para manutenção e condicionamento.";
  } else if (roundedTrimp < 250.0) {
    exertionLevel = "HARD";
    description =
      "Estresse significativo; exige atenção com a recuperação pós-treino.";
  } else {
    exertionLevel = "VERY_HARD";
    description =
      "Carga exaustiva; recomendado descanso ativo ou repouso nas próximas 24-48h.";
  }

  return {
    trimpScore: roundedTrimp,
    exertionLevel,
    description,
  };
}
