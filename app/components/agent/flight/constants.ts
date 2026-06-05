// app/components/flight/constants.ts

import { PassengerForm } from "./types";

export const TITLES: Record<"ADULT" | "CHILD" | "INFANT", string[]> = {
  ADULT:  ["MR", "MRS", "MS"],
  CHILD:  ["MSTR", "MISS"],
  INFANT: ["INF"],
};

export const NATIONALITIES = [
  "Saudi Arabian", "Bangladeshi", "Pakistani", "Indian", "Filipino",
  "Egyptian", "Yemeni", "Syrian", "Jordanian", "Lebanese",
  "British", "American", "Canadian", "Australian", "German",
  "French", "Emirati", "Kuwaiti", "Qatari", "Bahraini",
];

export const defaultPassenger = (
  type: "ADULT" | "CHILD" | "INFANT",
): PassengerForm => ({
  title: "", firstName: "", lastName: "", gender: "",
  dateOfBirth: "", nationality: "", passportNumber: "",
  passportExpiry: "", email: "", phone: "", type,
});