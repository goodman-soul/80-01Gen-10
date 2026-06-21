import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  KeyRound,
  Clock,
  CalendarDays,
  ChefHat,
  CookingPot,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Info,
  MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { zones } from '@/data/zones';
import { zoneNameMap } from '@/components/ui/statusConfig';
import { formatDateCN, getCurrentTime, getMinutesBetween } from '@/utils/dateTime';
import { generateAccessCode } from '@/utils/codeGenerator';

const zoneIconMap: Record<string, typeof ChefHat> = {
  baking: ChefHat,
  cooking: CookingPot,
  cleaning: Sparkles,
};

export const AccessCode = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const getBooking = useBookingStore((s) => s.getBooking);
  const updateBookingStatus = useBookingStore((s) => s.updateBookingStatus);
  const addNotification = useBookingStore((s) => s.addNotification);

  const booking = id ? getBooking(id) : undefined;
  const zoneConfig = booking ? zones.find((z) => z.id === booking.zone) : undefined;
  const Icon = booking ? zoneIconMap[booking.zone] : ChefHat;

  const [displayCode, setDisplayCode] = useState<string>('');
  const [countdown, setCountdown] = useState(30);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleDigits, setVisibleDigits] = useState<boolean[]>([false, false, false, false, false, false]);

  const currentTime = getCurrentTime();
  const isBefore = booking && currentTime < booking.startTime;
  const minutesBefore = isBefore && booking ? getMinutesBetween(currentTime, booking.startTime) : 0;
  const canView = booking && booking.status === 'approved' && (minutesBefore || 0) <= 30 && currentTime < booking.endTime;
  const isInUse = booking && currentTime >= booking.startTime && currentTime < booking.endTime;

  useEffect(() => {
    if (booking?.accessCode) {
      setDisplayCode(booking.accessCode);
    }
  }, [booking?.accessCode]);

  useEffect(() => {
    if (displayCode && canView) {
      visibleDigits.forEach((_, i) => {
        setTimeout(() => {
          setVisibleDigits((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, i * 120);
      });
    }
  }, [displayCode, canView]);

  useEffect(() => {
    if (!canView) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          handleRefresh();
          return 30;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [canView]);

  const handleRefresh = () => {
    if (!booking) return;
    setRefreshing(true);
    setVisibleDigits([false, false, false, false, false, false]);

    setTimeout(() => {
      const newCode = generateAccessCode();
      setDisplayCode(newCode);
      updateBookingStatus(booking.id, 'approved', {
        accessCode: newCode,
        accessCodeGeneratedAt: new Date().toISOString(),
      });
      setCountdown(30);
      setRefreshing(false);
      addNotification('info', '门禁码已自动刷新');

      visibleDigits.forEach((_, i) => {
        setTimeout(() => {
          setVisibleDigits((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, i * 120);
      });
    }, 500);
  };

  const handleMarkInUse = () => {
    if (!booking) return;
    updateBookingStatus(booking.id, 'in_use');
    addNotification('success', '已开始使用，祝使用愉快！');
  };

  if (!booking || currentUser?.id !== booking.userId) {
    return (
      <div className="page-container">
        <div className="max-w-lg mx-auto card p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-olive-800 mb-2">
            无权限访问
          </h2>
          <p className="text-olive-500 mb-6">该门禁码不属于您或预约不存在</p>
          <Link to="/my-bookings" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回预约列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 via-cream-100 to-terracotta-50">
      <div className="page-container">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-olive-600 hover:text-terracotta-600 transition-colors mb-6 animate-fade-in-up"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6 animate-fade-in-up">
            <div className={`inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br ${zoneConfig?.gradient} items-center justify-center shadow-xl mb-4 animate-pulse-ring`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-olive-800">
              {zoneConfig?.name} · 门禁码
            </h1>
            <p className="text-olive-500 mt-2 flex items-center justify-center gap-2">
              <CalendarDays className="w-4 h-4" />
              {formatDateCN(booking.date)}
              <span className="mx-1">·</span>
              <Clock className="w-4 h-4" />
              {booking.startTime} - {booking.endTime}
            </p>
          </div>

          <div className="card p-8 md:p-12 overflow-hidden animate-fade-in-up delay-100 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-olive-500 via-terracotta-500 to-olive-500" />
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-terracotta-100 blur-3xl opacity-60" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-olive-100 blur-3xl opacity-60" />

            <div className="relative z-10">
              {canView ? (
                <>
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 md:gap-4 mb-6">
                      {displayCode.split('').map((digit, idx) => (
                        <div
                          key={idx}
                          className={`w-12 h-16 md:w-16 md:h-20 rounded-2xl bg-gradient-to-br from-olive-600 to-olive-700 flex items-center justify-center shadow-xl transition-all duration-500 ${
                            visibleDigits[idx]
                              ? 'opacity-100 translate-y-0 scale-100'
                              : 'opacity-0 -translate-y-4 scale-95'
                          }`}
                        >
                          <span className="text-4xl md:text-5xl font-bold text-white font-mono tracking-wider animate-breath">
                            {digit}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-2">
                      <RefreshCw className={`w-4 h-4 text-terracotta-500 ${refreshing ? 'animate-spin' : ''}`} />
                      <span className="text-sm text-olive-600">
                        门禁码将在 <span className="font-bold text-terracotta-600">{countdown}s</span> 后自动刷新
                      </span>
                    </div>
                    <p className="text-xs text-olive-400">
                      动态门禁码每30秒自动刷新，请勿截图分享
                    </p>
                  </div>

                  <div className="flex justify-center mb-8">
                    <div className="p-4 bg-white rounded-2xl shadow-soft border border-cream-200 animate-breath">
                      <QRCodeSVG
                        value={`KITCHEN-${booking.id}-${displayCode}-${Date.now()}`}
                        size={160}
                        level="H"
                        includeMargin={true}
                        fgColor="#495A3A"
                      />
                    </div>
                  </div>

                  {!isInUse && (
                    <button
                      onClick={handleMarkInUse}
                      className="w-full btn-secondary py-4 text-lg flex items-center justify-center gap-2"
                    >
                      <KeyRound className="w-5 h-5" />
                      我已进入，开始使用
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  {isBefore && minutesBefore && minutesBefore > 30 ? (
                    <>
                      <Clock className="w-20 h-20 text-olive-300 mx-auto mb-4" />
                      <h3 className="text-xl font-serif font-bold text-olive-800 mb-2">
                        门禁码尚未激活
                      </h3>
                      <p className="text-olive-600 mb-4">
                        门禁码将在预约开始前30分钟开放查看
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700">
                        <Info className="w-4 h-4" />
                        还需等待约 {Math.floor(minutesBefore / 60)}小时 {minutesBefore % 60} 分钟
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-20 h-20 text-amber-300 mx-auto mb-4" />
                      <h3 className="text-xl font-serif font-bold text-olive-800 mb-2">
                        当前无法查看门禁码
                      </h3>
                      <p className="text-olive-600">
                        预约可能已过期或状态异常，请联系管理员
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card p-6 mt-6 animate-fade-in-up delay-200">
            <h3 className="font-serif text-lg font-semibold text-olive-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-terracotta-500" />
              使用说明
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-cream-50">
                <div className="w-7 h-7 rounded-lg bg-olive-100 text-olive-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-olive-800">到达门禁位置</p>
                  <p className="text-olive-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    社区服务中心东侧共享厨房入口
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-cream-50">
                <div className="w-7 h-7 rounded-lg bg-olive-100 text-olive-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-olive-800">输入门禁码或扫描二维码</p>
                  <p className="text-olive-500 mt-0.5">
                    在门禁面板输入6位数字，或使用手机扫描左侧二维码
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-cream-50">
                <div className="w-7 h-7 rounded-lg bg-olive-100 text-olive-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-olive-800">注意有效时间</p>
                  <p className="text-olive-500 mt-0.5">
                    门禁码在预约开始前30分钟至结束前有效，过期将无法使用
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
