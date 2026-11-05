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
  targetCalories?: number | null;
  targetProteinG?: number | null;
  targetCarbsG?: number | null;
  targetFatG?: number | null;
  targetFiberG?: number | null;
  targetWaterMl?: number | null;
  updatedAt?: string;
}

export interface TodayNutritionSummary {
  caloriesConsumed: number;
  targetCalories?: number | null;
  proteinConsumedG: number;
  targetProteinG?: number | null;
  carbsConsumedG: number;
  fatConsumedG: number;
  waterConsumedMl: number;
  targetWaterMl: number;
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
  todayNutrition?: TodayNutritionSummary | null;
  readinessScore?: number | null;
  readinessStatus?: string | null;
  weeklyTrimp?: number | null;
  trainingLoadStatus?: string | null;
  recentSleepFormatted?: string | null;
  lastWorkoutSummary?: string | null;
}

export interface HealthMetricsSummary {
  readinessScore: number;
  readinessStatus: string;
  weeklyTrimp: number;
  trainingLoadStatus: string;
  recentSleepMinutes?: number | null;
  recentSleepFormatted: string;
  todaySteps: number;
  lastWorkoutSummary?: string | null;
}

// ==========================================
// Nutrition & Hydration Models
// ==========================================

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "SUPPER";

export interface FoodItem {
  id: string;
  userId: string;
  name: string;
  brand?: string | null;
  servingSizeGrams: number;
  servingUnitName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  isFavorite: boolean;
  createdAt?: string;
}

export interface CreateFoodPayload {
  name: string;
  brand?: string | null;
  servingSizeGrams?: number;
  servingUnitName?: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  isFavorite?: boolean;
}

export interface MealItem {
  id: string;
  mealId?: string | null;
  foodId?: string | null;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface CreateMealItemPayload {
  foodId?: string | null;
  foodName: string;
  quantity: number;
  unit?: string;
  calories?: number | null;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
  fiberG?: number | null;
}

export interface Meal {
  id: string;
  userId: string;
  dateLocal: string;
  timeLocal?: string | null;
  mealType: MealType;
  name?: string | null;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  totalNetCarbsG: number;
  isQuickLog: boolean;
  notes?: string | null;
  items: MealItem[];
  createdAt: string;
}

export interface CreateMealPayload {
  dateLocal: string;
  timeLocal?: string | null;
  mealType: MealType;
  name?: string | null;
  items?: CreateMealItemPayload[];
  quickCalories?: number | null;
  quickProteinG?: number | null;
  quickCarbsG?: number | null;
  quickFatG?: number | null;
  quickFiberG?: number | null;
  notes?: string | null;
}

export interface WaterLog {
  id: string;
  userId: string;
  dateLocal: string;
  amountMl: number;
  loggedAt: string;
}

export interface MacroNutrientSummary {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  netCarbsG: number;
  proteinCaloriesPercent: number;
  carbsCaloriesPercent: number;
  fatCaloriesPercent: number;
}

export interface NutritionGoalsProgress {
  targetCalories?: number | null;
  targetProteinG?: number | null;
  targetCarbsG?: number | null;
  targetFatG?: number | null;
  targetFiberG?: number | null;
  calorieAdherencePercent?: number | null;
  proteinAdherencePercent?: number | null;
  carbsAdherencePercent?: number | null;
  fatAdherencePercent?: number | null;
}

export interface WaterProgress {
  totalConsumedMl: number;
  targetMl: number;
  adherencePercent: number;
}

export interface EnergyBalanceSummary {
  caloriesConsumed: number;
  bmrKatchMcArdle?: number | null;
  workoutCaloriesBurned: number;
  totalEnergyExpenditure: number;
  netCaloricBalance: number;
  status: "CALORIC_DEFICIT" | "CALORIC_SURPLUS" | "BALANCED" | string;
}

export interface DailyNutritionResponse {
  date: string;
  meals: Meal[];
  totals: MacroNutrientSummary;
  goals?: NutritionGoalsProgress | null;
  water: WaterProgress;
  energyBalance?: EnergyBalanceSummary | null;
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
  routineSummary?: string;
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

export type AssistantContextType = "ALL" | "HEALTH" | "FINANCE" | "HABITS";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  contextType?: AssistantContextType;
}

// ==========================================
// Routines, Habits & To-Do List Models
// ==========================================

export type ScheduleType =
  | "DAILY"
  | "FIXED_WEEKLY"
  | "FLEXIBLE_WEEKLY"
  | "FIXED_MONTHLY"
  | "FLEXIBLE_MONTHLY";

export type CompletionMode =
  | "CHECK"
  | "QUANTITATIVE"
  | "TODO_LINKED"
  | "HEALTH_AUTO";

export type QuotaCountMode = "DAYS_COMPLETED" | "TOTAL_EXECUTIONS";

export type HealthTriggerType =
  | "WORKOUT_SESSION"
  | "DAILY_STEPS"
  | "WEIGHT_OR_BODY_LOGGED";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type WeekStartDay = DayOfWeek;

export type HabitLogStatus = "COMPLETED" | "PARTIAL" | "PENDING" | "SKIPPED";

export type HabitLogSource =
  | "MANUAL"
  | "TODO_LINKED"
  | "HEALTH_AUTO"
  | "AI_ASSISTANT";

export type TodoPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TodoStatus = "PENDING" | "COMPLETED";

export interface Habit {
  id: string;
  userId?: string;
  title: string;
  description?: string | null;
  icon: string;
  colorHex: string;
  scheduleType: ScheduleType;
  daysOfWeek?: DayOfWeek[] | null;
  daysOfMonth?: number[] | null;
  targetCountPerPeriod: number;
  quotaCountMode: QuotaCountMode;
  completionMode: CompletionMode;
  dailyTargetValue: number;
  unit?: string | null;
  linkedTodoCategoryId?: string | null;
  linkedTodoCategoryName?: string | null;
  healthTriggerType?: HealthTriggerType | null;
  healthExerciseType?: string | null;
  healthMinDurationMinutes?: number | null;
  isActive: boolean;
  startDate?: string;
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  currentStreak?: number;
  bestStreak?: number;
  streakUnit?: "DAYS" | "WEEKS" | "MONTHS" | string;
  periodTargetCount?: number;
  periodAchievedCount?: number;
}

export interface CreateHabitPayload {
  title: string;
  description?: string | null;
  icon?: string;
  colorHex?: string;
  scheduleType: ScheduleType;
  daysOfWeek?: DayOfWeek[] | null;
  daysOfMonth?: number[] | null;
  targetCountPerPeriod?: number;
  quotaCountMode?: QuotaCountMode;
  completionMode: CompletionMode;
  dailyTargetValue?: number;
  unit?: string | null;
  linkedTodoCategoryId?: string | null;
  healthTriggerType?: HealthTriggerType | null;
  healthExerciseType?: string | null;
  healthMinDurationMinutes?: number | null;
  startDate?: string | null;
}

export type UpdateHabitPayload = Partial<CreateHabitPayload> & {
  isActive?: boolean;
};

export interface CheckHabitPayload {
  date?: string;
  value?: number;
  notes?: string;
}

export interface SkipHabitPayload {
  date?: string;
  skipCount?: number;
  reason?: string;
}

export interface TodoCategory {
  id: string;
  userId?: string;
  name: string;
  colorHex: string;
  icon: string;
  isArchived?: boolean;
  createdAt?: string;
}

export interface CreateTodoCategoryPayload {
  name: string;
  colorHex?: string;
  icon?: string;
}

export interface TodoSubtask {
  id: string;
  todoId?: string;
  title: string;
  isCompleted: boolean;
  sortOrder?: number;
  completedAt?: string | null;
  createdAt?: string;
}

export interface TodoItem {
  id: string;
  userId?: string;
  title: string;
  description?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  categoryColorHex?: string | null;
  linkedHabitId?: string | null;
  linkedHabitTitle?: string | null;
  effectiveLinkedHabitTitles?: string[];
  priority: TodoPriority;
  status: TodoStatus;
  dueDate?: string | null;
  completedAt?: string | null;
  subtasks?: TodoSubtask[];
  subtasksCompleted?: number;
  subtasksTotal?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTodoPayload {
  title: string;
  description?: string | null;
  categoryId?: string | null;
  linkedHabitId?: string | null;
  priority?: TodoPriority;
  dueDate?: string | null;
  subtasks?: Array<{ title: string } | string>;
}

export interface UpdateTodoPayload {
  title?: string;
  description?: string | null;
  categoryId?: string | null;
  linkedHabitId?: string | null;
  priority?: TodoPriority;
  status?: TodoStatus;
  dueDate?: string | null;
}

export interface FixedHabitTodayItem {
  habitId: string;
  title: string;
  description?: string | null;
  icon: string;
  colorHex: string;
  scheduleType: ScheduleType;
  completionMode: CompletionMode;
  dailyTargetValue: number;
  currentValueToday: number;
  unit?: string | null;
  progressPercentage: number;
  statusToday: HabitLogStatus | "COMPLETED" | "PARTIAL" | "PENDING" | "SKIPPED";
  isSkippedToday?: boolean;
  skipReason?: string | null;
  linkedTodoCategoryName?: string | null;
  healthTriggerType?: HealthTriggerType | null;
  currentStreak: number;
  bestStreak: number;
  streakUnit: "DAYS" | "WEEKS" | "MONTHS" | string;
}

export interface FlexibleHabitPeriodItem {
  habitId: string;
  title: string;
  description?: string | null;
  icon: string;
  colorHex: string;
  scheduleType: ScheduleType;
  quotaCountMode?: QuotaCountMode;
  completionMode: CompletionMode;
  dailyTargetValue?: number;
  unit?: string | null;
  linkedTodoCategoryId?: string | null;
  linkedTodoCategoryName?: string | null;
  healthTriggerType?: HealthTriggerType | null;
  periodLabel: string;
  periodTargetCount: number;
  periodAchievedCount: number;
  periodSkippedCount?: number;
  isPeriodGoalMet: boolean;
  isOverachieved: boolean;
  executedToday: boolean;
  currentValueToday?: number;
  currentStreak: number;
  bestStreak: number;
  streakUnit: "DAYS" | "WEEKS" | "MONTHS" | string;
}

export interface DailyRoutineGauge {
  fixedExpectedCount: number;
  fixedCompletedCount: number;
  fixedSkippedCount: number;
  fixedSuccessPercentage: number;
  flexibleCompletedTodayBonus: number;
  weeklyConsistencyPercentage?: number;
}

export interface DailyRoutineView {
  date: string;
  dayOfWeek: string;
  weekWindow: {
    startDate: string;
    endDate: string;
    weekStartDay: WeekStartDay;
  };
  dailyGauge: DailyRoutineGauge;
  fixedHabitsToday: FixedHabitTodayItem[];
  flexibleHabitsInPeriod: FlexibleHabitPeriodItem[];
  urgentAndTodayTodos: TodoItem[];
}

export interface RoutineAnalyticsBarPoint {
  label: string;
  date: string;
  fixedExpected: number;
  fixedAchieved: number;
  flexibleExecutedToday: number;
  totalExpectedForBar: number;
  totalAchievedForBar: number;
  percentage: number;
}

export interface RoutineHabitBreakdownItem {
  habitId: string;
  title: string;
  icon?: string;
  colorHex?: string;
  scheduleType: ScheduleType;
  completionMode: CompletionMode;
  expectedInPeriod: number;
  achievedRawInPeriod: number;
  achievedCappedInPeriod: number;
  skippedInPeriod: number;
  percentageCapped: number;
  percentageRaw: number;
  statusBadge: "OVERACHIEVED" | "COMPLETED" | "IN_PROGRESS" | "MISSED" | "SKIPPED" | string;
}

export interface RoutineTrendLinePoint {
  periodLabel: string;
  startDate: string;
  consistencyPercentage: number;
}

export interface RoutineAnalyticsComparison {
  periodType: "WEEK" | "MONTH";
  startDate: string;
  endDate: string;
  weekStartDay: WeekStartDay;
  overallMetrics: {
    totalExpected: number;
    totalAchievedCapped: number;
    totalAchievedRaw: number;
    totalSkipped: number;
    consistencyPercentage: number;
    overachievementCount: number;
  };
  barChartSeries: RoutineAnalyticsBarPoint[];
  habitBreakdown: RoutineHabitBreakdownItem[];
  trendLineSeries: RoutineTrendLinePoint[];
}

export interface HabitHeatmapDay {
  date: string;
  completedCount: number;
  expectedCount: number;
  percentage: number;
  intensity: number; // 0..4
}

export interface HabitHeatmapData {
  months: number;
  habitId?: string | null;
  habitTitle?: string | null;
  startDate: string;
  endDate: string;
  totalCompletedDays?: number;
  currentStreak?: number;
  bestStreak?: number;
  days: HabitHeatmapDay[];
}

export interface RoutineSummary {
  date: string;
  fixedExpectedToday: number;
  fixedCompletedToday: number;
  fixedSkippedToday?: number;
  fixedSuccessPercentageToday: number;
  flexibleCompletedTodayBonus?: number;
  flexibleHabitsInPeriodCount?: number;
  flexibleHabitsCompletedInPeriodCount?: number;
  weeklyConsistencyPercentage: number;
  pendingTodosTodayCount: number;
  overdueTodosCount?: number;
  urgentTodosCount?: number;
  topStreakHabitTitle?: string | null;
  topStreakCount?: number;
  pendingFixedHabitTitles?: string[];
  urgentTodoTitles?: string[];
}

export interface UserRoutineSettings {
  userId?: string;
  weekStartDay: WeekStartDay;
  timezone: string;
  eveningReminderEnabled: boolean;
  eveningReminderTime: string;
  updatedAt?: string;
}
