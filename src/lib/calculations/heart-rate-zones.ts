import { HeartRateSample, HeartRateZones } from "@/types";

/**
 * Calcula a distribuição temporal dos batimentos cardíacos nas 5 zonas fisiológicas
 * com base na frequência cardíaca máxima (FCmáx).
 * Z1: 50% - 60% (Recuperação Ativa)
 * Z2: 60% - 70% (Aeróbico / Queima de Gordura)
 * Z3: 70% - 80% (Tempo / Resistência Aeróbica)
 * Z4: 80% - 90% (Limiar Anaeróbico)
 * Z5: 90% - 100% (Potência Máxima / Anaeróbico)
 */
export function calculateHeartRateZones(
  samples: HeartRateSample[],
  maxBpm: number = 190
): HeartRateZones {
  if (!samples || samples.length === 0) {
    return {
      maxBpmCalculated: maxBpm,
      zone1RecoverySeconds: 0,
      zone2AerobicSeconds: 0,
      zone3TempoSeconds: 0,
      zone4ThresholdSeconds: 0,
      zone5AnaerobicSeconds: 0,
      totalSecondsInZones: 0,
    };
  }

  const z1Min = maxBpm * 0.5;
  const z2Min = maxBpm * 0.6;
  const z3Min = maxBpm * 0.7;
  const z4Min = maxBpm * 0.8;
  const z5Min = maxBpm * 0.9;

  let z1Seconds = 0;
  let z2Seconds = 0;
  let z3Seconds = 0;
  let z4Seconds = 0;
  let z5Seconds = 0;

  for (const sample of samples) {
    const rawDelta = sample.deltaFromPreviousSampleSeconds ?? 1;
    const durationWeight = Math.max(1, Math.min(5, rawDelta));
    const bpm = sample.beatsPerMinute;

    if (bpm >= z5Min) {
      z5Seconds += durationWeight;
    } else if (bpm >= z4Min) {
      z4Seconds += durationWeight;
    } else if (bpm >= z3Min) {
      z3Seconds += durationWeight;
    } else if (bpm >= z2Min) {
      z2Seconds += durationWeight;
    } else if (bpm >= z1Min) {
      z1Seconds += durationWeight;
    }
  }

  const total = z1Seconds + z2Seconds + z3Seconds + z4Seconds + z5Seconds;

  return {
    maxBpmCalculated: maxBpm,
    zone1RecoverySeconds: z1Seconds,
    zone2AerobicSeconds: z2Seconds,
    zone3TempoSeconds: z3Seconds,
    zone4ThresholdSeconds: z4Seconds,
    zone5AnaerobicSeconds: z5Seconds,
    totalSecondsInZones: total,
  };
}
