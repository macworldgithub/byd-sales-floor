export interface Lead {
  _id?: string;
  id?: number | string; // legacy support
  name: string;
  initials?: string;
  vehicle?: string;
  model?: string; // fallback / alias
  score?: number;
  stage?: string;
  status?: string;
  source?: string;
  lastTouch?: string;
  action?: string;
  priority?: string | boolean;
  assignedTo?: string;
  allocatedPersonFullName?: string;
  consultant?: string; // legacy support
  phone?: string;
  email?: string;
  notes?: string;
}

export interface Delivery {
  _id?: string;
  id?: number | string; // legacy support
  name: string;
  vehicle?: string;
  delivery_date?: string;
  date?: string; // legacy support
  stage?: string;
  contact_status?: string;
  status?: string; // legacy support
  rego?: string;
  vin?: string;
  salesperson?: string;
  agent?: string; // legacy support
  phone?: string;
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
    start: number;
    width: number;
    title: string;
    type: 'drive' | 'delivery' | 'hold' | 'followup';
  }[];
}

export interface ConversationThread {
  _id?: string;
  id: number | string;
  prospectName?: string;
  name?: string; // legacy
  initials?: string;
  lastMessage: string;
  time?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  msgCount?: number;
  model?: string;
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
