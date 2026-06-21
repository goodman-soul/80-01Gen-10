import type { BookingStatus, ViolationType, PermissionLevel } from '@/types';

export const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending: {
    label: '待审核',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  approved: {
    label: '已通过',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  rejected: {
    label: '已驳回',
    className: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
  in_use: {
    label: '使用中',
    className: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  },
  clean_pending: {
    label: '待清洁确认',
    className: 'bg-sky-50 text-sky-700 border border-sky-200',
  },
  completed: {
    label: '已完成',
    className: 'bg-olive-50 text-olive-700 border border-olive-200',
  },
  cancelled: {
    label: '已取消',
    className: 'bg-slate-100 text-slate-600 border border-slate-200',
  },
};

export const violationTypeConfig: Record<ViolationType, { label: string; className: string; icon: string }> = {
  unclean: {
    label: '清洁不合格',
    className: 'bg-rose-50 text-rose-700 border border-rose-200',
    icon: 'trash',
  },
  no_clean_photo: {
    label: '未上传清洁照片',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: 'image-off',
  },
  overtime: {
    label: '超时使用',
    className: 'bg-orange-50 text-orange-700 border border-orange-200',
    icon: 'clock',
  },
  equipment_damage: {
    label: '设备损坏',
    className: 'bg-red-50 text-red-700 border border-red-200',
    icon: 'alert-triangle',
  },
  no_show: {
    label: '预约未使用',
    className: 'bg-purple-50 text-purple-700 border border-purple-200',
    icon: 'user-x',
  },
  other: {
    label: '其他违规',
    className: 'bg-slate-50 text-slate-700 border border-slate-200',
    icon: 'alert-circle',
  },
};

export const permissionLevelConfig: Record<PermissionLevel, { label: string; className: string }> = {
  normal: {
    label: '正常权限',
    className: 'bg-emerald-50 text-emerald-700',
  },
  restricted: {
    label: '受限权限',
    className: 'bg-amber-50 text-amber-700',
  },
  suspended: {
    label: '暂停权限',
    className: 'bg-rose-50 text-rose-700',
  },
};

export const zoneNameMap: Record<string, string> = {
  baking: '烘焙间',
  cooking: '蒸煮间',
  cleaning: '清洗区',
};
