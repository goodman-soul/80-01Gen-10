import { create } from 'zustand';
import type {
  Booking,
  BookingStatus,
  KitchenZone,
  Violation,
  ViolationType,
  AppNotification,
} from '@/types';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { mockBookings } from '@/data/bookings';
import { mockViolations } from '@/data/violations';
import { generateAccessCode, generateId } from '@/utils/codeGenerator';
import { deductCredit } from '@/utils/credit';
import { useAuthStore } from './authStore';

interface BookingState {
  bookings: Booking[];
  violations: Violation[];
  notifications: AppNotification[];

  createBooking: (data: Omit<Booking, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'userName'>) => Booking;
  updateBookingStatus: (id: string, status: BookingStatus, extra?: Partial<Booking>) => void;
  approveBooking: (id: string) => void;
  rejectBooking: (id: string, reason: string) => void;
  uploadCleanPhotos: (id: string, photos: string[]) => void;
  confirmCleanliness: (bookingId: string, confirmed: boolean, reportReason?: string) => void;
  cancelBooking: (id: string) => void;
  getBooking: (id: string) => Booking | undefined;
  getUserBookings: (userId: string) => Booking[];
  getBookingsByZoneAndDate: (zone: KitchenZone, date: string) => Booking[];
  getPendingBookings: () => Booking[];
  addViolation: (data: Omit<Violation, 'id' | 'createdAt' | 'handled' | 'appealStatus'>) => void;
  getUserViolations: (userId: string) => Violation[];
  addNotification: (type: AppNotification['type'], message: string) => void;
  removeNotification: (id: string) => void;
  getNextBooking: (zone: KitchenZone, date: string, time: string) => Booking | undefined;
  canAccessBooking: (userId: string | undefined, userRole: string | undefined, bookingId: string) => boolean;
  canConfirmCleanliness: (userId: string | undefined, bookingId: string) => boolean;
  checkOverdueCleanings: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: storage.get<Booking[]>(STORAGE_KEYS.BOOKINGS, mockBookings),
  violations: storage.get<Violation[]>(STORAGE_KEYS.VIOLATIONS, mockViolations),
  notifications: [],

  createBooking: (data) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) throw new Error('未登录');

    const newBooking: Booking = {
      ...data,
      id: generateId('bk_'),
      status: 'pending',
      userName: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const bookings = [...get().bookings, newBooking];
    storage.set(STORAGE_KEYS.BOOKINGS, bookings);
    set({ bookings });
    get().addNotification('success', '预约申请已提交，等待管理员审核');
    return newBooking;
  },

  updateBookingStatus: (id, status, extra) => {
    const bookings = get().bookings.map((b) =>
      b.id === id
        ? { ...b, status, ...extra, updatedAt: new Date().toISOString() }
        : b
    );
    storage.set(STORAGE_KEYS.BOOKINGS, bookings);
    set({ bookings });
  },

  approveBooking: (id) => {
    const accessCode = generateAccessCode();
    get().updateBookingStatus(id, 'approved', {
      accessCode,
      accessCodeGeneratedAt: new Date().toISOString(),
    });
    get().addNotification('success', `预约已通过，门禁码：${accessCode}`);
  },

  rejectBooking: (id, reason) => {
    get().updateBookingStatus(id, 'rejected', { rejectReason: reason });
    get().addNotification('warning', '预约已驳回');
  },

  uploadCleanPhotos: (id, photos) => {
    get().updateBookingStatus(id, 'clean_pending', { cleanPhotos: photos });
    get().addNotification('success', '清洁照片已上传，等待下一位用户确认');
  },

  confirmCleanliness: (bookingId, confirmed, reportReason) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;

    const booking = get().getBooking(bookingId);
    if (!booking) return;

    if (confirmed) {
      get().updateBookingStatus(bookingId, 'completed', {
        cleanConfirmedBy: currentUser.id,
        cleanConfirmedAt: new Date().toISOString(),
      });
      get().addNotification('success', '清洁状态已确认合格');
    } else {
      get().updateBookingStatus(bookingId, 'completed', {
        cleanConfirmedBy: currentUser.id,
        cleanConfirmedAt: new Date().toISOString(),
        cleanReportReason: reportReason,
      });

      get().addViolation({
        userId: booking.userId,
        userName: booking.userName,
        bookingId,
        type: 'unclean',
        description: reportReason || '清洁状态不合格，被下一位用户举报',
        pointDeduction: 20,
        reportedBy: currentUser.id,
      });

      const result = deductCredit(
        useAuthStore.getState().users.find((u) => u.id === booking.userId)?.creditScore || 100,
        20
      );
      useAuthStore.getState().updateUserCredit(booking.userId, result.newScore);

      get().addNotification('error', '已举报清洁不合格，系统将记录违规');
    }
  },

  cancelBooking: (id) => {
    get().updateBookingStatus(id, 'cancelled');
    get().addNotification('info', '预约已取消');
  },

  getBooking: (id) => get().bookings.find((b) => b.id === id),

  getUserBookings: (userId) =>
    [...get().bookings]
      .filter((b) => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

  getBookingsByZoneAndDate: (zone, date) =>
    get().bookings.filter(
      (b) =>
        b.zone === zone &&
        b.date === date &&
        !['cancelled', 'rejected'].includes(b.status)
    ),

  getPendingBookings: () =>
    [...get().bookings]
      .filter((b) => b.status === 'pending')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),

  addViolation: (data) => {
    const newViolation: Violation = {
      ...data,
      id: generateId('vi_'),
      createdAt: new Date().toISOString(),
      handled: true,
      appealStatus: 'none',
    };

    const violations = [...get().violations, newViolation];
    storage.set(STORAGE_KEYS.VIOLATIONS, violations);
    set({ violations });
  },

  getUserViolations: (userId) =>
    [...get().violations]
      .filter((v) => v.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

  addNotification: (type, message) => {
    const notification: AppNotification = {
      id: generateId('nt_'),
      type,
      message,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ notifications: [...state.notifications, notification] }));
    setTimeout(() => get().removeNotification(notification.id), 4000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  getNextBooking: (zone, date, time) => {
    return get()
      .getBookingsByZoneAndDate(zone, date)
      .filter((b) => b.startTime > time && !['cancelled', 'rejected'].includes(b.status))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
  },

  canAccessBooking: (userId, userRole, bookingId) => {
    if (!userId) return false;
    if (userRole === 'admin') return true;
    const booking = get().getBooking(bookingId);
    return !!booking && booking.userId === userId;
  },

  canConfirmCleanliness: (userId, bookingId) => {
    if (!userId) return false;
    const booking = get().getBooking(bookingId);
    if (!booking || !booking.cleanPhotos || booking.cleanConfirmedAt) return false;
    if (booking.userId === userId) return false;
    if (useAuthStore.getState().currentUser?.role === 'admin') return true;
    const next = get().getNextBooking(booking.zone, booking.date, booking.endTime);
    return !!next && next.userId === userId;
  },

  checkOverdueCleanings: () => {
    const now = new Date();
    const allBookings = get().bookings;
    let processed = 0;

    const updatedBookings = allBookings.map((b) => {
      if (['completed', 'cancelled', 'rejected', 'pending'].includes(b.status)) {
        return b;
      }

      const endStr = `${b.date}T${b.endTime}:00`;
      const endTime = new Date(endStr);
      const diffMs = now.getTime() - endTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours <= 2) return b;

      const hasPhotos = !!b.cleanPhotos && b.cleanPhotos.length > 0;

      if (b.status === 'clean_pending') {
        if (diffHours <= 12) return b;
        processed++;
        get().addViolation({
          userId: b.userId,
          userName: b.userName,
          bookingId: b.id,
          type: 'clean_unconfirmed',
          description: '清洁照片上传后超过12小时未被下一位用户确认，系统自动标记为已完成',
          pointDeduction: 5,
        });
        const user = useAuthStore.getState().users.find((u) => u.id === b.userId);
        if (user) {
          const result = deductCredit(user.creditScore, 5);
          useAuthStore.getState().updateUserCredit(b.userId, result.newScore);
        }
        return {
          ...b,
          status: 'completed' as BookingStatus,
          cleanConfirmedBy: 'system',
          cleanConfirmedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
      }

      if (!hasPhotos) {
        processed++;
        get().addViolation({
          userId: b.userId,
          userName: b.userName,
          bookingId: b.id,
          type: 'no_clean_photo',
          description: '使用结束后超过2小时未上传清洁照片，已自动记录违规',
          pointDeduction: 15,
        });
        const user = useAuthStore.getState().users.find((u) => u.id === b.userId);
        if (user) {
          const result = deductCredit(user.creditScore, 15);
          useAuthStore.getState().updateUserCredit(b.userId, result.newScore);
        }
        return {
          ...b,
          status: 'completed' as BookingStatus,
          updatedAt: now.toISOString(),
        };
      }

      return {
        ...b,
        status: 'completed' as BookingStatus,
        updatedAt: now.toISOString(),
      };
    });

    if (processed > 0) {
      storage.set(STORAGE_KEYS.BOOKINGS, updatedBookings);
      set({ bookings: updatedBookings });
      get().addNotification('info', `系统巡检完成，自动处理 ${processed} 条超时预约`);
    }

    return processed;
  },
}));
