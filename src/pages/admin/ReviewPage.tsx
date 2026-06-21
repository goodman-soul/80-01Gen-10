import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  ChefHat,
  CookingPot,
  Sparkles,
  Users,
  CalendarDays,
  Clock,
  Wrench,
  Leaf,
  Check,
  X,
  XCircle,
  MessageSquare,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { zones } from '@/data/zones';
import { zoneNameMap } from '@/components/ui/statusConfig';
import { formatDateCN } from '@/utils/dateTime';
import type { KitchenZone } from '@/types';

const zoneIconMap: Record<string, typeof ChefHat> = {
  baking: ChefHat,
  cooking: CookingPot,
  cleaning: Sparkles,
};

const rejectReasons = [
  '申请时段与其他预约冲突',
  '信用分不足，请先处理违规记录',
  '人数超过区域最大容纳量',
  '食材/设备需求需进一步确认',
  '其他原因（请在下方说明）',
];

export const ReviewPage = () => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const getPendingBookings = useBookingStore((s) => s.getPendingBookings);
  const approveBooking = useBookingStore((s) => s.approveBooking);
  const rejectBooking = useBookingStore((s) => s.rejectBooking);

  const [zoneFilter, setZoneFilter] = useState<KitchenZone | 'all'>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const pendingBookings = getPendingBookings();
  const filtered = zoneFilter === 'all'
    ? pendingBookings
    : pendingBookings.filter((b) => b.zone === zoneFilter);

  const handleApprove = (id: string) => {
    setApprovingId(id);
    setTimeout(() => {
      approveBooking(id);
      setApprovingId(null);
    }, 400);
  };

  const handleReject = () => {
    if (!rejectingId) return;
    const reason = selectedReason === '其他原因（请在下方说明）'
      ? customReason
      : selectedReason;
    if (!reason.trim()) return;
    rejectBooking(rejectingId, reason.trim());
    setRejectingId(null);
    setSelectedReason('');
    setCustomReason('');
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="page-container">
        <div className="max-w-lg mx-auto card p-12 text-center">
          <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-olive-800 mb-2">
              预约审核
            </h1>
            <p className="text-olive-600">审核居民预约申请，通过后自动生成门禁码</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 text-sm">
              <FileCheck className="w-4 h-4 mr-1.5" />
              待审核 {pendingBookings.length} 条
            </span>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-6 animate-fade-in-up delay-100">
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          <Filter className="w-5 h-5 text-olive-500 flex-shrink-0" />
          <button
            onClick={() => setZoneFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              zoneFilter === 'all'
                ? 'bg-olive-600 text-white shadow-md'
                : 'bg-cream-50 text-olive-600 hover:bg-cream-100'
            }`}
          >
            全部
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${zoneFilter === 'all' ? 'bg-white/20' : 'bg-cream-200'}`}>
              {pendingBookings.length}
            </span>
          </button>
          {zones.map((z) => {
            const count = pendingBookings.filter((b) => b.zone === z.id).length;
            const Icon = zoneIconMap[z.id];
            return (
              <button
                key={z.id}
                onClick={() => setZoneFilter(z.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  zoneFilter === z.id
                    ? 'bg-olive-600 text-white shadow-md'
                    : 'bg-cream-50 text-olive-600 hover:bg-cream-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {z.name}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${zoneFilter === z.id ? 'bg-white/20' : 'bg-cream-200'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in-up delay-200">
          <CheckCircle2 className="w-20 h-20 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-xl font-serif font-bold text-olive-700 mb-2">
            暂无待审核预约
          </h3>
          <p className="text-olive-500">所有预约已处理完毕</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((booking, idx) => {
            const zoneConfig = zones.find((z) => z.id === booking.zone);
            const Icon = zoneIconMap[booking.zone];
            return (
              <div
                key={booking.id}
                className="card p-6 animate-fade-in-up"
                style={{ animationDelay: `${Math.min(idx, 5) * 80}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${zoneConfig?.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-4">
                      <h3 className="text-xl font-serif font-bold text-olive-800">
                        {zoneNameMap[booking.zone]}
                      </h3>
                      <span className="badge bg-amber-50 text-amber-700 border border-amber-200">
                        待审核
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                      <div className="p-3 rounded-xl bg-cream-50">
                        <p className="text-xs text-olive-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          申请人
                        </p>
                        <p className="font-semibold text-olive-800 mt-1">{booking.userName}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-cream-50">
                        <p className="text-xs text-olive-500 flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          日期
                        </p>
                        <p className="font-semibold text-olive-800 mt-1">
                          {formatDateCN(booking.date)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-cream-50">
                        <p className="text-xs text-olive-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          时段
                        </p>
                        <p className="font-semibold text-olive-800 mt-1">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-cream-50">
                        <p className="text-xs text-olive-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          人数
                        </p>
                        <p className="font-semibold text-olive-800 mt-1">{booking.peopleCount} 人</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div>
                        <p className="label-text text-xs mb-2 flex items-center gap-1">
                          <Wrench className="w-3.5 h-3.5" />
                          使用设备
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {booking.equipment.map((e) => (
                            <span
                              key={e}
                              className="px-2.5 py-1 rounded-lg bg-olive-50 text-olive-700 border border-olive-100 text-xs font-medium"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="label-text text-xs mb-2 flex items-center gap-1">
                          <Leaf className="w-3.5 h-3.5" />
                          食材
                        </p>
                        <p className="text-sm text-olive-700 p-3 rounded-xl bg-cream-50 line-clamp-2">
                          {booking.ingredients}
                        </p>
                      </div>
                    </div>

                    {booking.remarks && (
                      <div className="mb-5">
                        <p className="label-text text-xs mb-2 flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          备注
                        </p>
                        <p className="text-sm text-olive-600 p-3 rounded-xl bg-cream-50">
                          {booking.remarks}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-3 lg:gap-4 lg:w-40 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(booking.id)}
                      disabled={approvingId === booking.id}
                      className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {approvingId === booking.id ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          通过
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setRejectingId(booking.id)}
                      className="flex-1 py-3 px-5 rounded-xl font-medium border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      驳回
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-olive-900/40 backdrop-blur-sm animate-fade-in-up">
          <div className="card p-6 max-w-md w-full animate-slide-in">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-olive-800">
                  驳回预约申请
                </h3>
                <p className="text-sm text-olive-500 mt-1">请选择驳回原因</p>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {rejectReasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                    selectedReason === r
                      ? 'bg-rose-50 border-rose-300'
                      : 'bg-white border-cream-200 hover:border-cream-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedReason === r ? 'border-rose-500' : 'border-cream-300'
                    }`}
                  >
                    {selectedReason === r && (
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    )}
                  </div>
                  <span className={`text-sm ${selectedReason === r ? 'font-medium text-rose-700' : 'text-olive-700'}`}>
                    {r}
                  </span>
                </label>
              ))}
            </div>

            {selectedReason === '其他原因（请在下方说明）' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                className="input-field mb-5 resize-none"
                placeholder="请输入驳回原因..."
              />
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setSelectedReason('');
                  setCustomReason('');
                }}
                className="btn-outline"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={!selectedReason || (selectedReason === '其他原因（请在下方说明）' && !customReason.trim())}
                className="btn-primary !bg-rose-500 hover:!bg-rose-600"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
