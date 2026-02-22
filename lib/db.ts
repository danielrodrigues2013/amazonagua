import { Product, Customer, Sale, Delivery, Transaction, ProductType, PaymentMethod, SaleType, DeliveryStatus, TransactionType } from './types';

// Real data starts here - empty arrays for fresh database
const INITIAL_PRODUCTS: Product[] = [];

const INITIAL_CUSTOMERS: Customer[] = [];

// Helper to persist data in localStorage for the demo
const cache: Record<string, any> = {};

const getStorage = <T>(key: string, initial: T): T => {
  if (typeof window === 'undefined') return initial;
  if (cache[key]) return cache[key];

  const stored = localStorage.getItem(key);
  const data = stored ? JSON.parse(stored) : initial;
  cache[key] = data;
  return data;
};

const setStorage = <T>(key: string, data: T) => {
  if (typeof window === 'undefined') return;
  cache[key] = data;
  localStorage.setItem(key, JSON.stringify(data));
};

const INITIAL_SALES: Sale[] = [];

const INITIAL_TRANSACTIONS: Transaction[] = [];

export const db = {
  getProducts: () => getStorage<Product[]>('products', INITIAL_PRODUCTS),
  saveProducts: (products: Product[]) => setStorage('products', products),

  getCustomers: () => getStorage<Customer[]>('customers', INITIAL_CUSTOMERS),
  saveCustomers: (customers: Customer[]) => setStorage('customers', customers),

  getSales: () => getStorage<Sale[]>('sales', INITIAL_SALES),
  saveSales: (sales: Sale[]) => setStorage('sales', sales),

  getDeliveries: () => getStorage<Delivery[]>('deliveries', []),
  saveDeliveries: (deliveries: Delivery[]) => setStorage('deliveries', deliveries),

  getTransactions: () => getStorage<Transaction[]>('transactions', INITIAL_TRANSACTIONS),
  saveTransactions: (transactions: Transaction[]) => setStorage('transactions', transactions),
};
