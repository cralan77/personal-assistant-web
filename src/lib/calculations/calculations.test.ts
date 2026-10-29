import { describe, it, expect } from "vitest";
import { calculateBodyComposition } from "./body-composition";
import { calculateHeartRateZones } from "./heart-rate-zones";
import { calculateTrimp } from "./trimp";
import { HeartRateSample } from "@/types";

describe("Body Composition Calculation", () => {
  it("should calculate Jackson & Pollock 3-skinfold for male", () => {
    const result = calculateBodyComposition({
      weightKg: 80,
      heightCm: 180,
      age: 30,
      gender: "MALE",
      skinfolds: {
        chestMm: 10,
        abdominalMm: 15,
        thighMm: 12,
      },
    });

    expect(result.bmi).toBe(24.7);
    expect(result.bmiCategory).toBe("Peso saudável");
    expect(result.methodUsed).toBe("Jackson & Pollock (3 Dobras)");
    expect(result.bodyFatPercentage).toBeGreaterThan(5);
    expect(result.bodyFatPercentage).toBeLessThan(20);
    expect(result.fatMassKg).toBeGreaterThan(5);
    expect(result.leanMassKg).toBe(Math.round((80 - result.fatMassKg) * 10) / 10);
  });

  it("should calculate Jackson & Pollock 3-skinfold for female", () => {
    const result = calculateBodyComposition({
      weightKg: 60,
      heightCm: 165,
      age: 28,
      gender: "FEMALE",
      skinfolds: {
        tricepsMm: 14,
        suprailiacMm: 16,
        thighMm: 18,
      },
    });

    expect(result.methodUsed).toBe("Jackson & Pollock (3 Dobras)");
    expect(result.bodyFatPercentage).toBeGreaterThan(10);
    expect(result.bodyFatPercentage).toBeLessThan(30);
  });

  it("should fallback to U.S. Navy if circumferences provided without skinfolds", () => {
    const result = calculateBodyComposition({
      weightKg: 85,
      heightCm: 178,
      age: 35,
      gender: "MALE",
      circumferences: {
        waistCm: 90,
        neckCm: 40,
        hipsCm: 100,
      },
    });

    expect(result.methodUsed).toBe("U.S. Navy (Circunferências)");
    expect(result.waistToHipRatio).toBe(0.9);
  });

  it("should fallback to Deurenberg if only basic metrics provided", () => {
    const result = calculateBodyComposition({
      weightKg: 70,
      heightCm: 175,
      age: 25,
      gender: "MALE",
    });

    expect(result.methodUsed).toBe("Deurenberg (Estimativa via IMC)");
    expect(result.bmi).toBe(22.9);
  });
});

describe("Heart Rate Zones Calculation", () => {
  it("should distribute samples across zones accurately", () => {
    const maxBpm = 200;
    // z1: 100-119, z2: 120-139, z3: 140-159, z4: 160-179, z5: >= 180
    const samples: HeartRateSample[] = [
      { sampleIndex: 0, timeUtcIso8601: "", beatsPerMinute: 110, deltaFromPreviousSampleSeconds: 1 }, // Z1
      { sampleIndex: 1, timeUtcIso8601: "", beatsPerMinute: 130, deltaFromPreviousSampleSeconds: 2 }, // Z2
      { sampleIndex: 2, timeUtcIso8601: "", beatsPerMinute: 150, deltaFromPreviousSampleSeconds: 3 }, // Z3
      { sampleIndex: 3, timeUtcIso8601: "", beatsPerMinute: 170, deltaFromPreviousSampleSeconds: 4 }, // Z4
      { sampleIndex: 4, timeUtcIso8601: "", beatsPerMinute: 190, deltaFromPreviousSampleSeconds: 1 }, // Z5
    ];

    const zones = calculateHeartRateZones(samples, maxBpm);
    expect(zones.zone1RecoverySeconds).toBe(1);
    expect(zones.zone2AerobicSeconds).toBe(2);
    expect(zones.zone3TempoSeconds).toBe(3);
    expect(zones.zone4ThresholdSeconds).toBe(4);
    expect(zones.zone5AnaerobicSeconds).toBe(1);
    expect(zones.totalSecondsInZones).toBe(11);
  });

  it("should return zeros for empty samples", () => {
    const zones = calculateHeartRateZones([]);
    expect(zones.totalSecondsInZones).toBe(0);
  });
});

describe("TRIMP Calculation", () => {
  it("should calculate Banister TRIMP for normal workout", () => {
    // 3600 seconds = 60 minutes, avgBpm 150, rest 60, max 190
    const result = calculateTrimp(3600, 150, 60, 190);
    expect(result.trimpScore).toBeGreaterThan(50);
    expect(result.exertionLevel).toBeDefined();
    expect(["LIGHT", "MODERATE", "HARD", "VERY_HARD"]).toContain(result.exertionLevel);
  });

  it("should handle invalid or insufficient data safely", () => {
    const result = calculateTrimp(0, null);
    expect(result.trimpScore).toBe(0);
    expect(result.exertionLevel).toBe("LIGHT");
  });
});
