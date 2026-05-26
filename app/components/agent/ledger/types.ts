export interface LedgerEntry {
  id: string;
  date: string;
  type: string;
  category: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  status: string;
  isCredit: boolean;
  meta: Record<string, unknown>;
  balance?: number;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export interface LedgerSummary {
  currentBalance: number;
  totalCredit: number;
  totalDebit: number;
  totalTransactions: number;
  creditLimit: number;
  usedLimit: number;
  depositTotal: number;
  bookingTotal: number;
  pendingDepositTotal: number;
}