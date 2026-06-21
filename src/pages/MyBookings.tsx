import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Users,
  ChefHat,
  CookingPot,
  Sparkles,
  Filter,
  Search,
  Eye,
  XCircle,
  KeyRound,
  Camera,
  ChevronRight,
  CalendarCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { statusConfig, zoneNameMap } from '@/components/ui/statusConfig';
import { formatDateCN } from '@/utils/dateTime';
import type { BookingStatus } from '@/types';

const zoneIconMap: Record<string, typeof ChefHat> = {
  baking: ChefHat,
  cooking: CookingPot,
  cleaning: Sparkles,
};

const filterTabs: Array<{ key: BookingStatus | 'all'; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'in_use', label: '使用中' },
  { key: 'clean_pending', label: '待清洁确认' },
  { key: 'completed', label: '已完成' },
  { key: 'rejected', label: '已驳回' },
];

export const MyBookings = () => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const getUserBookings = useBookingStore((s) => s.getUserBookings);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);

  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);

  const allBookings = currentUser ? getUserBookings(currentUser.id) : [];

  const filteredBookings = allBookings.filter((b) => {
    const matchStatus = activeFilter === 'all' || b.status === activeFilter;
    const matchSearch =
      !searchText ||
      zoneNameMap[b.zone].includes(searchText) ||
      b.date.includes(searchText) ||
      b.remarks?.includes(searchText);
    return matchStatus && matchSearch;
  });

  const getActionButton = (booking: (typeof allBookings)[number]) => {
    switch (booking.status) {
      case 'pending':
        return (
          <button
            onClick={() => setShowCancelModal(booking.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            取消
          </button>
        );
      case 'approved':
        return (
          <Link
            to={`/access-code/${booking.id}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-terracotta-600 hover:bg-terracotta-50 transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            门禁码
          </Link>
        );
      case 'in_use':
      case 'clean_pending':
        return (
          <Link
            to={`/my-bookings/${booking.id}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-terracotta-500 text-white hover:bg-terracotta-600 transition-colors"
          >
            <Camera className="w-4 h-4" />
            上传照片
          </Link>
        );
      default:
        return (
          <Link
            to={`/my-bookings/${booking.id}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-olive-600 hover:bg-olive-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            详情
          </Link>
        );
    }
  };

  return (
    <div className="page-container">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-olive-800 mb-2">
          我的预约
        </h1>
        <p className="text-olive-600">查看和管理您的所有预约记录</p>
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
              placeholder="搜索区域、日期或备注..."
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-5 h-5 text-olive-500 flex-shrink-0 hidden md:block" />
            {filterTabs.map((tab) => {
              const count =
                tab.key === 'all'
                  ? allBookings.length
                  : allBookings.filter((b) => b.status === tab.key).length;
              const active = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'bg-olive-600 text-white shadow-md'
                      : 'bg-cream-50 text-olive-600 hover:bg-cream-100'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      active ? 'bg-white/20' : 'bg-cream-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in-up delay-200">
          <CalendarCheck className="w-20 h-20 text-cream-300 mx-auto mb-4" />
          <h3 className="text-xl font-serif font-semibold text-olive-700 mb-2">
            暂无预约记录
          </h3>
          <p className="text-olive-500 mb-6">
            {searchText || activeFilter !== 'all'
              ? '没有找到符合条件的预约'
              : '立即预约您需要的厨房时段吧'}
          </p>
          <Link to="/booking" className="btn-primary inline-flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            立即预约
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking, idx) => {
            const s = statusConfig[booking.status];
            const Icon = zoneIconMap[booking.zone];
            return (
              <div
                key={booking.id}
                className="card card-hover p-5 md:p-6 animate-fade-in-up"
                style={{ animationDelay: `${Math.min(idx, 5) * 80}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                    booking.zone === 'baking' ? 'from-amber-400 to-terracotta-500' :
                    booking.zone === 'cooking' ? 'from-emerald-400 to-olive-600' :
                    'from-sky-400 to-blue-500'
                  } flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-serif text-xl font-bold text-olive-800">
                        {zoneNameMap[booking.zone]}
                      </h3>
                      <span className={`badge ${s.className}`}>{s.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-1.5 text-olive-600">
                        <CalendarDays className="w-4 h-4 text-olive-400" />
                        {formatDateCN(booking.date)}
                      </div>
                      <div className="flex items-center gap-1.5 text-olive-600">
                        <Clock className="w-4 h-4 text-olive-400" />
                        {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="flex items-center gap-1.5 text-olive-600">
                        <Users className="w-4 h-4 text-olive-400" />
                        {booking.peopleCount} 人
                      </div>
                    </div>
                    {booking.remarks && (
                      <p className="mt-2 text-sm text-olive-500 line-clamp-1">
                        备注：{booking.remarks}
                      </p>
                    )}
                    {booking.status === 'rejected' && booking.rejectReason && (
                      <p className="mt-2 text-sm text-rose-600 bg-rose-50 p-2 rounded-lg inline-block">
                        驳回原因：{booking.rejectReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                    {getActionButton(booking)}
                    <Link
                      to={`/my-bookings/${booking.id}`}
                      className="flex items-center gap-1 text-sm text-olive-500 hover:text-terracotta-600 transition-colors"
                    >
                      查看详情
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-olive-900/40 backdrop-blur-sm animate-fade-in-up">
          <div className="card p-6 max-w-md w-full animate-slide-in">
            <h3 className="text-xl font-serif font-bold text-olive-800 mb-3">
              确认取消预约？
            </h3>
            <p className="text-olive-600 mb-6">
              取消预约后将释放时段给其他用户使用，如需使用请重新预约。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(null)}
                className="btn-outline"
              >
                再想想
              </button>
              <button
                onClick={() => {
                  cancelBooking(showCancelModal);
                  setShowCancelModal(null);
                }}
                className="btn-primary !bg-rose-500 hover:!bg-rose-600"
              >
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
