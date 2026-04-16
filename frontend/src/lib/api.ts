const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DEMO_TRANSACTIONS = [
  { id: 1, bank_connection_id: 1, date: "2026-04-10", amount: 2400.00, description: "Website redesign - Bakkerij van Dam", counterparty: "Bakkerij van Dam B.V.", category: "Omzet", btw_rate: "21", is_business: true, is_income: true, classified_by: "auto", created_at: "2026-04-10" },
  { id: 2, bank_connection_id: 1, date: "2026-04-08", amount: -49.99, description: "Adobe Creative Cloud", counterparty: "Adobe Systems", category: "Software", btw_rate: "21", is_business: true, is_income: false, classified_by: "auto", created_at: "2026-04-08" },
  { id: 3, bank_connection_id: 1, date: "2026-04-05", amount: 1850.00, description: "Logo & huisstijl ontwerp", counterparty: "Fietsenwinkel De Groot", category: "Omzet", btw_rate: "21", is_business: true, is_income: true, classified_by: "auto", created_at: "2026-04-05" },
  { id: 4, bank_connection_id: 1, date: "2026-04-03", amount: -125.00, description: "Coworking space april", counterparty: "Spaces Eindhoven", category: "Huisvesting", btw_rate: "21", is_business: true, is_income: false, classified_by: "auto", created_at: "2026-04-03" },
  { id: 5, bank_connection_id: 1, date: "2026-04-01", amount: -29.00, description: "Boekhoudpakket KlaarBoek", counterparty: "KlaarBoek B.V.", category: "Software", btw_rate: "21", is_business: true, is_income: false, classified_by: "manual", created_at: "2026-04-01" },
  { id: 6, bank_connection_id: 1, date: "2026-03-28", amount: 3200.00, description: "Webshop ontwikkeling fase 2", counterparty: "Bloemenhandel Jansen", category: "Omzet", btw_rate: "21", is_business: true, is_income: true, classified_by: "auto", created_at: "2026-03-28" },
  { id: 7, bank_connection_id: 1, date: "2026-03-25", amount: -89.00, description: "Zakelijke telefoon", counterparty: "KPN Zakelijk", category: "Telecom", btw_rate: "21", is_business: true, is_income: false, classified_by: "auto", created_at: "2026-03-25" },
  { id: 8, bank_connection_id: 1, date: "2026-03-20", amount: 950.00, description: "SEO optimalisatie", counterparty: "Café De Hoek", category: "Omzet", btw_rate: "21", is_business: true, is_income: true, classified_by: "auto", created_at: "2026-03-20" },
  { id: 9, bank_connection_id: 1, date: "2026-03-15", amount: -312.50, description: "Zakelijke verzekering Q1", counterparty: "Allianz Nederland", category: "Verzekeringen", btw_rate: "0", is_business: true, is_income: false, classified_by: "auto", created_at: "2026-03-15" },
  { id: 10, bank_connection_id: 1, date: "2026-03-10", amount: 1500.00, description: "Social media campagne", counterparty: "Restaurant Luigi", category: "Omzet", btw_rate: "21", is_business: true, is_income: true, classified_by: "auto", created_at: "2026-03-10" },
  { id: 11, bank_connection_id: 1, date: "2026-03-05", amount: -45.00, description: "Domeinregistratie + hosting", counterparty: "TransIP", category: "Software", btw_rate: "21", is_business: true, is_income: false, classified_by: "auto", created_at: "2026-03-05" },
  { id: 12, bank_connection_id: 1, date: "2026-03-01", amount: 4100.00, description: "App prototype & wireframes", counterparty: "Makelaardij Smit", category: "Omzet", btw_rate: "21", is_business: true, is_income: true, classified_by: "auto", created_at: "2026-03-01" },
];

const DEMO_INVOICES = [
  { id: 1, user_id: 1, invoice_number: "2026-001", client_name: "Bakkerij van Dam B.V.", amount_excl_btw: 1983.47, btw_rate: 21, btw_amount: 416.53, amount_incl_btw: 2400.00, due_date: "2026-04-24", is_paid: true, matched_transaction_id: 1, created_at: "2026-04-10" },
  { id: 2, user_id: 1, invoice_number: "2026-002", client_name: "Fietsenwinkel De Groot", amount_excl_btw: 1528.93, btw_rate: 21, btw_amount: 321.07, amount_incl_btw: 1850.00, due_date: "2026-04-19", is_paid: true, matched_transaction_id: 3, created_at: "2026-04-05" },
  { id: 3, user_id: 1, invoice_number: "2026-003", client_name: "Bloemenhandel Jansen", amount_excl_btw: 2644.63, btw_rate: 21, btw_amount: 555.37, amount_incl_btw: 3200.00, due_date: "2026-04-11", is_paid: true, matched_transaction_id: 6, created_at: "2026-03-28" },
  { id: 4, user_id: 1, invoice_number: "2026-004", client_name: "Makelaardij Smit", amount_excl_btw: 3388.43, btw_rate: 21, btw_amount: 711.57, amount_incl_btw: 4100.00, due_date: "2026-03-29", is_paid: true, matched_transaction_id: 12, created_at: "2026-03-01" },
  { id: 5, user_id: 1, invoice_number: "2026-005", client_name: "Tandartspraktijk Visser", amount_excl_btw: 2479.34, btw_rate: 21, btw_amount: 520.66, amount_incl_btw: 3000.00, due_date: "2026-04-30", is_paid: false, matched_transaction_id: null, created_at: "2026-04-11" },
];

const DEMO_BTW_DECLARATIONS = [
  { id: 1, user_id: 1, year: 2025, quarter: 4, total_income: 18200, total_expenses: 3150, btw_collected: 3822, btw_paid: 549.78, btw_owed: 3272.22, status: "submitted", submitted_at: "2026-01-28", created_at: "2026-01-25" },
  { id: 2, user_id: 1, year: 2026, quarter: 1, total_income: 14000, total_expenses: 2850, btw_collected: 2940, btw_paid: 498.75, btw_owed: 2441.25, status: "concept", submitted_at: null, created_at: "2026-04-01" },
];

class ApiClient {
  private token: string | null = null;
  private demoMode = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("klaarboek_token");
      this.demoMode = localStorage.getItem("klaarboek_demo") === "true";
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
    this.demoMode = false;
    if (typeof window !== "undefined") {
      localStorage.removeItem("klaarboek_token");
      localStorage.removeItem("klaarboek_demo");
    }
  }

  enableDemo() {
    this.demoMode = true;
    this.token = "demo";
    if (typeof window !== "undefined") {
      localStorage.setItem("klaarboek_token", "demo");
      localStorage.setItem("klaarboek_demo", "true");
    }
  }

  isDemo() {
    return this.demoMode;
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
    if (email === "demo@klaarboek.nl" && password === "demo") {
      this.enableDemo();
      return { access_token: "demo" };
    }

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
    this.demoMode = false;
    if (typeof window !== "undefined") localStorage.removeItem("klaarboek_demo");
    this.setToken(data.access_token);
    return data;
  }

  async getProfile() {
    if (this.demoMode) return { id: 1, email: "demo@klaarboek.nl", kvk_number: "12345678", btw_number: "NL001234567B01", company_name: "Demo Design Studio", created_at: "2025-09-01" };
    return this.request<{ id: number; email: string; kvk_number: string | null; btw_number: string | null; company_name: string | null; created_at: string }>("/auth/me");
  }

  async updateProfile(data: { company_name?: string; kvk_number?: string; btw_number?: string }) {
    if (this.demoMode) return { id: 1, email: "demo@klaarboek.nl", ...data, kvk_number: data.kvk_number ?? "12345678", btw_number: data.btw_number ?? "NL001234567B01", company_name: data.company_name ?? "Demo Design Studio", created_at: "2025-09-01" };
    return this.request<{ id: number; email: string; kvk_number: string | null; btw_number: string | null; company_name: string | null; created_at: string }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Transactions update
  async updateTransaction(id: number, data: { category?: string; btw_rate?: string; is_business?: boolean; is_income?: boolean; description?: string; counterparty?: string }) {
    if (this.demoMode) return { id, ...data };
    return this.request(`/transactions/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  }

  async classifyTransactions() {
    if (this.demoMode) return { classified: 12 };
    return this.request<{ classified: number }>("/transactions/classify", { method: "POST" });
  }

  async deleteTransaction(id: number) {
    if (this.demoMode) return { ok: true };
    return this.request(`/transactions/${id}`, { method: "DELETE" });
  }

  // Dashboard
  async getCategoryBreakdown(period: "month" | "quarter" | "ytd" | "all" = "quarter") {
    if (this.demoMode) {
      return [
        { category: "Omzet",         total_income: 14000, total_expenses: 0,      transaction_count: 6 },
        { category: "Software",      total_income: 0,     total_expenses: 173.99, transaction_count: 3 },
        { category: "Huisvesting",   total_income: 0,     total_expenses: 125.00, transaction_count: 1 },
        { category: "Telecom",       total_income: 0,     total_expenses: 89.00,  transaction_count: 1 },
        { category: "Verzekeringen", total_income: 0,     total_expenses: 312.50, transaction_count: 1 },
      ];
    }
    return this.request<Array<{ category: string; total_income: number; total_expenses: number; transaction_count: number }>>(`/transactions/categories?period=${period}`);
  }

  async getDashboard(period: "month" | "quarter" | "ytd" | "all" = "quarter") {
    if (this.demoMode) {
      const demo = {
        month:   { total_income: 6450,  total_expenses: 199.99, btw_owed: 1083.77, profit: 6250.01,  transaction_count: 5 },
        quarter: { total_income: 14000, total_expenses: 650.49, btw_owed: 2320.97, profit: 13349.51, transaction_count: 12 },
        ytd:     { total_income: 14000, total_expenses: 650.49, btw_owed: 2320.97, profit: 13349.51, transaction_count: 12 },
        all:     { total_income: 32200, total_expenses: 3800.49, btw_owed: 4920.80, profit: 28399.51, transaction_count: 27 },
      };
      return demo[period];
    }
    return this.request<{ total_income: number; total_expenses: number; btw_owed: number; profit: number; transaction_count: number }>(`/transactions/dashboard?period=${period}`);
  }

  // Transactions
  async getTransactions(limit = 50, _offset = 0) {
    if (this.demoMode) return DEMO_TRANSACTIONS.slice(0, limit);
    return this.request<typeof DEMO_TRANSACTIONS>(`/transactions/?limit=${limit}&offset=${_offset}`);
  }

  async createTransaction(data: { bank_connection_id: number; date: string; amount: number; description?: string; counterparty?: string; category?: string; btw_rate?: string; is_business?: boolean; is_income?: boolean }) {
    if (this.demoMode) return { id: 99, ...data, classified_by: "manual", created_at: new Date().toISOString() };
    return this.request("/transactions/", { method: "POST", body: JSON.stringify(data) });
  }

  // Invoices
  async getInvoices(limit = 50, _offset = 0) {
    if (this.demoMode) return DEMO_INVOICES.slice(0, limit);
    return this.request<typeof DEMO_INVOICES>(`/invoices/?limit=${limit}&offset=${_offset}`);
  }

  async createInvoice(data: { client_name: string; client_email?: string; description?: string; invoice_number?: string; amount_excl_btw: number; btw_rate?: number; due_date?: string }) {
    if (this.demoMode) { const rate = data.btw_rate ?? 21; const btwAmt = data.amount_excl_btw * rate / 100; return { id: 99, user_id: 1, invoice_number: data.invoice_number ?? "2026-006", client_name: data.client_name, amount_excl_btw: data.amount_excl_btw, btw_rate: rate, btw_amount: btwAmt, amount_incl_btw: data.amount_excl_btw + btwAmt, due_date: data.due_date ?? null, is_paid: false, matched_transaction_id: null, created_at: new Date().toISOString().split("T")[0] }; }
    return this.request("/invoices/", { method: "POST", body: JSON.stringify(data) });
  }

  async updateInvoice(id: number, data: { client_name?: string; amount_excl_btw?: number; btw_rate?: number; due_date?: string; is_paid?: boolean }) {
    if (this.demoMode) return { id, ...data };
    return this.request(`/invoices/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  }

  async deleteInvoice(id: number) {
    if (this.demoMode) return { ok: true };
    return this.request(`/invoices/${id}`, { method: "DELETE" });
  }

  async downloadInvoicePdf(id: number) {
    if (this.demoMode) { alert("PDF download is niet beschikbaar in demo modus"); return; }
    const headers: Record<string, string> = {};
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    const res = await fetch(`${API_BASE}/invoices/${id}/pdf`, { headers });
    if (!res.ok) throw new Error("PDF download mislukt");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `factuur_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // BTW
  async getBTWDeclarations() {
    if (this.demoMode) return DEMO_BTW_DECLARATIONS;
    return this.request<typeof DEMO_BTW_DECLARATIONS>("/btw/declarations");
  }

  async calculateBTW(year: number, quarter: number) {
    if (this.demoMode) return { year, quarter, total_income: 14000, total_expenses: 2850, btw_collected: 2940, btw_paid: 498.75, btw_owed: 2441.25, transaction_count: 12 };
    return this.request<{ year: number; quarter: number; total_income: number; total_expenses: number; btw_collected: number; btw_paid: number; btw_owed: number; transaction_count: number }>(`/btw/calculate?year=${year}&quarter=${quarter}`);
  }

  async saveBTWDeclaration(year: number, quarter: number) {
    if (this.demoMode) return { id: 99, user_id: 1, year, quarter, total_income: 14000, total_expenses: 2850, btw_collected: 2940, btw_paid: 498.75, btw_owed: 2441.25, status: "concept", submitted_at: null, created_at: new Date().toISOString().split("T")[0] };
    return this.request(`/btw/declarations?year=${year}&quarter=${quarter}`, { method: "POST" });
  }

  // Bank connections
  async getBankConnections() {
    if (this.demoMode) return [{ id: 1, user_id: 1, bank_name: "ING", iban: "NL91INGB0001234567", is_active: true, connected_at: "2025-09-15" }];
    return this.request<Array<{ id: number; user_id: number; bank_name: string; iban: string; is_active: boolean; connected_at: string }>>("/banks/");
  }

  async createBankConnection(data: { bank_name: string; iban: string }) {
    if (this.demoMode) return { id: 99, user_id: 1, ...data, is_active: true, connected_at: new Date().toISOString().split("T")[0] };
    return this.request("/banks/", { method: "POST", body: JSON.stringify(data) });
  }

  async deleteBankConnection(id: number) {
    if (this.demoMode) return { ok: true };
    return this.request(`/banks/${id}`, { method: "DELETE" });
  }

  async deleteAccount() {
    if (this.demoMode) {
      alert("Account verwijderen is niet beschikbaar in demo modus");
      return;
    }
    const headers: Record<string, string> = {};
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    const res = await fetch(`${API_BASE}/auth/me`, { method: "DELETE", headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Verwijderen mislukt" }));
      throw new Error(err.detail || "Verwijderen mislukt");
    }
    this.clearToken();
  }

  async exportData() {
    if (this.demoMode) {
      alert("Data-export is niet beschikbaar in demo modus");
      return;
    }
    const headers: Record<string, string> = {};
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    const res = await fetch(`${API_BASE}/auth/export`, { headers });
    if (!res.ok) throw new Error("Export mislukt");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "klaarboek-export.zip";
    a.click();
    URL.revokeObjectURL(url);
  }

  async importBankCSV(connectionId: number, file: File): Promise<{ imported: number; skipped: number }> {
    if (this.demoMode) {
      return { imported: 0, skipped: 0 };
    }
    const fd = new FormData();
    fd.append("file", file);
    const headers: Record<string, string> = {};
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    const res = await fetch(`${API_BASE}/banks/${connectionId}/import`, {
      method: "POST",
      headers,
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Import mislukt" }));
      throw new Error(err.detail || "Import mislukt");
    }
    return res.json();
  }

  isLoggedIn() {
    return !!this.token;
  }
}

export const api = new ApiClient();
