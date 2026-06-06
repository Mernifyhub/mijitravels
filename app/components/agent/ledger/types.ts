export interface LedgerEntry {
  id: string;
  date: string;
  type: string;
  category: string;
  sourceType?: string;
  isCredit?: boolean;
  debit: number;
  credit: number;
  balanceAfter: number;
  balance?: number;          // ← এটা add করুন
  description: string;
  reference: string;
  invoiceNo?: string;
  pnr?: string;
  systemPnr?: string;
  status?: string;
  meta?: {
    pnr?: string;
    systemPnr?: string;
    bookingId?: string;
    depositId?: string;
    operationId?: string;
    flightDate?: string;
    note?: string;
    createdBy?: string;
    sourceId?: string;
    currency?: string;
  };
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
  rawBalance?: number;
  availableCredit?: number;
  totalAvailableToBook?: number;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}