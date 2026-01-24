export interface SpendPoint {
  period: string;
  amount: number
}

export interface Metrics {
    totalTransactions: number;
    totalSpent: number;
    avgMonthlySpend: number;
    topCategory: string | null;
    topCategorySpent: number;
    dateRangeLabel: string | null;
    monthlySpendHistory: SpendPoint[]
}

export interface Transaction {
    date: string;
    amount: number;
    description: string
}

export interface TransactionRecord {
    id: string;
    transactions: Transaction[];
    metrics: Metrics;
    createdAt: string
}