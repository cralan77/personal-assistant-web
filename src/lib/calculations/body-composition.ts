import {
  BodyCompositionAnalysis,
  CircumferenceMeasurements,
  Gender,
  SkinfoldMeasurements,
} from "@/types";

export interface CalculateBodyCompositionParams {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  circumferences?: CircumferenceMeasurements;
  skinfolds?: SkinfoldMeasurements;
}

export function calculateBodyComposition({
  weightKg,
  heightCm,
  age,
  gender,
  circumferences = {},
  skinfolds = {},
}: CalculateBodyCompositionParams): BodyCompositionAnalysis {
  // 1. IMC
  const heightMeters = Math.max(heightCm / 100.0, 0.5);
  const rawBmi = weightKg / (heightMeters * heightMeters);
  const bmi = Math.round(rawBmi * 10.0) / 10.0;

  let bmiCategory = "Peso saudável";
  if (bmi < 18.5) {
    bmiCategory = "Abaixo do peso";
  } else if (bmi < 24.9) {
    bmiCategory = "Peso saudável";
  } else if (bmi < 29.9) {
    bmiCategory = "Sobrepeso";
  } else if (bmi < 34.9) {
    bmiCategory = "Obesidade Grau I";
  } else if (bmi < 39.9) {
    bmiCategory = "Obesidade Grau II";
  } else {
    bmiCategory = "Obesidade Grau III";
  }

  // 2. Relação Cintura / Quadril (RCQ)
  const waist = circumferences.waistCm ?? circumferences.abdomenCm;
  const hips = circumferences.hipsCm;
  const waistToHipRatio =
    waist != null && hips != null && hips > 0
      ? Math.round((waist / hips) * 100.0) / 100.0
      : null;

  // 3. Percentual de Gordura Corporal
  let bodyFatPercentage: number;
  let methodUsed: string;

  // A. Protocolo Jackson & Pollock (3 Dobras Cutâneas com Adipômetro)
  const isMaleJp3Ready =
    gender === "MALE" &&
    skinfolds.chestMm != null &&
    skinfolds.abdominalMm != null &&
    skinfolds.thighMm != null;

  const isFemaleJp3Ready =
    gender === "FEMALE" &&
    skinfolds.tricepsMm != null &&
    skinfolds.suprailiacMm != null &&
    skinfolds.thighMm != null;

  if (isMaleJp3Ready) {
    const sum3 =
      (skinfolds.chestMm ?? 0) +
      (skinfolds.abdominalMm ?? 0) +
      (skinfolds.thighMm ?? 0);
    const dc =
      1.10938 -
      0.0008267 * sum3 +
      0.0000016 * sum3 * sum3 -
      0.0002574 * age;
    bodyFatPercentage = (4.95 / dc - 4.5) * 100.0;
    methodUsed = "Jackson & Pollock (3 Dobras)";
  } else if (isFemaleJp3Ready) {
    const sum3 =
      (skinfolds.tricepsMm ?? 0) +
      (skinfolds.suprailiacMm ?? 0) +
      (skinfolds.thighMm ?? 0);
    const dc =
      1.0994921 -
      0.0009929 * sum3 +
      0.0000023 * sum3 * sum3 -
      0.0001392 * age;
    bodyFatPercentage = (4.95 / dc - 4.5) * 100.0;
    methodUsed = "Jackson & Pollock (3 Dobras)";
  } else {
    // B. Método Circunferencial da Marinha Americana (U.S. Navy)
    const neck = circumferences.neckCm;
    const isNavyMale =
      gender === "MALE" && waist != null && neck != null && waist > neck;
    const isNavyFemale =
      gender === "FEMALE" &&
      waist != null &&
      hips != null &&
      neck != null &&
      waist + hips > neck;

    if (isNavyMale) {
      bodyFatPercentage =
        86.01 * Math.log10(waist! - neck!) -
        70.041 * Math.log10(heightCm) +
        36.76;
      methodUsed = "U.S. Navy (Circunferências)";
    } else if (isNavyFemale) {
      bodyFatPercentage =
        163.205 * Math.log10(waist! + hips! - neck!) -
        97.684 * Math.log10(heightCm) -
        78.387;
      methodUsed = "U.S. Navy (Circunferências)";
    } else {
      // C. Equação de Deurenberg (baseada em IMC, Idade e Sexo)
      const genderValue = gender === "MALE" ? 1.0 : 0.0;
      bodyFatPercentage =
        1.2 * bmi + 0.23 * age - 10.8 * genderValue - 5.4;
      methodUsed = "Deurenberg (Estimativa via IMC)";
    }
  }

  // Coerce entre 3.0 e 60.0
  const clampedBf = Math.max(3.0, Math.min(60.0, bodyFatPercentage));
  const roundedBf = Math.round(clampedBf * 10.0) / 10.0;
  const fatMassKg = Math.round(weightKg * (roundedBf / 100.0) * 10.0) / 10.0;
  const leanMassKg = Math.round((weightKg - fatMassKg) * 10.0) / 10.0;

  return {
    bmi,
    bmiCategory,
    bodyFatPercentage: roundedBf,
    fatMassKg,
    leanMassKg,
    waistToHipRatio,
    methodUsed,
  };
}
