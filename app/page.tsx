'use client';

import React, { useState } from 'react';
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
import { LeadDetailModal } from '@/components/modals/LeadDetailModal';
import { BookTestDriveModal } from '@/components/modals/BookTestDriveModal';
import { AddProspectModal } from '@/components/modals/AddProspectModal';
import { MessageModal } from '@/components/modals/MessageModal';
import { AddEventModal } from '@/components/modals/AddEventModal';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import {
  INITIAL_LEADS,
  INITIAL_DELIVERIES,
  TODAY_TIMELINE_EVENTS,
  CONVERSATION_THREADS,
} from '@/lib/data';
import { Lead, Delivery, TimelineEvent, ConversationThread } from '@/lib/types';

export default function SalesFloorApp() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<string>('today');
  const [role, setRole] = useState<'consultant' | 'manager'>('consultant');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Data State
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [deliveries, setDeliveries] = useState<Delivery[]>(INITIAL_DELIVERIES);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(TODAY_TIMELINE_EVENTS);
  const [threads, setThreads] = useState<ConversationThread[]>(CONVERSATION_THREADS);

  // Modal States
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isBookDriveOpen, setIsBookDriveOpen] = useState<boolean>(false);
  const [bookDriveLead, setBookDriveLead] = useState<Lead | null>(null);
  const [isAddProspectOpen, setIsAddProspectOpen] = useState<boolean>(false);
  const [isMessageOpen, setIsMessageOpen] = useState<boolean>(false);
  const [messageLead, setMessageLead] = useState<Lead | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, description?: string) => {
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
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Handlers
  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleOpenBookDrive = (lead?: Lead) => {
    setBookDriveLead(lead || null);
    setIsBookDriveOpen(true);
  };

  const handleOpenMessage = (lead?: Lead | ConversationThread) => {
    if (lead && 'stage' in lead) {
      setMessageLead(lead as Lead);
    } else if (lead) {
      const found = leads.find((l) => l.name === lead.name);
      if (found) {
        setMessageLead(found);
      } else {
        setMessageLead({
          id: lead.id,
          name: lead.name,
          initials: lead.initials,
          model: lead.model,
          score: 70,
          stage: 'Engaged',
          source: 'Chat',
          lastTouch: 'Just now',
          action: 'Message',
          phone: '+61 412 890 234',
        });
      }
    } else {
      setMessageLead(leads[0]);
    }
    setIsMessageOpen(true);
  };

  const handleConfirmTestDrive = (data: {
    customerName: string;
    model: string;
    loop: string;
    time: string;
    date: string;
  }) => {
    const newEvent: TimelineEvent = {
      time: data.time.split(' ')[0],
      end: '10:00',
      title: `Test drive · ${data.customerName}`,
      detail: `${data.model} · ${data.loop.split('(')[0]}`,
      type: 'drive',
    };
    setTimelineEvents((prev) => [newEvent, ...prev]);
    addToast(
      'success',
      'Test Drive Confirmed',
      `${data.model} reserved for ${data.customerName} at ${data.time}. Staged in Bay 1.`
    );
  };

  const handleAddProspect = (newLeadData: Omit<Lead, 'id' | 'initials'>) => {
    const initials = newLeadData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const createdLead: Lead = {
      id: Date.now(),
      initials,
      ...newLeadData,
    };

    setLeads((prev) => [createdLead, ...prev]);
    addToast(
      'success',
      'Prospect Created & Logged',
      `${createdLead.name} added to pipeline (${createdLead.model}) with ${createdLead.score} intent points.`
    );
  };

  const handleSendMessage = (message: string, recipientName: string) => {
    setThreads((prev) => [
      {
        id: Date.now(),
        name: recipientName,
        initials: recipientName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase(),
        lastMessage: message,
        time: 'Just now',
        model: messageLead?.model || 'BYD Range',
      },
      ...prev.filter((t) => t.name !== recipientName),
    ]);

    addToast(
      'success',
      'SMS Outreach Dispatched',
      `Message sent to ${recipientName} via BYD Verified Gateway.`
    );
  };

  const handleUpdateLeadStage = (leadId: number, newStage: Lead['stage']) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
    addToast('info', 'Pipeline Stage Updated', `Lead status updated to ${newStage}.`);
  };

  const handleAssignLead = (leadId: number, consultantName: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              consultant: consultantName,
              action: 'Book drive',
              priority: false,
              stage: 'Engaged',
            }
          : l
      )
    );
    addToast(
      'success',
      'Lead Assigned Successfully',
      `Prospect routed to ${consultantName}. Notification pushed to their floor device.`
    );
  };

  const handleCompleteHandover = (delivery: Delivery) => {
    setDeliveries((prev) => prev.filter((d) => d.id !== delivery.id));
    addToast(
      'success',
      'Handover Signed Off & Completed',
      `${delivery.name}'s ${delivery.vehicle} marked as delivered! Customer welcome packet sent.`
    );
  };

  const handleAddCalendarEvent = (evt: TimelineEvent) => {
    setTimelineEvents((prev) => [...prev, evt]);
    addToast('success', 'Event Added to Floor Schedule', `${evt.title} (${evt.time} - ${evt.end})`);
  };

  const unassignedCount = leads.filter((l) => !l.consultant || l.stage === 'Imported').length;
  const unreadCount = threads.filter((t) => t.unreadCount).length;

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
        {/* Top Header */}
        <Header
          role={role}
          setRole={(newRole) => {
            setRole(newRole);
            if (newRole === 'manager' && activeTab === 'today') {
              setActiveTab('allocation');
            } else if (newRole === 'consultant' && (activeTab === 'allocation' || activeTab === 'reports')) {
              setActiveTab('today');
            }
          }}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onOpenNotifications={() =>
            addToast('info', 'Floor Pulse Sync', 'All Melbourne CBD systems online and operating nominally.')
          }
          unreadNotifications={true}
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
                  leads={leads}
                  timelineEvents={timelineEvents}
                  onSelectLead={handleSelectLead}
                  onOpenBookDrive={handleOpenBookDrive}
                  onOpenAddProspect={() => setIsAddProspectOpen(true)}
                  onOpenMessage={(l) => handleOpenMessage(l)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'calendar' && (
                <CalendarView
                  timelineEvents={timelineEvents}
                  onOpenAddEvent={() => setIsAddEventOpen(true)}
                  onOpenBookDrive={() => handleOpenBookDrive()}
                />
              )}

              {activeTab === 'leads' && (
                <LeadsView
                  leads={leads}
                  onSelectLead={handleSelectLead}
                  onOpenAddProspect={() => setIsAddProspectOpen(true)}
                  onOpenBookDrive={handleOpenBookDrive}
                  onOpenMessage={(l) => handleOpenMessage(l)}
                />
              )}

              {activeTab === 'deliveries' && (
                <DeliveriesView
                  deliveries={deliveries}
                  onOpenMessage={(l) => handleOpenMessage(l)}
                  onCompleteHandover={handleCompleteHandover}
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

      {/* Modals & Dialogs */}
      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onOpenBookDrive={(lead) => handleOpenBookDrive(lead)}
        onOpenMessage={(lead) => handleOpenMessage(lead)}
        onUpdateStage={handleUpdateLeadStage}
      />

      <BookTestDriveModal
        isOpen={isBookDriveOpen}
        onClose={() => setIsBookDriveOpen(false)}
        lead={bookDriveLead}
        onConfirmBooking={handleConfirmTestDrive}
      />

      <AddProspectModal
        isOpen={isAddProspectOpen}
        onClose={() => setIsAddProspectOpen(false)}
        onAddLead={handleAddProspect}
      />

      <MessageModal
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
        lead={messageLead}
        onSendMessage={handleSendMessage}
      />

      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onAddEvent={handleAddCalendarEvent}
      />

      {/* Toasts Feedback */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
