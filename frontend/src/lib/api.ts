const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("klaarboek_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("klaarboek_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("klaarboek_token");
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      this.clearToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async register(email: string, password: string, companyName?: string, kvkNumber?: string, btwNumber?: string) {
    return this.request<{ id: number; email: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, company_name: companyName, kvk_number: kvkNumber, btw_number: btwNumber }),
    });
  }

  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!res.ok) throw new Error("Login failed");

    const data = await res.json();
    this.setToken(data.access_token);
    return data;
  }

  // Dashboard
  async getDashboard() {
    return this.request<{
      total_income: number;
      total_expenses: number;
      btw_owed: number;
      profit: number;
      transaction_count: number;
    }>("/transactions/dashboard");
  }

  // Transactions
  async getTransactions(limit = 50, offset = 0) {
    return this.request<Array<{
      id: number;
      bank_connection_id: number;
      date: string;
      amount: number;
      description: string | null;
      counterparty: string | null;
      category: string | null;
      btw_rate: string | null;
      is_business: boolean;
      is_income: boolean;
      classified_by: string;
      created_at: string;
    }>>(`/transactions/?limit=${limit}&offset=${offset}`);
  }

  async createTransaction(data: {
    bank_connection_id: number;
    date: string;
    amount: number;
    description?: string;
    counterparty?: string;
    category?: string;
    btw_rate?: string;
    is_business?: boolean;
    is_income?: boolean;
  }) {
    return this.request("/transactions/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  isLoggedIn() {
    return !!this.token;
  }
}

export const api = new ApiClient();
