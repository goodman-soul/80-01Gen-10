import { create } from 'zustand';
import type { User, UserRole } from '@/types';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { mockUsers, getDefaultUser, getAdminUser } from '@/data/users';
import { getPermissionLevel } from '@/utils/credit';

interface AuthState {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;

  login: (phone?: string, role?: UserRole) => void;
  logout: () => void;
  switchRole: () => void;
  updateUserCredit: (userId: string, score: number) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: storage.get<User | null>(STORAGE_KEYS.USER, null),
  users: storage.get<User[]>(STORAGE_KEYS.USERS, mockUsers),
  isAuthenticated: !!storage.get<User | null>(STORAGE_KEYS.USER, null),

  login: (phone, role = 'resident') => {
    const users = get().users;
    let user: User;

    if (role === 'admin') {
      user = getAdminUser();
    } else {
      user = phone
        ? users.find((u) => u.phone === phone && u.role === 'resident') || getDefaultUser()
        : getDefaultUser();
    }

    storage.set(STORAGE_KEYS.USER, user);
    set({ currentUser: user, isAuthenticated: true });
  },

  logout: () => {
    storage.remove(STORAGE_KEYS.USER);
    set({ currentUser: null, isAuthenticated: false });
  },

  switchRole: () => {
    const current = get().currentUser;
    if (!current) return;

    const newRole: UserRole = current.role === 'admin' ? 'resident' : 'admin';
    const newUser = newRole === 'admin' ? getAdminUser() : getDefaultUser();

    storage.set(STORAGE_KEYS.USER, newUser);
    set({ currentUser: newUser });
  },

  updateUserCredit: (userId: string, score: number) => {
    const users = get().users.map((u) =>
      u.id === userId
        ? { ...u, creditScore: score, permissionLevel: getPermissionLevel(score) }
        : u
    );
    const currentUser = get().currentUser;
    const updatedCurrent =
      currentUser && currentUser.id === userId
        ? { ...currentUser, creditScore: score, permissionLevel: getPermissionLevel(score) }
        : currentUser;

    storage.set(STORAGE_KEYS.USERS, users);
    if (updatedCurrent) storage.set(STORAGE_KEYS.USER, updatedCurrent);

    set({ users, currentUser: updatedCurrent });
  },

  updateUser: (updates) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const updated = { ...currentUser, ...updates };
    storage.set(STORAGE_KEYS.USER, updated);
    set({ currentUser: updated });
  },
}));
