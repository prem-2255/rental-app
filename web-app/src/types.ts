export type UserRole = 'customer' | 'owner';
export type SubscriptionPlan = 'basic' | 'premium' | 'elite';

export interface Property {
  id: string;
  title: string;
  image: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  type: string;
  capacity?: number;
  ownerId?: string;
  tenantId?: string;
  ownerPhone?: string;
}

export interface TenantDocument {
  id: string;
  name: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  date: string;
}

export interface TenantMaintenance {
  id: string;
  type: string;
  status: 'Reported' | 'In Progress' | 'Resolved';
  date: string;
  description: string;
}

export interface TenantElectricity {
  id: string;
  month: string;
  amount: string;
  status: 'Paid' | 'Unpaid';
}

export interface TenantPayment {
  id: string;
  date: string;
  amount: string;
  type: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  documents: TenantDocument[];
  maintenance: TenantMaintenance[];
  electricity: TenantElectricity[];
  payments: TenantPayment[];
  agreement: {
    renewalDate: string;
    signedDate: string;
    status: string;
  };
}
