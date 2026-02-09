export interface BucketSeries {
  labels: string[]
  counts: number[]
}

export interface Buckets {
  outgoingSize: BucketSeries
  incomingSize: BucketSeries
}

export interface SeriesByCategory {
  [category: string]: number[]
}

export interface PeriodSeries {
  labels: string[]
  in: number[]
  out: number[]
  avgOut: number
  byCategoryOut: SeriesByCategory
}

export interface Categories {
  outTotalByCategory: Record<string, number>
  outCountByCategory: Record<string, number>
  avgOutByCategory: Record<string, number>
  outSizeBucketsByCategory: {
    labels: string[]
    counts: Record<string, number[]>
  }
}

export interface Metrics {
  totalTransactions: number
  dateRangeLabel: string | null

  avgMonthlySpend?: number
  avgWeeklySpend?: number

  monthly: PeriodSeries
  weekly: PeriodSeries

  categories: Categories
  buckets: Buckets
}

export interface Transaction {
  date: string
  amount: number
  description: string
}

export interface TransactionRecord {
  id: string
  transactions: Transaction[]
  metrics: Metrics
  createdAt: string
}