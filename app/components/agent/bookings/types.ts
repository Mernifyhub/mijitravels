// All shared TypeScript interfaces for the bookings module

export interface Passenger {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface Agent {
  agentName: string;
  agentId?: string;
}

export interface Booking {
  id: string;
  bookingId?: string;
  status: string;
  agent: Agent;
  tripType: string;
  pnr: string;
  carrier: string;
  route: string;
  departureDate: string;
  bookingDate: string;
  issuedBy?: string;   
  passengers: Passenger[];
  net: number;
  gross: number;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export interface Column {
  key: string;
  label: string;
}

export interface Props {
  defaultStatus?: string;
}