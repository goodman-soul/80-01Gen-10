import type { PermissionLevel } from '@/types';

export const CREDIT_THRESHOLDS = {
  MAX_SCORE: 100,
  RESTRICTED: 60,
  SUSPENDED: 30,
};

export const getPermissionLevel = (score: number): PermissionLevel => {
  if (score <= CREDIT_THRESHOLDS.SUSPENDED) return 'suspended';
  if (score <= CREDIT_THRESHOLDS.RESTRICTED) return 'restricted';
  return 'normal';
};

export const deductCredit = (currentScore: number, points: number): { newScore: number; newLevel: PermissionLevel } => {
  const newScore = Math.max(0, currentScore - points);
  return {
    newScore,
    newLevel: getPermissionLevel(newScore),
  };
};

export const addCredit = (currentScore: number, points: number): { newScore: number; newLevel: PermissionLevel } => {
  const newScore = Math.min(CREDIT_THRESHOLDS.MAX_SCORE, currentScore + points);
  return {
    newScore,
    newLevel: getPermissionLevel(newScore),
  };
};

export const getPermissionDescription = (level: PermissionLevel): string => {
  switch (level) {
    case 'normal':
      return '正常预约权限';
    case 'restricted':
      return '受限：仅可预约3天后时段，单次不超过2小时';
    case 'suspended':
      return '暂停：暂时无法预约，请联系管理员申诉';
  }
};

export const getPermissionColor = (level: PermissionLevel): string => {
  switch (level) {
    case 'normal':
      return 'text-emerald-600 bg-emerald-50';
    case 'restricted':
      return 'text-amber-600 bg-amber-50';
    case 'suspended':
      return 'text-rose-600 bg-rose-50';
  }
};

export const canBook = (level: PermissionLevel): boolean => {
  return level !== 'suspended';
};
