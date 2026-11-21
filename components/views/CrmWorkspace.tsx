'use client';
import { UserManagementView } from '@/crm/components/views/UserManagementView';
import { customerApi } from '@/crm/lib/api';
import { useEffect, useState } from 'react';
import { useCrm } from '@/crm/lib/crmContext';
import type { Customer, Opportunity } from '@/crm/lib/types';
import { CustomersView } from '@/crm/components/views/CustomersView';
import { PipelineView } from '@/crm/components/views/PipelineView';
import { AllocationsView } from '@/crm/components/views/AllocationsView';
import { VirtualYardView } from '@/crm/components/views/VirtualYardView';
import { SalesLogView } from '@/crm/components/views/SalesLogView';
import { ReportsView } from '@/crm/components/views/ReportsView';
import { SettingsView } from '@/crm/components/views/SettingsView';
import { AuditView } from '@/crm/components/views/AuditView';
import { Customer360Modal } from '@/crm/components/modals/Customer360Modal';
import { MarkSoldModal } from '@/crm/components/modals/MarkSoldModal';
import { AddDealModal } from '@/crm/components/modals/AddDealModal';
import { AddCustomerModal } from '@/crm/components/modals/AddCustomerModal';
import { BookTestDriveModal } from '@/crm/components/modals/BookTestDriveModal';
import { MergeCustomerModal } from '@/crm/components/modals/MergeCustomerModal';
import { ToastContainer } from '@/crm/components/ui/Toast';
export const crmTabs = ['customers', 'pipeline', 'inbox', 'inventory', 'sales-log', 'reports', 'audit', 'settings', 'users'];
// Existing BYD workflows use the Sales Floor session, active site and shell.
export function CrmWorkspace({ tab }: {
    tab: string;
}) {
    const { toasts, removeToast, addToast } = useCrm();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [sold, setSold] = useState<Opportunity | null>(null);
    const [addDeal, setAddDeal] = useState(false);
    const [addCustomer, setAddCustomer] = useState(false);
    const [bookDrive, setBookDrive] = useState(false);
    const [merge, setMerge] = useState(false);
    useEffect(() => {
        const id = new URLSearchParams(window.location.search).get('customer_id');
        if (!id)
            return;
        let active = true;
        void customerApi.getCustomer(id).then(response => {
            if (!active)
                return;
            if (response.success && response.data)
                setCustomer(current => current || response.data!);
            else
                addToast('error', 'Customer unavailable', response.message || 'The linked customer was not found.');
        });
        return () => { active = false; };
    }, [addToast]);
    return <>
    {tab === 'customers' && <CustomersView onSelectCustomer={setCustomer} onOpenAddCustomer={() => setAddCustomer(true)} onOpenMergeModal={() => setMerge(true)}/>}
    {tab === 'pipeline' && <PipelineView onSelectCustomer={setCustomer} onOpenQuickDeal={() => setAddDeal(true)} onOpenMarkSold={setSold}/>}
    {tab === 'inbox' && <AllocationsView onSelectCustomer={setCustomer}/>}
    {tab === 'inventory' && <VirtualYardView />}
    {tab === 'sales-log' && <SalesLogView />}
    {tab === 'reports' && <ReportsView />}
    {tab === 'audit' && <AuditView />}
    {tab === 'users' && <UserManagementView />}
    {tab === 'settings' && <SettingsView />}
    <Customer360Modal customer={customer} onClose={() => setCustomer(null)} onOpenMarkSold={opportunity => { setCustomer(null); setSold(opportunity); }} onOpenBookDrive={() => setBookDrive(true)}/>
    <MarkSoldModal isOpen={!!sold} opportunity={sold} onClose={() => setSold(null)}/>
    <AddDealModal isOpen={addDeal} onClose={() => setAddDeal(false)}/>
    <AddCustomerModal isOpen={addCustomer} onClose={() => setAddCustomer(false)} onSelectExisting={setCustomer}/>
    <BookTestDriveModal isOpen={bookDrive} preselectedCustomer={customer} onClose={() => setBookDrive(false)}/>
    <MergeCustomerModal isOpen={merge} preselectedCustomer={customer} onClose={() => setMerge(false)}/>
    <ToastContainer toasts={toasts} onDismiss={removeToast}/>
  </>;
}
