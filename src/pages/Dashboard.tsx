import { Link } from 'react-router-dom';
import {
  ChefHat,
  CookingPot,
  Sparkles,
  Clock,
  CalendarPlus,
  ListChecks,
  ShieldAlert,
  Users,
  TrendingUp,
  ArrowRight,
  FileCheck,
  ClipboardList,
  AlertOctagon,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { zones } from '@/data/zones';
import { formatDate, getCurrentTime, formatDateCN } from '@/utils/dateTime';
import { statusConfig, zoneNameMap } from '@/components/ui/statusConfig';
import type { Booking, KitchenZone } from '@/types';

const zoneIconMap: Record<string, typeof ChefHat> = {
  baking: ChefHat,
  cooking: CookingPot,
  cleaning: Sparkles,
};

export const Dashboard = () => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const bookings = useBookingStore((s) => s.bookings);
  const violations = useBookingStore((s) => s.violations);
  const getUserBookings = useBookingStore((s) => s.getUserBookings);
  const getPendingBookings = useBookingStore((s) => s.getPendingBookings);

  const today = formatDate(new Date().toISOString());
  const currentTime = getCurrentTime();

  const todayBookings = bookings.filter(
    (b) => b.date === today && !['cancelled', 'rejected'].includes(b.status)
  );
  const sortedTodayBookings = [...todayBookings].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  const userBookings = currentUser ? getUserBookings(currentUser.id) : [];
  const pendingCount = getPendingBookings().length;
  const userViolations = currentUser
    ? violations.filter((v) => v.userId === currentUser.id)
    : [];

  const quickLinks =
    currentUser?.role === 'admin'
      ? [
          { to: '/admin/review', label: '预约审核', icon: FileCheck, count: pendingCount, color: 'from-amber-400 to-orange-500' },
          { to: '/admin/bookings', label: '预约总览', icon: ClipboardList, count: bookings.length, color: 'from-olive-500 to-emerald-600' },
          { to: '/admin/violations', label: '违规管理', icon: AlertOctagon, count: violations.length, color: 'from-rose-500 to-red-600' },
        ]
      : [
          { to: '/booking', label: '立即预约', icon: CalendarPlus, color: 'from-terracotta-500 to-orange-500' },
          { to: '/my-bookings', label: '我的预约', icon: ListChecks, count: userBookings.length, color: 'from-olive-500 to-emerald-600' },
          { to: '/violations', label: '违规记录', icon: ShieldAlert, count: userViolations.length, color: 'from-sky-500 to-blue-600' },
        ];

  const getCurrentBooking = (zone: KitchenZone): Booking | undefined => {
    return todayBookings
      .filter((b) => b.zone === zone)
      .find((b) => currentTime >= b.startTime && currentTime < b.endTime && b.status !== 'completed');
  };

  const getNextBooking = (zone: KitchenZone): Booking | undefined => {
    return todayBookings
      .filter((b) => b.zone === zone && b.startTime > currentTime && b.status !== 'completed')
      .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
  };

  return (
    <div className="page-container">
      <div className="mb-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-olive-500 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatDateCN(today)}
            </p>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-olive-800">
              {currentUser?.role === 'admin' ? '管理控制台' : `您好，${currentUser?.name || '邻居'} 👋`}
            </h1>
            <p className="text-olive-600 mt-2">
              {currentUser?.role === 'admin'
                ? `今日共有 ${todayBookings.length} 个预约，${pendingCount} 个待审核`
                : '欢迎使用社区共享厨房，开启美味时光'}
            </p>
          </div>

          {currentUser?.role === 'resident' && (
            <div className="card card-hover p-5 flex items-center gap-4 max-w-sm">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  currentUser.permissionLevel === 'normal'
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                    : currentUser.permissionLevel === 'restricted'
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                    : 'bg-gradient-to-br from-rose-500 to-red-600'
                }`}
              >
                <ShieldAlert className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-xs text-olive-500">信用分</p>
                <p className="text-2xl font-bold text-olive-800">{currentUser.creditScore}</p>
                <p className="text-xs text-olive-500 mt-0.5">
                  {currentUser.permissionLevel === 'normal'
                    ? '预约权限正常'
                    : currentUser.permissionLevel === 'restricted'
                    ? '预约受限'
                    : '已暂停预约'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {zones.map((zone, idx) => {
          const Icon = zoneIconMap[zone.id];
          const currentBooking = getCurrentBooking(zone.id);
          const nextBooking = getNextBooking(zone.id);
          const zoneTodayCount = todayBookings.filter((b) => b.zone === zone.id).length;
          const isOccupied = !!currentBooking;

          return (
            <div
              key={zone.id}
              className="card card-hover overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`h-28 bg-gradient-to-br ${zone.gradient} p-5 relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
                </div>
                <div className="relative z-10 flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isOccupied
                        ? 'bg-rose-500/90 text-white'
                        : 'bg-white/90 text-emerald-700'
                    }`}
                  >
                    {isOccupied ? '使用中' : '空闲'}
                  </span>
                </div>
                <h3 className="relative z-10 text-white text-2xl font-serif font-bold mt-4">
                  {zone.name}
                </h3>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-olive-600">
                    <TrendingUp className="w-4 h-4" />
                    今日预约
                  </div>
                  <span className="text-2xl font-bold text-olive-800">{zoneTodayCount}</span>
                </div>

                {currentBooking ? (
                  <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-100">
                    <p className="text-xs text-rose-600 font-medium mb-1">当前使用者</p>
                    <p className="font-semibold text-rose-800">{currentBooking.userName}</p>
                    <p className="text-xs text-rose-600 mt-1">
                      {currentBooking.startTime} - {currentBooking.endTime}
                    </p>
                  </div>
                ) : nextBooking ? (
                  <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-xs text-amber-600 font-medium mb-1">下一场预约</p>
                    <p className="font-semibold text-amber-800">{nextBooking.userName}</p>
                    <p className="text-xs text-amber-600 mt-1">
                      {nextBooking.startTime} - {nextBooking.endTime}
                    </p>
                  </div>
                ) : (
                  <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-emerald-700 text-sm">今日暂无更多预约</p>
                  </div>
                )}

                <Link
                  to="/booking"
                  className="flex items-center justify-between p-3 rounded-xl bg-cream-50 hover:bg-cream-100 transition-colors group"
                >
                  <span className="text-sm font-medium text-olive-700">查看时段</span>
                  <ArrowRight className="w-4 h-4 text-olive-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6 animate-fade-in-up delay-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title flex items-center gap-2">
                <Clock className="w-5 h-5 text-terracotta-500" />
                今日日程
              </h2>
              <span className="badge bg-olive-50 text-olive-600">
                {todayBookings.length} 个预约
              </span>
            </div>

            {sortedTodayBookings.length === 0 ? (
              <div className="py-16 text-center">
                <CalendarPlus className="w-16 h-16 text-cream-300 mx-auto mb-4" />
                <p className="text-olive-500">今日暂无预约</p>
                {currentUser?.role === 'resident' && (
                  <Link to="/booking" className="btn-primary inline-flex mt-4 gap-2">
                    <CalendarPlus className="w-4 h-4" />
                    立即预约
                  </Link>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[76px] top-2 bottom-2 w-0.5 bg-cream-200" />
                <div className="space-y-4">
                  {sortedTodayBookings.map((booking, idx) => {
                    const s = statusConfig[booking.status];
                    const Icon = zoneIconMap[booking.zone];
                    const isCurrent =
                      currentTime >= booking.startTime && currentTime < booking.endTime;

                    return (
                      <div
                        key={booking.id}
                        className={`relative flex gap-4 p-4 rounded-2xl transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-r from-terracotta-50 to-cream-50 border border-terracotta-200 shadow-md'
                            : 'hover:bg-cream-50'
                        }`}
                      >
                        <div className="w-16 flex-shrink-0 text-right">
                          <p className="text-lg font-bold text-olive-800">{booking.startTime}</p>
                          <p className="text-xs text-olive-400 mt-0.5">{booking.endTime} 结束</p>
                        </div>

                        {isCurrent && (
                          <div className="absolute left-[72px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-terracotta-500 ring-4 ring-terracotta-100 animate-pulse-ring z-10" />
                        )}

                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${zones.find((z) => z.id === booking.zone)?.gradient} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-olive-800">{booking.userName}</p>
                            <span className={`badge ${s.className}`}>{s.label}</span>
                          </div>
                          <p className="text-sm text-olive-600 mt-1">
                            {zoneNameMap[booking.zone]} · {booking.peopleCount}人
                          </p>
                          {booking.remarks && (
                            <p className="text-xs text-olive-500 mt-1 truncate">
                              备注：{booking.remarks}
                            </p>
                          )}
                        </div>

                        {currentUser?.id === booking.userId && (
                          <Link
                            to={`/my-bookings/${booking.id}`}
                            className="hidden sm:flex items-center gap-1 text-sm text-terracotta-600 hover:text-terracotta-700 font-medium"
                          >
                            详情
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 animate-fade-in-up delay-300">
            <h2 className="section-title mb-5 flex items-center gap-2">
              <Users className="w-5 h-5 text-terracotta-500" />
              快捷操作
            </h2>
            <div className="space-y-3">
              {quickLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-cream-50 group transition-all border border-transparent hover:border-cream-200"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-olive-800">{link.label}</p>
                      {'count' in link && (
                        <p className="text-xs text-olive-500">
                          {link.count} 条记录
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-olive-400 group-hover:text-terracotta-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="card p-6 animate-fade-in-up delay-400 bg-gradient-to-br from-olive-50 via-white to-terracotta-50 border-terracotta-100">
            <h3 className="font-serif text-lg font-semibold text-olive-800 mb-3">
              💡 温馨提示
            </h3>
            <ul className="space-y-2 text-sm text-olive-600">
              <li className="flex items-start gap-2">
                <span className="text-terracotta-500 mt-0.5">•</span>
                请提前10分钟到达，凭门禁码进入
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terracotta-500 mt-0.5">•</span>
                使用完毕请清洁并上传照片
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terracotta-500 mt-0.5">•</span>
                违规将扣除信用分，影响后续预约
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terracotta-500 mt-0.5">•</span>
                如需取消，请提前2小时操作
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
