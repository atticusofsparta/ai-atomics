export class TransactionCache {
  private storageKey: string;

  constructor(storageKey: string = 'transactionCache') {
    this.storageKey = storageKey;
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify({}));
    }
  }

  /**
   * Adds a transaction to the cache.
   * @param transactionId - The ID of the transaction.
   * @param transactionState - The state of the transaction in JSON format.
   */
  addTransaction(transactionId: string, transactionState: JSON): void {
    const cache = JSON.parse(localStorage.getItem(this.storageKey) as string);
    cache[transactionId] = transactionState;
    localStorage.setItem(this.storageKey, JSON.stringify(cache));
  }

  /**
   * Retrieves a transaction from the cache.
   * @param transactionId - The ID of the transaction to retrieve.
   * @returns The state of the transaction in JSON format, or undefined if the transaction is not in the cache.
   */
  getTransaction(transactionId: string): JSON | undefined {
    const cache = JSON.parse(localStorage.getItem(this.storageKey) as string);
    return cache[transactionId];
  }

  /**
   * Removes a transaction from the cache.
   * @param transactionId - The ID of the transaction to remove.
   */
  removeTransaction(transactionId: string): void {
    const cache = JSON.parse(localStorage.getItem(this.storageKey) as string);
    delete cache[transactionId];
    localStorage.setItem(this.storageKey, JSON.stringify(cache));
  }

  /**
   * Checks if a transaction is in the cache.
   * @param transactionId - The ID of the transaction to check.
   * @returns A boolean indicating whether the transaction is in the cache.
   */
  hasTransaction(transactionId: string): boolean {
    const cache = JSON.parse(localStorage.getItem(this.storageKey) as string);
    return transactionId in cache;
  }

  /**
   * Retrieves all transactions from the cache.
   * @returns An object containing all transactions in the cache.
   */
  getAllTransactions(): { [key: string]: JSON } {
    return JSON.parse(localStorage.getItem(this.storageKey) as string);
  }
}
