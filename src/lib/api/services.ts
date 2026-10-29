import { apiClient } from "./client";
import {
  AuthResponse,
  BodyCompositionSummary,
  BodyMeasurementEntry,
  CreateBillPayload,
  CreateIncomePayload,
  FinancialEntry,
  FinancialSummary,
  LoginPayload,
  RegisterPayload,
  User,
  Wallet,
  Category,
  SubCategory,
  UpdateEntryPayload,
  WorkoutSession,
  AiMorningBriefing,
  AiWorkoutAnalysis,
  ChatMessage,
  HealthGoals,
  AssistantContextType,
} from "@/types";

// ==========================================
// Auth Service
// ==========================================

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      "/api/proxy/auth/login",
      payload
    );
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      "/api/proxy/auth/register",
      payload
    );
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>("/api/proxy/auth/me");
    return data;
  },
};

// ==========================================
// Health Service
// ==========================================

export const healthService = {
  async getSummary(): Promise<BodyCompositionSummary> {
    const { data } = await apiClient.get<BodyCompositionSummary>(
      "/api/proxy/health/summary"
    );
    return data;
  },

  async listWorkouts(): Promise<WorkoutSession[]> {
    const { data } = await apiClient.get<WorkoutSession[]>(
      "/api/proxy/health/workouts"
    );
    return data || [];
  },

  async getWorkoutById(id: string): Promise<WorkoutSession | null> {
    const { data } = await apiClient.get<WorkoutSession>(
      `/api/proxy/health/workouts/${id}`
    );
    return data;
  },

  async listBodyMeasurements(): Promise<BodyMeasurementEntry[]> {
    const { data } = await apiClient.get<BodyMeasurementEntry[]>(
      "/api/proxy/health/body-measurements"
    );
    return data || [];
  },

  async saveBodyMeasurement(
    entry: Partial<BodyMeasurementEntry>
  ): Promise<BodyMeasurementEntry> {
    if (entry.id) {
      const { data } = await apiClient.put<BodyMeasurementEntry>(
        `/api/proxy/health/body-measurements/${entry.id}`,
        entry
      );
      return data;
    }
    const { data } = await apiClient.post<BodyMeasurementEntry>(
      "/api/proxy/health/body-measurements",
      entry
    );
    return data;
  },

  async deleteBodyMeasurement(id: string): Promise<void> {
    await apiClient.delete(`/api/proxy/health/body-measurements/${id}`);
  },

  async getGoals(): Promise<HealthGoals> {
    const { data } = await apiClient.get<HealthGoals>("/api/proxy/health/goals");
    return data;
  },

  async saveGoals(payload: Partial<HealthGoals>): Promise<HealthGoals> {
    const { data } = await apiClient.put<HealthGoals>(
      "/api/proxy/health/goals",
      payload
    );
    return data;
  },
};

// ==========================================
// Finance Service
// ==========================================

export const financeService = {
  async listEntries(): Promise<FinancialEntry[]> {
    const { data } = await apiClient.get<any[]>("/api/proxy/financial-entries");
    return (data || []).map((dto) => ({
      id: dto.id,
      name: dto.name,
      amount: dto.value,
      type: dto.type,
      isPaid: dto.paymentDate != null,
      dueDate: dto.dueDate,
      paymentDate: dto.paymentDate,
      categoryName: dto.subCategoryName || null,
    }));
  },

  async getSummary(): Promise<FinancialSummary> {
    const entries = await this.listEntries();
    const incomeMonth = entries
      .filter((e) => e.type === "INCOME" && e.isPaid)
      .reduce((acc, e) => acc + e.amount, 0);
    const expenseMonth = entries
      .filter((e) => e.type === "BILL" && e.isPaid)
      .reduce((acc, e) => acc + e.amount, 0);
    const pendingBills = entries.filter((e) => e.type === "BILL" && !e.isPaid);
    const pendingBillsAmount = pendingBills.reduce((acc, e) => acc + e.amount, 0);

    return {
      totalBalance: incomeMonth - expenseMonth,
      totalIncomeMonth: incomeMonth,
      totalExpenseMonth: expenseMonth,
      pendingBillsCount: pendingBills.length,
      pendingBillsAmount: pendingBillsAmount,
    };
  },

  async createBill(payload: CreateBillPayload): Promise<FinancialEntry> {
    const { data } = await apiClient.post<any>("/api/proxy/bills", payload);
    return {
      id: data.id,
      name: data.name,
      amount: data.value,
      type: "BILL",
      isPaid: data.paymentDate != null,
      dueDate: data.dueDate,
      paymentDate: data.paymentDate,
    };
  },

  async createIncome(payload: CreateIncomePayload): Promise<FinancialEntry> {
    const { data } = await apiClient.post<any>("/api/proxy/incomes", payload);
    return {
      id: data.id,
      name: data.name,
      amount: data.value,
      type: "INCOME",
      isPaid: data.paymentDate != null,
      dueDate: data.dueDate,
      paymentDate: data.paymentDate,
    };
  },

  async listWallets(): Promise<Wallet[]> {
    const { data } = await apiClient.get<Wallet[]>("/api/proxy/wallets");
    return data || [];
  },

  async createWallet(payload: { name: string; overdraftLimit?: number }): Promise<Wallet> {
    const { data } = await apiClient.post<Wallet>("/api/proxy/wallets", {
      name: payload.name,
      overdraftLimit: payload.overdraftLimit ?? 1000.0,
      initialBalance: 0.0,
    });
    return data;
  },

  async listCategories(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>("/api/proxy/categories");
    return data || [];
  },

  async createCategory(name: string, type: "BILL" | "INCOME"): Promise<Category> {
    const { data } = await apiClient.post<Category>("/api/proxy/categories", {
      name,
      type,
    });
    return data;
  },

  async listSubCategories(): Promise<SubCategory[]> {
    const { data } = await apiClient.get<SubCategory[]>("/api/proxy/sub-categories");
    return data || [];
  },

  async createSubCategory(name: string, parentCategoryId?: string): Promise<SubCategory> {
    const { data } = await apiClient.post<SubCategory>("/api/proxy/sub-categories", {
      name,
      parentCategoryId,
    });
    return data;
  },

  async confirmBill(billId: string, paymentMethod: string = "WALLET", creditCardId?: string): Promise<FinancialEntry> {
    const normalized = paymentMethod.toUpperCase() === "CREDIT_CARD" ? "CREDIT_CARD" : "WALLET";
    const { data } = await apiClient.post<any>(`/api/proxy/bills/${billId}/confirmation`, {
      paymentMethod: normalized,
      ...(creditCardId ? { creditCardId } : {}),
    });
    return {
      id: data.id,
      name: data.name,
      amount: data.value,
      type: "BILL",
      isPaid: data.paymentDate != null,
      dueDate: data.dueDate,
      paymentDate: data.paymentDate,
    };
  },

  async confirmIncome(incomeId: string): Promise<FinancialEntry> {
    const { data } = await apiClient.post<any>(`/api/proxy/incomes/${incomeId}/confirmation`);
    return {
      id: data.id,
      name: data.name,
      amount: data.value,
      type: "INCOME",
      isPaid: data.paymentDate != null,
      dueDate: data.dueDate,
      paymentDate: data.paymentDate,
    };
  },

  async updateBill(billId: string, payload: UpdateEntryPayload): Promise<FinancialEntry> {
    const { data } = await apiClient.put<any>(`/api/proxy/bills/${billId}`, payload);
    return {
      id: data.id,
      name: data.name,
      amount: data.value,
      type: "BILL",
      isPaid: data.paymentDate != null,
      dueDate: data.dueDate,
      paymentDate: data.paymentDate,
    };
  },

  async updateIncome(incomeId: string, payload: UpdateEntryPayload): Promise<FinancialEntry> {
    const { data } = await apiClient.put<any>(`/api/proxy/incomes/${incomeId}`, payload);
    return {
      id: data.id,
      name: data.name,
      amount: data.value,
      type: "INCOME",
      isPaid: data.paymentDate != null,
      dueDate: data.dueDate,
      paymentDate: data.paymentDate,
    };
  },

  async deleteBill(billId: string): Promise<void> {
    await apiClient.delete(`/api/proxy/bills/${billId}`);
  },

  async deleteIncome(incomeId: string): Promise<void> {
    await apiClient.delete(`/api/proxy/incomes/${incomeId}`);
  },
};

// ==========================================
// Assistant (Aurora) Service
// ==========================================

export const assistantService = {
  async getMorningBriefing(): Promise<AiMorningBriefing> {
    const { data } = await apiClient.get<AiMorningBriefing>(
      "/api/proxy/assistant/morning-briefing"
    );
    return data;
  },

  async analyzeWorkout(sessionId: string): Promise<AiWorkoutAnalysis> {
    const { data } = await apiClient.post<AiWorkoutAnalysis>(
      "/api/proxy/assistant/analyze-workout",
      { sessionId }
    );
    return data;
  },

  async sendMessage(
    prompt: string,
    contextType: AssistantContextType = "ALL"
  ): Promise<string> {
    const { data } = await apiClient.post<{ reply: string }>(
      "/api/proxy/assistant/chat",
      { prompt, contextType }
    );
    return data.reply;
  },

  async getChatHistory(): Promise<ChatMessage[]> {
    const { data } = await apiClient.get<
      Array<{ id: string; sender: "user" | "assistant"; content: string; timestamp?: string }>
    >("/api/proxy/assistant/history");
    return (data || []).map((msg, idx) => ({
      id: msg.id || `hist-${idx}`,
      sender: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp || "",
    }));
  },

  async clearChatHistory(): Promise<void> {
    await apiClient.delete("/api/proxy/assistant/history");
  },
};

