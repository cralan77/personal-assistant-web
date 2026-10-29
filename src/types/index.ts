// ==========================================
// Authentication Types
// ==========================================

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  roles?: string[];
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  userId: string;
  username: string;
  name: string;
  email: string;
  roles?: string[];
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

// ==========================================
// Health & Workout Models
// ==========================================

export type Gender = "MALE" | "FEMALE";

export interface CircumferenceMeasurements {
  neckCm?: number | null;
  chestCm?: number | null;
  rightArmCm?: number | null;
  leftArmCm?: number | null;
  waistCm?: number | null;
  abdomenCm?: number | null;
  hipsCm?: number | null;
  rightThighCm?: number | null;
  leftThighCm?: number | null;
  rightCalfCm?: number | null;
  leftCalfCm?: number | null;
}

export interface SkinfoldMeasurements {
  chestMm?: number | null;
  abdominalMm?: number | null;
  thighMm?: number | null;
  tricepsMm?: number | null;
  subscapularMm?: number | null;
  suprailiacMm?: number | null;
  midaxillaryMm?: number | null;
}

export interface BodyCompositionAnalysis {
  bmi: number;
  bmiCategory: string;
  bodyFatPercentage: number;
  fatMassKg: number;
  leanMassKg: number;
  waistToHipRatio?: number | null;
  methodUsed: string;
}

export interface BodyMeasurementEntry {
  id: string;
  dateUtcIso: string;
  dateFormatted?: string;
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  circumferences?: CircumferenceMeasurements;
  skinfolds?: SkinfoldMeasurements;
  analysis?: BodyCompositionAnalysis | null;
}

export interface HealthGoals {
  userId?: string;
  targetWeightKg?: number | null;
  targetBodyFatPercentage?: number | null;
  targetStepsPerDay?: number | null;
  targetSleepMinutes?: number | null;
  updatedAt?: string;
}

export interface BodyCompositionSummary {
  currentWeightKg?: number | null;
  targetWeightKg?: number | null;
  targetBodyFatPercentage?: number | null;
  weightDeltaLastMonthKg?: number | null;
  bmi?: number | null;
  bmiCategory?: string | null;
  bodyFatPercentage?: number | null;
  leanMassKg?: number | null;
  fatMassKg?: number | null;
  latestCircumferences?: CircumferenceMeasurements | null;
  latestSkinfolds?: SkinfoldMeasurements | null;
  todaySteps: number;
  lastNightSleepMinutes?: number | null;
  totalEvaluationsCount: number;
}

export type ExertionLevel = "LIGHT" | "MODERATE" | "HARD" | "VERY_HARD";

export interface TrainingLoad {
  trimpScore: number;
  exertionLevel: ExertionLevel;
  description: string;
}

export interface HeartRateZones {
  maxBpmCalculated: number;
  zone1RecoverySeconds: number;
  zone2AerobicSeconds: number;
  zone3TempoSeconds: number;
  zone4ThresholdSeconds: number;
  zone5AnaerobicSeconds: number;
  totalSecondsInZones: number;
}

export interface HeartRateSample {
  sampleIndex: number;
  timeUtcIso8601: string;
  beatsPerMinute: number;
  deltaFromPreviousSampleSeconds?: number | null;
}

export interface HeartRateData {
  totalSamplesCount: number;
  minBpm?: number | null;
  maxBpm?: number | null;
  avgBpm?: number | null;
  samples: HeartRateSample[];
}

export interface TimingInfo {
  startUtcIso8601: string;
  endUtcIso8601: string;
  durationSeconds: number;
  durationFormatted: string;
}

export interface MetricsSummary {
  totalCaloriesKcal?: number | null;
  totalDistanceMeters?: number | null;
  totalDistanceKm?: number | null;
  rawCaloriesRecordCount?: number;
  rawDistanceRecordCount?: number;
}

export interface WorkoutSession {
  id: string;
  originPackage: string;
  isSamsungHealth: boolean;
  exerciseType: number;
  exerciseTypeName: string;
  title?: string | null;
  timing: TimingInfo;
  metrics: MetricsSummary;
  heartRateData: HeartRateData;
  trainingLoad?: TrainingLoad | null;
  zones?: HeartRateZones | null;
}

// ==========================================
// Finance Models
// ==========================================

export type EntryType = "BILL" | "INCOME";

export interface FinancialEntry {
  id: string;
  name: string;
  amount: number;
  type: EntryType;
  isPaid: boolean;
  dueDate?: string | null;
  paymentDate?: string | null;
  categoryName?: string | null;
  walletId?: string | null;
  subCategoryId?: string | null;
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncomeMonth: number;
  totalExpenseMonth: number;
  pendingBillsCount: number;
  pendingBillsAmount: number;
}

export interface Wallet {
  id: string;
  ownerId?: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  initialBalance: number;
  currentBalance: number;
  overdraftLimit: number;
}

export interface CreateBillPayload {
  name: string;
  value: number;
  dueDate: string;
  recurrenceMonths?: number;
  recurrenceEndDate?: string;
  subCategoryId?: string;
  walletId?: string;
  confirmDuplicate?: boolean;
  installments?: number;
}

export interface CreateIncomePayload {
  name: string;
  value: number;
  dueDate: string;
  recurrenceMonths?: number;
  recurrenceEndDate?: string;
  subCategoryId?: string;
  walletId?: string;
  confirmDuplicate?: boolean;
  receivedImmediately?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: EntryType;
}

export interface SubCategory {
  id: string;
  name: string;
  parentCategoryId?: string;
}

export interface UpdateEntryPayload {
  name?: string;
  value?: number;
  dueDate?: string;
  subCategoryId?: string;
  walletId?: string;
}

export interface ConfirmBillPayload {
  paymentMethod: "DEBIT" | "PIX" | "CASH" | "CREDIT_CARD";
  creditCardId?: string;
}

// ==========================================
// Assistant (Aurora) Models
// ==========================================

export interface AiMorningBriefing {
  id: string;
  headline: string;
  readinessScore: number;
  sleepAnalysis: string;
  workoutSuggestion: string;
  financialAdvice: string;
  generatedAt: string;
}

export interface AiWorkoutAnalysis {
  workoutId: string;
  title: string;
  summary: string;
  trimpFeedback: string;
  recoveryTimeHours: number;
  recommendations: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  contextType?: "ALL" | "HEALTH" | "FINANCE";
}
