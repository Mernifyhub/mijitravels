// app/components/admin/request-process/types.ts

export interface TypeMapEntry {
  title: string;
  color: string;
  icon: React.ReactElement;
}

export interface ColorMapEntry {
  btn: string;
  badge: string;
  light: string;
  text: string;
}

export interface RequestData {
  id: string;
  status: string;
  remarks?: string;
  createdAt?: string;
  gdsPnr?: string;
  assignedToId?: string | null;
  assignedAt?: string | null;
  assignedTo?: {
    agentName?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  booking?: any;
  agent?: any;
}