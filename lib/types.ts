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
  platform?: string;
  lastTouch?: string;
  action?: string;
  priority?: string | boolean;
  assignedTo?: string;
  allocatedPersonFullName?: string;
  consultant?: string; // legacy support
  phone?: string;
  email?: string;
  notes?: string;
  leadIdShort?: string;
  dealer?: string;
  dealerName?: string;
  virtualyardId?: string;
  vyStage?: string;
  vyStatus?: string;
  tag?: string;
  tags?: string[];
  testDrive?: {
    testDriveDate?: string | null;
    location?: string;
    status?: string;
    confirmed?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
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
  email?: string;
  vy_order_id?: string;
  comments?: {
    _id?: string;
    author_name: string;
    body: string;
    created_at: string;
  }[];
  accessories?: {
    _id?: string;
    name: string;
    status: string;
    note?: string;
  }[];
  documents?: {
    _id?: string;
    title: string;
    document_type: string;
    status: string;
  }[];
}

export interface Appointment {
  _id?: string;
  leadId?: string;
  prospectName: string;
  consultantName?: string;
  vehicle?: string;
  type: 'Test Drive' | 'Callback' | 'Showroom Visit';
  when: string;
  duration?: number;
  notes?: string;
  status: 'Booked' | 'Completed' | 'No Show' | 'Cancelled';
  createdAt?: string;
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
  messages?: {
    id: string;
    sender: 'ai' | 'user' | 'agent' | 'system';
    text: string;
    time: string;
    status?: string;
  }[];
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

export interface Customer360Data {
  lead?: Lead;
  delivery?: Delivery;
  matchConfidence: number; // 0 - 100
  matchSource: 'mobile' | 'email' | 'id' | 'none';
  appointments: Appointment[];
  timeline: {
    id: string;
    date: string;
    time: string;
    title: string;
    description: string;
    source: 'Lead Centre' | 'Delivery Centre' | 'Showroom Floor';
    category: 'lead' | 'sms' | 'appointment' | 'delivery' | 'note' | 'handover';
    badge?: string;
  }[];
  conversations: ConversationThread[];
  notes: string[];
}

export interface DuplicateCheckResult {
  success: boolean;
  duplicate: boolean;
  matchType?: 'lead' | 'client';
  matchRecord?: any;
  message?: string;
}
