import React from "react";

// ─── Types specific to UserSalesReport (stats dashboard) ──────────────────────

export interface StatData {
  value:       number;
  change:      number;
  changeType:  "increase" | "decrease" | "neutral";
}

export interface StatsResponse {
  searchCount:      StatData;
  agentCount:       StatData;
  totalFlyer:       StatData;
  totalSegments:    StatData;
  bookingCount:     StatData;
  issueCount:       StatData;
  bookingCancelled: StatData;
  pendingBookings:  StatData;
  ticketedAmount:   StatData;
  depositAmount:    StatData;
  depositCount:     StatData;
  lossProfit:       StatData;
  commission:       StatData;
  refundCount:      StatData;
  refundAmount:     StatData;
  reissueCount:     StatData;
  reissueAmount:    StatData;
  voidCount:        StatData;
  voidAmount:       StatData;
}

export interface SummaryData {
  ticketedAmount:  number;
  bookingCount:    number;
  profitLoss:      number;
  totalFlyer:      number;
  commission:      number;
  depositAmount:   number;
  avgTicketValue:  number;
  conversionRate:  number;
  profitMargin:    number;
}

export interface TopRoute {
  route:      string;
  count:      number;
  percentage: number;
}

export interface ApiResponse {
  success:   boolean;
  stats:     StatsResponse;
  summary:   SummaryData;
  topRoutes: TopRoute[];
  dateRange: {
    startDate: string;
    endDate:   string;
  };
}

// ✅ Fixed — JSX.Element → React.ReactElement
export interface StatItem {
  id:          string;
  label:       string;
  value:       number;
  change:      number;
  changeType:  "increase" | "decrease" | "neutral";
  icon:        React.ReactElement;
  color:       string;
  bgColor:     string;
  borderColor: string;
  format:      "number" | "currency" | "percentage";
  category:    "overview" | "booking" | "financial" | "operations";
}

export interface DateRange {
  label: string;
  value: string;
}

export interface ReportToast {
  id:      string;
  message: string;
  type:    "success" | "error" | "info" | "warning";
}