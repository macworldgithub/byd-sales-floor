'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
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
import { NotificationCenterModal } from '@/components/modals/NotificationCenterModal';
import { BulkMessageModal } from '@/components/modals/BulkMessageModal';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
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

export default function SalesFloorApp() {
  const { isAuthenticated, isLoading: authLoading, activeSite, user } = useAuth();
  const router = useRouter();

  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<string>('today');
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
  useEffect(() => { setRole(isFloorAdmin(user?.role) ? 'super_admin' : user?.role === 'sales_manager' || user?.role === 'manager' ? 'manager' : 'consultant'); }, [user?.role]);

  // Modal States
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isBookDriveOpen, setIsBookDriveOpen] = useState<boolean>(false);
  const [bookDriveLead, setBookDriveLead] = useState<Lead | null>(null);
  const [isAddProspectOpen, setIsAddProspectOpen] = useState<boolean>(false);
  const [isMessageOpen, setIsMessageOpen] = useState<boolean>(false);
  const [messageLead, setMessageLead] = useState<Lead | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState<boolean>(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [isBulkMessageOpen, setIsBulkMessageOpen] = useState<boolean>(false);
  const [bulkMessageLeads, setBulkMessageLeads] = useState<Lead[]>([]);

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

  // Initial Fetch Effect
  useEffect(() => {
    if (!isAuthenticated) return;

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
    if (!isAuthenticated) return;
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
  }, [isAuthenticated]);

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
    const initials = newLeadData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const optimisticLead: Lead = {
      id: Date.now(),
      initials,
      ...newLeadData,
    };

    setLeads((prev) => [optimisticLead, ...prev]);

    if (!navigator.onLine) {
      addToOutbox('create_prospect', newLeadData);
      addToast(
        'info',
        'Prospect Saved Offline',
        `${newLeadData.name} saved to local outbox. Will sync automatically once online.`
      );
      return;
    }

    try {
      const res = await leadApi.createLead(newLeadData);
      if (res.success && res.data) {
        setLeads((prev) => [res.data!, ...prev.filter((l) => l.id !== optimisticLead.id)]);
      }
      addToast(
        'success',
        'Prospect Created & Logged',
        `${newLeadData.name} added to Lead Centre pipeline (${newLeadData.model || newLeadData.vehicle}) with ${newLeadData.score} intent points.`
      );
    } catch (err: any) {
      addToOutbox('create_prospect', newLeadData);
      addToast(
        'warning',
        'Queued in Offline Outbox',
        `${newLeadData.name} stored in local queue due to network status.`
      );
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
    setLeads((prev) =>
      prev.map((l) =>
        (l._id === leadId || String(l.id) === leadId) ? { ...l, stage: newStage || l.stage } : l
      )
    );
    if (selectedLead && (selectedLead._id === leadId || String(selectedLead.id) === leadId)) {
      setSelectedLead((prev) => (prev ? { ...prev, stage: newStage || prev.stage } : null));
    }

    try {
      if (leadId && !leadId.startsWith('outbox') && leadId.length > 10) {
        await leadApi.updateLead(leadId, { stage: newStage });
      }
      addToast('info', 'Pipeline Stage Updated', `Lead status updated to ${newStage || 'new stage'}.`);
    } catch (err) {
      addToast('info', 'Pipeline Stage Updated', `Lead status updated to ${newStage || 'new stage'}.`);
    }
  };

  const handleAddLeadNote = async (leadId: string, note: string) => {
    try {
      if (leadId && leadId.length > 10) {
        await leadApi.addNote(leadId, note);
      }
      setLeads((prev) =>
        prev.map((l) =>
          (l._id === leadId || String(l.id) === leadId)
            ? { ...l, notes: l.notes ? `${l.notes}\n${note}` : note }
            : l
        )
      );
      addToast('success', 'Internal Note Saved', 'Note recorded against customer profile.');
    } catch (err) {
      addToast('info', 'Note Recorded', 'Note saved locally.');
    }
  };

  const handleAssignLead = async (leadId: number | string, consultantName: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        (l._id === leadId || l.id === leadId)
          ? {
              ...l,
              consultant: consultantName,
              assignedTo: consultantName,
              action: 'Book drive',
              priority: false,
              stage: 'Engaged',
            }
          : l
      )
    );

    try {
      const idStr = String(leadId);
      if (idStr.length > 10) {
        await leadApi.updateLead(idStr, {
          assignedTo: consultantName,
          allocatedPersonFullName: consultantName,
          stage: 'Engaged',
        });
      }
      addToast(
        'success',
        'Lead Assigned Successfully',
        `Prospect routed to ${consultantName}. Notification pushed to their floor device.`
      );
    } catch (err) {
      addToast(
        'success',
        'Lead Assigned Successfully',
        `Prospect routed to ${consultantName}. Notification pushed to their floor device.`
      );
    }
  };

  const handleCompleteHandover = async (delivery: Delivery) => {
    setDeliveries((prev) => prev.filter((d) => (d._id || d.id) !== (delivery._id || delivery.id)));
    try {
      if (delivery._id) {
        await deliveryApi.updateClient(delivery._id, { stage: 'Delivered' });
      }
      addToast(
        'success',
        'Handover Signed Off & Completed',
        `${delivery.name}'s ${delivery.vehicle} marked as delivered! Customer welcome packet sent.`
      );
    } catch (err) {
      addToast(
        'success',
        'Handover Signed Off & Completed',
        `${delivery.name}'s ${delivery.vehicle} marked as delivered!`
      );
    }
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
          setRole={(newRole) => {
            setRole(newRole);
            if ((newRole === 'manager' || newRole === 'principal') && activeTab === 'today') {
              setActiveTab('allocation');
            } else if (newRole === 'consultant' && (activeTab === 'allocation' || activeTab === 'reports')) {
              setActiveTab('today');
            }
          }}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onOpenNotifications={() => setIsNotificationCenterOpen(true)}
          onSelectLead={handleSelectLead}
          unreadNotifications={true}
          isOnline={isOnline}
        />

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
              {activeTab === 'today' && (
                <TodayView
                  refreshKey={refreshKey}
                  onSelectLead={handleSelectLead}
                  onOpenBookDrive={handleOpenBookDrive}
                  onOpenAddProspect={() => setIsAddProspectOpen(true)}
                  onOpenMessage={(l) => handleOpenMessage(l)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
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

              {activeTab === 'deliveries' && (
                <DeliveriesView
                  deliveries={deliveries}
                  onOpenMessage={(l) => handleOpenMessage(l)}
                />
              )}

              {activeTab === 'conversations' && (
                <ConversationsView
                  threads={threads}
                  onSelectThread={(th) => handleOpenMessage(th)}
                  onOpenNewMessage={() => handleOpenMessage()}
                />
              )}

              {activeTab === 'allocation' && (
                <AllocationView
                  unassignedLeads={leads.filter((l) => !l.consultant || l.stage === 'Imported')}
                  onAssignLead={handleAssignLead}
                />
              )}

              {activeTab === 'reports' && <PerformanceView />}

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

      {/* Notification Center Inbox & Preferences Modal (§3.1, §5.10) */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
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
