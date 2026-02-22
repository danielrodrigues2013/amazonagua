
export enum ProductType {
  WATER = "WATER",
  GAS = "GAS"
}

export enum SaleType {
  COUNTER = "COUNTER",
  DELIVERY = "DELIVERY"
}

export enum PaymentMethod {
  PIX = "PIX",
  CASH = "DINHEIRO",
  CARD = "CARTÃO",
  CREDIT = "FIADO" // Fiado
}

export enum DeliveryStatus {
  PENDING = "PENDENTE",
  IN_ROUTE = "EM_ROTA",
  DELIVERED = "ENTREGUE",
  CANCELLED = "CANCELADO"
}

export enum TransactionType {
  INCOME = "ENTRADA",
  EXPENSE = "SAIDA"
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  notes?: string;
  creditLimit: number;
  status: 'ADIMPLENTE' | 'INADIMPLENTE';
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  customerId?: string;
  items: SaleItem[];
  total: number;
  profit: number;
  paymentMethod: PaymentMethod;
  type: SaleType;
  status: 'CONCLUIDA' | 'CANCELADA';
  createdAt: string;
}

export interface Delivery {
  id: string;
  saleId: string;
  delivererName: string;
  status: DeliveryStatus;
  deliveryFee: number;
  commission: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  status: 'PAGO' | 'PENDENTE';
}
