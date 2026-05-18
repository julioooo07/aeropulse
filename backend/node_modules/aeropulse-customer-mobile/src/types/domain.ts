export type UserRole = "customer" | "technician";

export interface User {
  _id?: string;
  id?: string;
  name?: string;
  name_first?: string;
  name_last?: string;
  email?: string;
  phone?: string;
  alias?: string;
  role?: UserRole | string;
  assignedBranch?: string;
  activeBranch?: string;
  addresses?: Address[];
  notifications?: {
    inApp?: boolean;
    push?: boolean;
    orderUpdates?: boolean;
    accountUpdates?: boolean;
    systemAlerts?: boolean;
  };
}

export interface Address {
  _id?: string;
  id?: string;
  label?: string;
  type?: string;
  name?: string;
  phone?: string;
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface Product {
  id: string | number;
  name: string;
  brand?: string;
  category?: string;
  specs?: string;
  price?: number;
  stock?: number;
  description?: string;
  imageUrl?: string;
  warranty?: string;
  featured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id?: string;
  _id?: string;
  orderCode?: string;
  status?: string;
  workflowStatus?: string;
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  items?: Array<{
    name?: string;
    quantity?: number;
    price?: number;
    specs?: string;
  }>;
  address?: Address;
}

export interface NotificationItem {
  id?: string;
  _id?: string;
  title?: string;
  message?: string;
  unread?: boolean;
  createdAt?: string;
  time?: string;
  type?: string;
}

export interface TaskItem {
  id?: string;
  _id?: string;
  taskCode?: string;
  title?: string;
  customer?: string;
  address?: string;
  status?: string;
  priority?: string;
  scheduledDate?: string;
  timeSlot?: string;
  branch?: string;
  description?: string;
}
