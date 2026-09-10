export interface Lead {
  id: number;
  name: string;
  initials: string;
  model: string;
  score: number;
  stage: 'Imported' | 'Engaged' | 'Qualified' | 'Committed';
  source: string;
  lastTouch: string;
  action: string;
  priority?: boolean;
  consultant?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface Delivery {
  id: number;
  name: string;
  vehicle: string;
  date: string;
  stage: 'Ready for Pickup' | 'PDI' | 'In Transit';
  status: 'Contacted' | 'Not contacted';
  rego: string;
  vin: string;
  agent: string;
}

export interface TimelineEvent {
  time: string;
  end: string;
  title: string;
  detail: string;
  type: 'drive' | 'delivery' | 'hold' | 'followup';
}

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  load: number;
  events: {
    start: number; // percentage or slot
    width: number;
    title: string;
    type: 'drive' | 'delivery' | 'hold' | 'followup';
  }[];
}

export interface ConversationThread {
  id: number;
  name: string;
  initials: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  model: string;
  optOutSuppressed?: boolean;
}

export interface FleetVehicle {
  id: string;
  model: string;
  plate: string;
  battery: string;
  status: 'Ready' | 'In Use' | 'Charging';
  location: string;
}

export interface ConsultantCapacity {
  id: string;
  name: string;
  initials: string;
  leadsCount: number;
  capacityPct: number;
  status: string;
  warning?: string;
}
