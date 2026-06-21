import { useState, useMemo } from 'react';
import {
  ClipboardList,
  ChefHat,
  CookingPot,
  Sparkles,
  Users,
  CalendarDays,
  Clock,
  Search,
  Filter,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Eye,
  FileCheck,
  ShieldAlert,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBookingStore } from '@/store/bookingStore';
import { useAuthStore } from '@/store/authStore';
import { zones } from '@/data/zones';
import { statusConfig, zoneNameMap } from '@/components/ui/statusConfig';
import { formatDateCN } from '@/utils/dateTime';
import type { BookingStatus, KitchenZone } from '@/types';

const zoneIconMap: Record<string, typeof ChefHat> = {
  baking: ChefHat,
  cooking: CookingPot,
  cleaning: Sparkles,
};

const statusFilters: Array<{ key: BookingStatus | 'all'; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'in_use', label: '使用中' },
  { key: 'clean_pending', label: '待确认' },
  { key: 'completed', label: '已完成' },
  { key: 'rejected', label: '已驳回' },
  { key: 'cancelled', label: '已取消' },
];

export const AdminBookings = () => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const bookings = useBookingStore((s) => s.bookings);

  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [zoneFilter, setZoneFilter] = useState<KitchenZone | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  const stats = useMemo(() => {
    const total = bookings.length;
    const today = new Date().toISOString().split('T')[0];
    const todayCount = bookings.filter((b) => b.date === today && !['cancelled', 'rejected'].includes(b.status)).length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    return { total, todayCount, completed, pending };
  }, [bookings]);

  const filtered = useMemo(() => {
    return bookings
      .filter((b) => {
        const matchStatus = statusFilter === 'all' || b.status === statusFilter;
        const matchZone = zoneFilter === 'all' || b.zone === zoneFilter;
        const matchSearch =
          !searchText ||
          b.userName.includes(searchText) ||
          zoneNameMap[b.zone].includes(searchText) ||
          b.date.includes(searchText) ||
          b.id.includes(searchText);
        return matchStatus && matchZone && matchSearch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, statusFilter, zoneFilter, searchText]);

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
          预约总览
        </h1>
        <p className="text-olive-600">查看和管理所有预约记录</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '预约总数', value: stats.total, icon: ClipboardList, gradient: 'from-olive-500 to-olive-700' },
          { label: '今日预约', value: stats.todayCount, icon: CalendarDays, gradient: 'from-terracotta-500 to-orange-600' },
          { label: '已完成', value: stats.completed, icon: CheckCircle2, gradient: 'from-emerald-500 to-emerald-700' },
          { label: '待审核', value: stats.pending, icon: FileCheck, gradient: 'from-amber-500 to-orange-500' },
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
                  <p className="text-3xl font-serif font-bold text-olive-800 mt-1">{s.value}</p>
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
              placeholder="搜索用户、区域、日期..."
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-5 h-5 text-olive-500 flex-shrink-0" />
            <button
              onClick={() => setZoneFilter('all')}
              className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                zoneFilter === 'all'
                  ? 'bg-olive-600 text-white shadow-md'
                  : 'bg-cream-50 text-olive-600 hover:bg-cream-100'
              }`}
            >
              全部区域
            </button>
            {zones.map((z) => {
              const Icon = zoneIconMap[z.id];
              return (
                <button
                  key={z.id}
                  onClick={() => setZoneFilter(z.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    zoneFilter === z.id
                      ? 'bg-olive-600 text-white shadow-md'
                      : 'bg-cream-50 text-olive-600 hover:bg-cream-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {z.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto mt-4 pt-4 border-t border-cream-100">
          <BarChart3 className="w-5 h-5 text-olive-500 flex-shrink-0" />
          {statusFilters.map((f) => {
            const count = f.key === 'all'
              ? bookings.length
              : bookings.filter((b) => b.status === f.key).length;
            const active = statusFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-olive-100 text-olive-700'
                    : 'text-olive-500 hover:bg-cream-50'
                }`}
              >
                {f.label}
                <span className={`ml-1 ${active ? 'text-olive-800 font-bold' : ''}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in-up delay-200">
          <CalendarCheck className="w-16 h-16 text-cream-300 mx-auto mb-4" />
          <h3 className="text-xl font-serif font-bold text-olive-700 mb-2">
            暂无匹配记录
          </h3>
          <p className="text-olive-500">请尝试调整筛选条件</p>
        </div>
      ) : (
        <div className="card overflow-hidden animate-fade-in-up delay-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-olive-600 uppercase tracking-wider">预约信息</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-olive-600 uppercase tracking-wider hidden md:table-cell">用户</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-olive-600 uppercase tracking-wider hidden lg:table-cell">时段</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-olive-600 uppercase tracking-wider">状态</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-olive-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filtered.slice(0, 50).map((booking) => {
                  const s = statusConfig[booking.status];
                  const Icon = zoneIconMap[booking.zone];
                  return (
                    <tr key={booking.id} className="hover:bg-cream-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                            booking.zone === 'baking' ? 'from-amber-400 to-terracotta-500' :
                            booking.zone === 'cooking' ? 'from-emerald-400 to-olive-600' :
                            'from-sky-400 to-blue-500'
                          } flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-olive-800">{zoneNameMap[booking.zone]}</p>
                            <p className="text-xs text-olive-500">{booking.id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="font-medium text-olive-800">{booking.userName}</p>
                        <p className="text-xs text-olive-500">{booking.peopleCount} 人</p>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-sm text-olive-800">{formatDateCN(booking.date)}</p>
                        <p className="text-xs text-olive-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge ${s.className}`}>{s.label}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/my-bookings/${booking.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-olive-600 hover:bg-olive-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          详情
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > 50 && (
            <div className="px-5 py-4 border-t border-cream-100 text-center text-sm text-olive-500">
              显示 50 / {filtered.length} 条记录
            </div>
          )}
        </div>
      )}
    </div>
  );
};
