export type UserRole = 'resident' | 'admin';

export type KitchenZone = 'baking' | 'cooking' | 'cleaning';

export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_use'
  | 'clean_pending'
  | 'completed'
  | 'cancelled';

export type ViolationType =
  | 'unclean'
  | 'no_clean_photo'
  | 'overtime'
  | 'equipment_damage'
  | 'no_show'
  | 'other';

export type PermissionLevel = 'normal' | 'restricted' | 'suspended';

export type AppealStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  building: string;
  room: string;
  creditScore: number;
  permissionLevel: PermissionLevel;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  zone: KitchenZone;
  date: string;
  startTime: string;
  endTime: string;
  peopleCount: number;
  equipment: string[];
  ingredients: string;
  cleanPromise: boolean;
  remarks?: string;
  status: BookingStatus;
  rejectReason?: string;
  accessCode?: string;
  accessCodeGeneratedAt?: string;
  cleanPhotos?: string[];
  cleanConfirmedBy?: string;
  cleanConfirmedAt?: string;
  cleanReportReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Violation {
  id: string;
  userId: string;
  userName: string;
  bookingId?: string;
  type: ViolationType;
  description: string;
  pointDeduction: number;
  reportedBy?: string;
  createdAt: string;
  handled: boolean;
  appealStatus: AppealStatus;
}

export interface ZoneConfig {
  id: KitchenZone;
  name: string;
  description: string;
  equipment: string[];
  capacity: number;
  icon: string;
  gradient: string;
}

export interface TimeSlot {
  time: string;
  label: string;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  createdAt: string;
}
