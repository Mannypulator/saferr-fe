// types/subscription.ts

export interface SubscriptionPlan {
  id: string; // GUID as string
  name: string;
  description: string | null;
  price: number; // Assuming decimal is handled as number
  maxCodesPerMonth: number; // -1 for unlimited
  maxVerificationsPerMonth: number; // -1 for unlimited
  isActive: boolean;
}

export interface BrandSubscription {
  id: string; // GUID as string
  brandId: string; // GUID as string
  subscriptionPlanId: string; // GUID as string
  startDate: string; // ISO date string
  endDate: string | null; // ISO date string or null
  status: 'Active' | 'Expired' | 'Cancelled' | 'Suspended'; // Match enum
  amountPaid: number; // Assuming decimal is handled as number
  paymentReference: string | null;
  codesGenerated: number;
  verificationsReceived: number;
  // Include plan details if sent by backend for convenience
  subscriptionPlan?: SubscriptionPlan;
}

// DTOs for API requests/responses
export interface CheckoutRequest {
  brandId: string; // Typically derived from auth context
  subscriptionPlanId: string;
  successUrl: string; // URL Stripe redirects to on success
  cancelUrl: string;  // URL Stripe redirects to on cancel
}

export interface CheckoutSessionResponse {
  sessionId: string; // Stripe Session ID
}