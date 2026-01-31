/**
 * Offline transaction queue for staff app
 * Ensures staff can create visits even without network
 */

export interface QueuedTransaction {
  id: string;
  type: 'visit' | 'redemption';
  payload: any;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  retryCount: number;
  lastError?: string;
}

export class OfflineQueue {
  private queue: Map<string, QueuedTransaction> = new Map();
  private storageKey = '@dotly_offline_queue';

  async addTransaction(
    type: 'visit' | 'redemption',
    payload: any
  ): Promise<QueuedTransaction> {
    const transaction: QueuedTransaction = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      payload,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    this.queue.set(transaction.id, transaction);
    await this.persist();
    return transaction;
  }

  async getPendingTransactions(): Promise<QueuedTransaction[]> {
    return Array.from(this.queue.values()).filter((t) => t.status === 'pending');
  }

  async markSynced(transactionId: string): Promise<void> {
    const transaction = this.queue.get(transactionId);
    if (transaction) {
      transaction.status = 'synced';
      await this.persist();
    }
  }

  async markFailed(transactionId: string, error: string): Promise<void> {
    const transaction = this.queue.get(transactionId);
    if (transaction) {
      transaction.status = 'failed';
      transaction.lastError = error;
      transaction.retryCount++;
      await this.persist();
    }
  }

  async remove(transactionId: string): Promise<void> {
    this.queue.delete(transactionId);
    await this.persist();
  }

  async clear(): Promise<void> {
    this.queue.clear();
    await this.persist();
  }

  private async persist(): Promise<void> {
    // Implementation depends on storage adapter
    console.log('Queue updated:', Array.from(this.queue.values()));
  }

  getQueueSize(): number {
    return this.queue.size;
  }

  getSyncedCount(): number {
    return Array.from(this.queue.values()).filter((t) => t.status === 'synced').length;
  }
}

export const offlineQueue = new OfflineQueue();
