// app/components/flight/types.ts

export interface PassengerForm {
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  email: string;
  phone: string;
  type: "ADULT" | "CHILD" | "INFANT";
}

export interface UserBalance {
  balance: number;
  currency: string;
  creditLimit: number;
  usedLimit: number;
  availableCredit: number;
  totalAvailable: number;
}

export interface Segment {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  airline: string;
  flightNo: string;
  duration?: string;
}