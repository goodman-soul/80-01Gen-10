import { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Trash2,
  ImageOff,
  Clock,
  AlertTriangle,
  UserX,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Users,
  Search,
  Filter,
  Info,
  CalendarCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBookingStore } from '@/store/bookingStore';
import { useAuthStore } from '@/store/authStore';
import { useAuthStore as _authStore } from '@/store/authStore';
import { violationTypeConfig } from '@/components/ui/statusConfig';
import { formatDateTimeCN } from '@/utils/dateTime';
import { addCredit, deductCredit } from '@/utils/credit';
import type { ViolationType } from '@/types';

const violationIconMap: Record<string, typeof Trash2> = {
  unclean: Trash2,
  no_clean_photo: ImageOff,
  overtime: Clock,
  equipment_damage: AlertTriangle,
  no_show: UserX,
  other: AlertCircle,
};

const typeFilters: Array<{ key: ViolationType | 'all'; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'unclean', label: '清洁不合格' },
  { key: 'no_clean_photo', label: '未传照片' },
  { key: 'overtime', label: '超时使用' },
  { key: 'equipment_damage', label: '设备损坏' },
  { key: 'no_show', label: '未使用' },
  { key: 'other', label: '其他' },
];

export const AdminViolations = () => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const violations = useBookingStore((s) => s.violations);
  const updateUserCredit = _authStore((s) => s.updateUserCredit);
  const users = _authStore((s) => s.users);
  const addNotification = useBookingStore((s) => s.addNotification);

  const [typeFilter, setTypeFilter] = useState<ViolationType | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  const stats = {
    total: violations.length,
    totalDeducted: violations.reduce((sum, v) => sum + v.pointDeduction, 0),
    pendingAppeal: violations.filter((v) => v.appealStatus === 'pending').length,
    uniqueUsers: new Set(violations.map((v) => v.userId)).size,
  };

  const filtered = violations
    .filter((v) => {
      const matchType = typeFilter === 'all' || v.type === typeFilter;
      const matchSearch =
        !searchText ||
        v.userName.includes(searchText) ||
        v.description.includes(searchText);
      return matchType && matchSearch;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleApproveAppeal = (violationId: string) => {
    const v = violations.find((x) => x.id === violationId);
    if (!v) return;
    const user = users.find((u) => u.id === v.userId);
    if (!user) return;
    const { newScore } = addCredit(user.creditScore, v.pointDeduction);
    updateUserCredit(v.userId, newScore);
    addNotification('success', `申诉已通过，已返还 ${v.pointDeduction} 分`);
  };

  const handleRejectAppeal = (violationId: string) => {
    addNotification('info', '申诉已驳回');
  };

  const handleAddCredit = (userId: string, points: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const { newScore } = addCredit(user.creditScore, points);
    updateUserCredit(userId, newScore);
    addNotification('success', `已为 ${user.name} 增加 ${points} 分信用`);
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="page-container">
        <div className="max-w-lg mx-auto card p-12 text-center">
          <ShieldAlert className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-olive-800 mb-2">
            无权限访问
          </h2>
          <p className="text-olive-500 mb-6">请使用管理员账号登录后访问</p>
          <Link to="/" className="btn-primary inline-flex">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-olive-800 mb-2">
          违规管理
        </h1>
        <p className="text-olive-600">查看和处理用户违规记录，管理申诉申请</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '违规总数', value: stats.total, icon: AlertOctagon, gradient: 'from-rose-500 to-red-600' },
          { label: '累计扣分', value: stats.totalDeducted, icon: RotateCcw, gradient: 'from-amber-500 to-orange-600', unit: '分' },
          { label: '待申诉', value: stats.pendingAppeal, icon: AlertTriangle, gradient: 'from-sky-500 to-blue-600' },
          { label: '涉及用户', value: stats.uniqueUsers, icon: Users, gradient: 'from-violet-500 to-purple-600' },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="card p-5 animate-fade-in-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-olive-500">{s.label}</p>
                  <p className="text-3xl font-serif font-bold text-olive-800 mt-1">
                    {s.value}
                    {s.unit && <span className="text-lg ml-1">{s.unit}</span>}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-4 mb-6 animate-fade-in-up delay-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input-field pl-12"
              placeholder="搜索用户名或描述..."
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-5 h-5 text-olive-500 flex-shrink-0" />
            {typeFilters.map((f) => {
              const count = f.key === 'all'
                ? violations.length
                : violations.filter((v) => v.type === f.key).length;
              const active = typeFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setTypeFilter(f.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-cream-50 text-olive-600 hover:bg-cream-100'
                  }`}
                >
                  {f.label}
                  <span className={`ml-1 ${active ? 'text-rose-100' : 'text-olive-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in-up delay-200">
          <CalendarCheck className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-xl font-serif font-bold text-olive-700 mb-2">
            暂无违规记录
          </h3>
          <p className="text-olive-500">太棒了，用户都在规范使用共享厨房！</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((v, idx) => {
            const config = violationTypeConfig[v.type];
            const Icon = violationIconMap[v.type] || AlertCircle;
            const user = users.find((u) => u.id === v.userId);
            return (
              <div
                key={v.id}
                className="card p-6 animate-fade-in-up"
                style={{ animationDelay: `${Math.min(idx, 5) * 80}ms` }}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.className.split(' ')[0].replace('bg-', 'from-').replace('50', '400')} to-${config.className.split(' ')[0].replace('bg-', '').replace('50', '600')} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif text-lg font-bold text-olive-800">
                          {config.label}
                        </h3>
                        <span className={`badge ${config.className}`}>-{v.pointDeduction} 分</span>
                        {v.appealStatus === 'pending' && (
                          <span className="badge bg-amber-50 text-amber-700 border border-amber-200">
                            待申诉处理
                          </span>
                        )}
                        {v.appealStatus === 'approved' && (
                          <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                            申诉通过（已返分）
                          </span>
                        )}
                        {v.appealStatus === 'rejected' && (
                          <span className="badge bg-rose-50 text-rose-700 border border-rose-200">
                            申诉驳回
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-olive-400 whitespace-nowrap">
                        {formatDateTimeCN(v.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-cream-50">
                        <p className="text-xs text-olive-500 mb-1 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          用户
                        </p>
                        <p className="font-semibold text-olive-800">{v.userName}</p>
                        {user && (
                          <p className="text-xs text-olive-500 mt-0.5">
                            当前信用分 {user.creditScore}
                          </p>
                        )}
                      </div>
                      <div className="p-3 rounded-xl bg-cream-50">
                        <p className="text-xs text-olive-500 mb-1 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" />
                          处理人
                        </p>
                        <p className="font-semibold text-olive-800">
                          {v.reportedBy === 'system'
                            ? '系统检测'
                            : v.reportedBy === 'admin_001'
                            ? '管理员'
                            : `用户 ${v.reportedBy?.slice(-3)}`}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-cream-50">
                        <p className="text-xs text-olive-500 mb-1">关联预约</p>
                        <p className="font-semibold text-olive-800">
                          {v.bookingId ? v.bookingId.slice(-8) : '无'}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-olive-700 leading-relaxed p-4 rounded-xl bg-olive-50 border border-olive-100">
                      {v.description}
                    </p>
                  </div>

                  <div className="flex lg:flex-col gap-2 lg:w-40 flex-shrink-0">
                    {v.appealStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveAppeal(v.id)}
                          className="flex-1 btn-secondary py-2.5 flex items-center justify-center gap-1.5 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          通过申诉
                        </button>
                        <button
                          onClick={() => handleRejectAppeal(v.id)}
                          className="flex-1 py-2.5 px-4 rounded-xl font-medium border-2 border-rose-200 text-rose-600 hover:bg-rose-50 transition-all text-sm flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          驳回
                        </button>
                      </>
                    )}
                    {user && (
                      <button
                        onClick={() => handleAddCredit(v.userId, 5)}
                        className="flex-1 btn-outline py-2.5 text-sm flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        加5分
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
