export interface SalesEntry {
  id: string;
  date: string;
  booking: string;
  pnr: string;
  route: string;
  origin: string;
  destination: string;
  pax: number;
  amount: number;
  currency: string;
  agent: string;
  agentName: string;
  status: string;
  commission: number;
  ticketType: string;
}

export interface SalesStats {
  totalSales: number;
  totalCommission: number;
  totalPax: number;
  bookingCount: number;
  avgTicketPrice: number;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}