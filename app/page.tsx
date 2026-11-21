'use client';

import { DeliveryOperations } from '@/components/views/DeliveryOperations';
import { FloorSettings } from '@/components/views/FloorSettings';
import { CrmProvider } from '@/crm/lib/crmContext';
import { CrmWorkspace } from '@/components/views/CrmWorkspace';
import { LiveMetrics, PulseView, TasksView, PresenceCheckIn } from '@/components/views/FloorOperations';
import { floorNavigation, canOpenTab, isManager, resolveFloorTab } from '@/lib/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { DeliveryNotifications } from '@/components/customer/DeliveryProfile';
import { PostDeliveryFollowups } from '@/components/customer/PostDeliveryFollowups';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { TodayView } from '@/components/views/TodayView';
import { CalendarView } from '@/components/views/CalendarView';
import { LeadsView } from '@/components/views/LeadsView';
import { DeliveriesView } from '@/components/views/DeliveriesView';
import { ConversationsView } from '@/components/views/ConversationsView';
import { AllocationView } from '@/components/views/AllocationView';
import { PerformanceView } from '@/components/views/PerformanceView';
import { MoreView } from '@/components/views/MoreView';
import { SequencesView } from '@/components/views/SequencesView';
import { TemplateStudioView } from '@/components/views/TemplateStudioView';
import { StaffView } from '@/components/views/StaffView';
import { Customer360Modal } from '@/components/modals/Customer360Modal';
import { BookTestDriveModal } from '@/components/modals/BookTestDriveModal';
import { AddProspectModal } from '@/components/modals/AddProspectModal';
import { MessageModal } from '@/components/modals/MessageModal';
import { AddEventModal } from '@/components/modals/AddEventModal';
import { BulkMessageModal } from '@/components/modals/BulkMessageModal';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { AppraisalsView } from '@/components/appraisals/AppraisalsView';
import { useAuth } from '@/lib/auth';
import {
  leadApi,
  deliveryApi,
  conversationApi,
  statsApi,
  appointmentApi,
  messageApi,
} from '@/lib/api';
import { addToOutbox, flushOutbox } from '@/lib/offlineQueue';

import { Lead, Delivery, TimelineEvent, ConversationThread } from '@/lib/types';
import { messageRecipient } from '@/lib/messageRecipient';
import { isFloorAdmin, melbourneDateTime, melbourneDay } from '@/lib/floorCalendar';

export default function SalesFloorApp() { return <CrmProvider><SalesFloorContent/></CrmProvider>; }

function SalesFloorContent() {
  const { isAuthenticated, isLoading: authLoading, activeSite, user } = useAuth();
  const router = useRouter();

  // Navigation & Role State
  const [activeTab, setActiveTabState] = useState<string>('today');
  const setActiveTab = (tab: string) => {
    if (tab === 'more') { setIsMobileNavOpen(true); return; }
    if (!canOpenTab(tab, user?.role)) return;
    setActiveTabState(tab);
    const url = new URL(window.location.href); url.searchParams.set('tab', tab); for (const key of ['customer_id', 'lead_id', 'search']) url.searchParams.delete(key); window.history.pushState({}, '', url);
  };
  useEffect(() => {
    const restore = () => setActiveTabState(resolveFloorTab(window.location.search, user?.role));
    restore(); window.addEventListener('popstate', restore); return () => window.removeEventListener('popstate', restore);
  }, [user?.role]);
  const [role, setRole] = useState<'consultant' | 'manager' | 'principal' | 'super_admin'>('consultant');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [refreshKey, setRefreshKey] = useState(0);
  const [eventDate, setEventDate] = useState(melbourneDay);
  useEffect(() => { setRole(isFloorAdmin(user?.role) ? 'super_admin' : isManager(user?.role) ? 'manager' : 'consultant'); }, [user?.role]);

  // Modal States
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isBookDriveOpen, setIsBookDriveOpen] = useState<boolean>(false);
  const [bookDriveLead, setBookDriveLead] = useState<Lead | null>(null);
  const [isAddProspectOpen, setIsAddProspectOpen] = useState<boolean>(false);
  const [isMessageOpen, setIsMessageOpen] = useState<boolean>(false);
  const [messageLead, setMessageLead] = useState<Lead | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState<boolean>(false);
  const [isBulkMessageOpen, setIsBulkMessageOpen] = useState<boolean>(false);
  const [bulkMessageLeads, setBulkMessageLeads] = useState<Lead[]>([]);

  useEffect(() => { setSelectedLead(null); setMessageLead(null); setIsMessageOpen(false); setIsBulkMessageOpen(false); }, [activeSite, user?.id]);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, description?: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      description,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role === 'contractor') return;
    const leadId = new URLSearchParams(window.location.search).get('lead_id');
    if (!leadId) return;
    let active = true;
    void leadApi.getLead(leadId).then(response => {
      if (active && response.success && response.data) setSelectedLead(response.data);
    }).catch(error => { if (active) addToast('error', 'Enquiry unavailable', error.message); });
    return () => { active = false; };
  }, [isAuthenticated, user?.id, activeSite, addToast]);

  // Initial Fetch Effect
  useEffect(() => {
    if (!isAuthenticated || user?.role === 'contractor') return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [leadsRes, deliveriesRes, threadsRes] = await Promise.all([
          leadApi.getLeads({ limit: '30' }).catch(() => ({ success: false, data: [] })),
          deliveryApi.getClients({ limit: '30' }).catch(() => ({ success: false, data: [] })),
          conversationApi.getConversations().catch(() => ({ success: false, data: [] })),
        ]);
        setLeads(leadsRes.success ? leadsRes.data || [] : []);
        setDeliveries(deliveriesRes.success ? deliveriesRes.data || [] : []);
        setThreads(threadsRes.success ? threadsRes.data || [] : []);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, activeSite, user?.id, refreshKey]);

  useEffect(() => {
    if (!isAuthenticated || user?.role === 'contractor') return;
    let active = true;
    let pending = false;
    const refresh = async () => {
      if (pending || document.visibilityState !== 'visible') return;
      pending = true;
      try {
        const res = await conversationApi.getConversations();
        if (active && res.success && res.data) setThreads(res.data);
      } catch (err) { console.error('Message refresh failed:', err); }
      finally { pending = false; }
    };
    const timer = window.setInterval(refresh, 5000);
    window.addEventListener('focus', refresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [isAuthenticated, user?.role]);

  // Network State & Offline Queue Listener (§3.1, §8.2, §10 AC #9)
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      addToast('info', 'Network Reconnected', 'Flushing offline outbox queue to Lead Centre...');
      const { flushed } = await flushOutbox(async (item) => {
        if (item.type === 'create_prospect') {
          const res = await leadApi.createLead(item.payload);
          return res.success;
        } else if (item.type === 'add_note') {
          const res = await leadApi.addNote(item.payload.leadId, item.payload.note);
          return res.success;
        }
        return true;
      });
      if (flushed > 0) {
        addToast('success', 'Outbox Synchronized', `${flushed} offline action(s) synced to server.`);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      addToast('warning', 'Floor Offline Mode', 'Actions will be safely queued locally and synced on reconnect.');
    };

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [addToast]);

  // Handlers wired to Backend API
  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleOpenBookDrive = (lead?: Lead) => {
    setEventDate(melbourneDay());
    setBookDriveLead(lead || null);
    setIsBookDriveOpen(true);
  };

  const handleOpenMessage = (lead?: Lead | ConversationThread) => {
    setMessageLead(lead ? messageRecipient(lead, leads) : leads[0] || null);
    setIsMessageOpen(true);
  };

  const handleAddProspect = async (newLeadData: Omit<Lead, 'id' | 'initials'>) => {
    const stageMap: Record<string, string> = { Imported: 'NEW ENQUIRIES', Engaged: 'IN FOLLOW-UP', Qualified: 'AI QUALIFYING', Committed: 'COMMITTED', Delivered: 'DELIVERED', Lost: 'LOST' };
    const payload = { ...newLeadData, vehicle: newLeadData.vehicle || newLeadData.model,
      stage: stageMap[newLeadData.stage || ''] || newLeadData.stage || 'NEW ENQUIRIES', dealer: activeSite };
    if (!navigator.onLine) {
      addToOutbox('create_prospect', payload);
      addToast('info', 'Prospect queued offline', 'This prospect will appear on the floor after it has synchronized with the server.');
      return;
    }
    try {
      const response = await leadApi.createLead(payload);
      if (!response.success || !response.data) throw new Error(response.message || 'The prospect was not saved.');
      setLeads(previous => [response.data!, ...previous]);
      setRefreshKey(value => value + 1);
      addToast('success', 'Prospect saved', `${newLeadData.name} was added to the Lead Centre.`);
    } catch (error) {
      addToast('error', 'Prospect not saved', error instanceof Error ? error.message : 'Please try again.');
      throw error;
    }
  };

  const handleSendMessage = async (message: string, recipientName: string): Promise<boolean> => {
    if (!messageLead?.phone || !message.trim()) {
      addToast('error', 'SMS not sent', 'Choose a customer with a mobile number.');
      return false;
    }
    try {
      const res = await messageApi.sendMessage({
        phone: messageLead.phone,
        body: message.trim(),
        client_name: recipientName,
        leadId: messageLead.client_id ? undefined : messageLead._id,
        client_id: messageLead.client_id,
        site: messageLead.dealer || messageLead.dealerName,
      });
      if (!res.success) throw new Error(res.message || 'SMS dispatch failed');
      const threads = await conversationApi.getConversations().catch(() => null);
      if (threads?.success && threads.data) setThreads(threads.data);
      addToast('success', (res as any).simulated ? 'SMS simulated' : 'SMS sent', `Message sent to ${recipientName}.`);
      return true;
    } catch (err: any) {
      addToast('error', 'SMS failed', err.message || 'The message could not be sent.');
      return false;
    }
  };

  const handleUpdateLeadStage = async (leadId: string, newStage?: string) => {
    if (!newStage) return;
    const response = await leadApi.updateLead(leadId, { stage: newStage });
    if (!response.success) throw new Error(response.message || 'Stage was not saved.');
    setRefreshKey(value => value + 1);
  };

  const handleAddLeadNote = async (leadId: string, note: string) => {
    const response = await leadApi.addNote(leadId, note);
    if (!response.success) throw new Error(response.message || 'Note was not saved.');
    setRefreshKey(value => value + 1);
  };

  const handleAddCalendarEvent = async (event: TimelineEvent) => {
    const start = melbourneDateTime(event.date || eventDate, event.time);
    const end = melbourneDateTime(event.date || eventDate, event.end);
    const durationMinutes = (Date.parse(end) - Date.parse(start)) / 60000;
    if (durationMinutes <= 0) throw new Error('End time must be after the start time.');
    const result = await appointmentApi.createAppointment({
      prospectName: event.title, when: start, type: event.type === 'drive' ? 'Test Drive' : event.type === 'followup' ? 'Callback' : 'Showroom Visit',
      notes: event.detail, durationMinutes, floorCategory: event.type, bookingRequestId: event.bookingRequestId,
    });
    if (!result.success) throw new Error(result.message || 'Event could not be saved');
    setRefreshKey(value => value + 1);
    addToast('success', 'Event saved', event.title);
  };

  const unassignedCount = leads.filter((l) => !l.consultant || l.stage === 'Imported').length;
  const unreadCount = threads.filter((t) => t.unreadCount).length;

  if (authLoading || (!isAuthenticated && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7]">
        <div className="w-8 h-8 rounded-full border-4 border-slate-300 border-t-[#e60012] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        unreadConversationsCount={unreadCount}
        unassignedLeadsCount={unassignedCount}
      />

      {/* Main Application Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Global Search (§5.11) & Offline Status */}
        <Header
          role={role}
          setRole={() => {}}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onSelectLead={handleSelectLead}
          isOnline={isOnline}
        />

        {user?.role !== 'contractor' && <><DeliveryNotifications/><PostDeliveryFollowups/></>}
        {/* Scrollable View Area */}
        <main className="app-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {activeTab === 'today' && (<>
                <LiveMetrics/><PresenceCheckIn/>
                <TodayView
                  refreshKey={refreshKey}
                  onSelectLead={handleSelectLead}
                  onOpenBookDrive={handleOpenBookDrive}
                  onOpenAddProspect={() => setIsAddProspectOpen(true)}
                  onOpenMessage={(l) => handleOpenMessage(l)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                /></>
              )}

              {activeTab === 'calendar' && (
                <CalendarView
                  refreshKey={refreshKey}
                  onOpenAddEvent={(date) => { setEventDate(date); setIsAddEventOpen(true); }}
                  onOpenBookDrive={(date) => { handleOpenBookDrive(); setEventDate(date); }}
                />
              )}

              {activeTab === 'leads' && (
                <LeadsView
                  leads={leads}
                  onSelectLead={handleSelectLead}
                  onOpenAddProspect={() => setIsAddProspectOpen(true)}
                  onOpenBookDrive={handleOpenBookDrive}
                  onOpenMessage={(l) => handleOpenMessage(l)}
                  onOpenBulkMessage={(selected) => {
                    setBulkMessageLeads(selected);
                    setIsBulkMessageOpen(true);
                  }}
                />
              )}

              {activeTab === 'deliveries' && <DeliveryOperations/>}

              {activeTab === 'conversations' && (
                <ConversationsView
                  threads={threads}
                  onSelectThread={(th) => handleOpenMessage(th)}
                  onOpenNewMessage={() => handleOpenMessage()}
                />
              )}

              {activeTab === 'allocation' && <AllocationView onAssigned={() => setRefreshKey(value => value + 1)} />}
              {activeTab === 'pulse' && <PulseView onSelectLead={handleSelectLead}/>}
              {activeTab === 'tasks' && <TasksView/>}
              {user?.role !== 'contractor' && <CrmWorkspace tab={activeTab}/>}
              {activeTab === 'settings' && <FloorSettings/>}

              {activeTab === 'more' && (
                <MoreView
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenBookDrive={() => handleOpenBookDrive()}
                  onOpenAddProspect={() => setIsAddProspectOpen(true)}
                />
              )}

              {activeTab === 'sequences' && <SequencesView />}

              {activeTab === 'templates' && <TemplateStudioView />}

              {activeTab === 'staff' && <StaffView />}
              {activeTab === 'appraisals' && <AppraisalsView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        role={role}
        setRole={setRole}
      />

      {/* Full Customer 360 Modal (§5.6) */}
      <Customer360Modal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onOpenBookDrive={(lead) => handleOpenBookDrive(lead)}
        onOpenMessage={(lead) => handleOpenMessage(lead)}
        onChanged={() => { setRefreshKey(value => value + 1); if (selectedLead?._id) void leadApi.getLead(selectedLead._id).then(response => { if (response.success && response.data) setSelectedLead(current => current?._id === response.data?._id ? response.data! : current); }).catch(() => {}); }}
        onUpdateStage={handleUpdateLeadStage}
        onAddNote={handleAddLeadNote}
      />

      {/* Book Test Drive Modal */}
      <BookTestDriveModal
        isOpen={isBookDriveOpen}
        onClose={() => setIsBookDriveOpen(false)}
        lead={bookDriveLead}
        onBooked={() => setRefreshKey(value => value + 1)}
        initialDate={eventDate}
      />

      {/* Add Prospect Modal with Duplicate Guard (§5.4) */}
      <AddProspectModal
        isOpen={isAddProspectOpen}
        onClose={() => setIsAddProspectOpen(false)}
        onAddLead={handleAddProspect}
        onWarning={message => addToast('warning', 'Welcome SMS not confirmed', message)}
        onOpenExisting={(existing) => {
          setSelectedLead(existing);
        }}
      />

      {/* Message Modal with 10 Compliant Template Packs (§5.7) */}
      <MessageModal
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
        lead={messageLead}
        conversationMessages={threads.find(t => t.phone && t.phone.replace(/\D/g, '').replace(/^0/, '61') === (messageLead?.phone || '').replace(/\D/g, '').replace(/^0/, '61'))?.messages || []}
        onSendMessage={handleSendMessage}
      />

      {/* Add Calendar Event Modal */}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onAddEvent={handleAddCalendarEvent}
        initialDate={eventDate}
      />

      {/* Bulk Broadcast SMS Modal with ACMA Suppression (§3.2) */}
      <BulkMessageModal
        isOpen={isBulkMessageOpen}
        onClose={() => setIsBulkMessageOpen(false)}
        leads={bulkMessageLeads}
        onBroadcastSuccess={(sent, suppressed) => {
          addToast(
            'success',
            'Bulk SMS Broadcast Complete',
            `Dispatched ${sent} message${sent === 1 ? '' : 's'} (${suppressed} suppressed for ACMA opt-out).`
          );
        }}
      />

      {/* Toasts Feedback */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
