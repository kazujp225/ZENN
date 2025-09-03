// Monetization Types

export interface PricingTier {
  id: string
  name: string
  price: number
  currency: 'JPY' | 'USD'
  features: string[]
}

// Paid Article Types
export interface PaidArticle {
  id: string
  title: string
  emoji: string
  author: {
    username: string
    name: string
    avatar: string
    isVerified?: boolean
  }
  price: number
  currency: 'JPY' | 'USD'
  previewContent: string
  fullContent?: string // Only available after purchase
  publishedAt: string
  updatedAt: string
  purchaseCount: number
  rating: number
  reviews: number
  tags: string[]
  estimatedReadTime: number
  isPurchased?: boolean
  isRefundable?: boolean
  refundDeadline?: string
}

// Consultation/Mentoring Types
export interface Consultation {
  id: string
  mentor: {
    username: string
    name: string
    avatar: string
    title: string
    bio: string
    rating: number
    totalSessions: number
    responseTime: string // e.g., "24時間以内"
    languages: string[]
    isAvailable: boolean
  }
  title: string
  description: string
  category: ConsultationCategory
  price: number
  duration: number // in minutes
  currency: 'JPY' | 'USD'
  availableSlots: TimeSlot[]
  tags: string[]
  reviews: ConsultationReview[]
  policies: {
    cancellation: string
    refund: string
    rescheduling: string
  }
}

export type ConsultationCategory = 
  | 'career'
  | 'technical'
  | 'code-review'
  | 'architecture'
  | 'debugging'
  | 'learning'
  | 'interview-prep'
  | 'other'

export interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
}

export interface ConsultationReview {
  id: string
  reviewer: {
    username: string
    name: string
    avatar: string
  }
  rating: number
  comment: string
  createdAt: string
  helpful: number
}

// Freelance Job Board Types
export interface FreelanceJob {
  id: string
  client: {
    username: string
    name: string
    avatar: string
    company?: string
    isVerified: boolean
    rating?: number
    totalJobs?: number
  }
  title: string
  description: string
  category: JobCategory
  skills: string[]
  budget: {
    min: number
    max: number
    currency: 'JPY' | 'USD'
    type: 'fixed' | 'hourly' | 'negotiable'
  }
  duration: string // e.g., "1-3ヶ月", "継続案件"
  workStyle: 'remote' | 'onsite' | 'hybrid'
  location?: string
  proposals: number
  status: 'open' | 'in-progress' | 'closed' | 'completed'
  postedAt: string
  deadline?: string
  attachments?: string[]
  requirements: string[]
  preferredQualifications?: string[]
}

export type JobCategory = 
  | 'web-development'
  | 'mobile-development'
  | 'backend'
  | 'frontend'
  | 'fullstack'
  | 'devops'
  | 'data-science'
  | 'machine-learning'
  | 'security'
  | 'blockchain'
  | 'game-development'
  | 'other'

export interface Proposal {
  id: string
  jobId: string
  freelancer: {
    username: string
    name: string
    avatar: string
    title: string
    rating: number
    completedJobs: number
    skills: string[]
  }
  coverLetter: string
  proposedBudget: {
    amount: number
    currency: 'JPY' | 'USD'
    type: 'fixed' | 'hourly'
  }
  estimatedDuration: string
  attachments?: string[]
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  submittedAt: string
}

// Transaction Types
export interface Transaction {
  id: string
  type: 'article_purchase' | 'consultation' | 'job_payment' | 'tip'
  amount: number
  currency: 'JPY' | 'USD'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  buyer: {
    username: string
    name: string
  }
  seller: {
    username: string
    name: string
  }
  item: {
    id: string
    title: string
    type: string
  }
  fee: number // Platform fee
  netAmount: number // Amount after fee
  createdAt: string
  completedAt?: string
  refundedAt?: string
  refundReason?: string
}

// Earnings Dashboard Types
export interface EarningsSummary {
  totalEarnings: number
  monthlyEarnings: number
  pendingPayouts: number
  currency: 'JPY' | 'USD'
  transactions: Transaction[]
  stats: {
    articlesold: number
    consultationsCompleted: number
    jobsCompleted: number
    averageRating: number
  }
  chartData: {
    labels: string[]
    values: number[]
  }
}

// Payment Method Types
export interface PaymentMethod {
  id: string
  type: 'credit_card' | 'bank_transfer' | 'paypal' | 'stripe'
  isDefault: boolean
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  bankName?: string
  accountNumber?: string
}

// Subscription Types
export interface Subscription {
  id: string
  userId: string
  plan: 'free' | 'pro' | 'business'
  status: 'active' | 'cancelled' | 'expired'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  features: string[]
  price: number
  currency: 'JPY' | 'USD'
}