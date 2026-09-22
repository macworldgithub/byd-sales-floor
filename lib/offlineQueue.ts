/**
 * offlineQueue.ts – Local outbox queue for prospects & notes during offline floor usage
 * Fulfills §3.1, §8.2, and §10 Acceptance Criteria #9:
 * "Offline: a prospect saved in flight mode syncs when the device reconnects; no silent data loss."
 */

export interface QueuedItem {
  id: string;
  type: 'create_prospect' | 'add_note' | 'update_stage';
  payload: any;
  createdAt: number;
  retries: number;
}

const OUTBOX_KEY = 'byd_sales_floor_offline_outbox';

export const getOutbox = (): QueuedItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse offline outbox:', err);
    return [];
  }
};

export const addToOutbox = (type: QueuedItem['type'], payload: any): QueuedItem => {
  const item: QueuedItem = {
    id: `outbox_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    type,
    payload,
    createdAt: Date.now(),
    retries: 0,
  };
  const current = getOutbox();
  current.push(item);
  if (typeof window !== 'undefined') {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(current));
  }
  return item;
};

export const removeFromOutbox = (id: string) => {
  const current = getOutbox().filter((i) => i.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(current));
  }
};

export const flushOutbox = async (
  executor: (item: QueuedItem) => Promise<boolean>
): Promise<{ flushed: number; remaining: number }> => {
  const items = getOutbox();
  if (items.length === 0) return { flushed: 0, remaining: 0 };

  let flushedCount = 0;
  const remainingItems: QueuedItem[] = [];

  for (const item of items) {
    try {
      const success = await executor(item);
      if (success) {
        flushedCount++;
      } else {
        item.retries++;
        remainingItems.push(item);
      }
    } catch (err) {
      item.retries++;
      remainingItems.push(item);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(remainingItems));
  }

  return { flushed: flushedCount, remaining: remainingItems.length };
};
