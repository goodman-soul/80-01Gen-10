import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChefHat,
  CookingPot,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  Camera,
  User,
  CalendarDays,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { zones } from '@/data/zones';
import { zoneNameMap } from '@/components/ui/statusConfig';
import { formatDateCN } from '@/utils/dateTime';

const zoneIconMap: Record<string, typeof ChefHat> = {
  baking: ChefHat,
  cooking: CookingPot,
  cleaning: Sparkles,
};

export const CleanConfirm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const getBooking = useBookingStore((s) => s.getBooking);
  const confirmCleanliness = useBookingStore((s) => s.confirmCleanliness);
  const canConfirmCleanliness = useBookingStore((s) => s.canConfirmCleanliness);
  const addNotification = useBookingStore((s) => s.addNotification);
  const getNextBooking = useBookingStore((s) => s.getNextBooking);

  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [photoIdx, setPhotoIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const booking = id ? getBooking(id) : undefined;
  const zoneConfig = booking ? zones.find((z) => z.id === booking.zone) : undefined;
  const Icon = booking ? zoneIconMap[booking.zone] : ChefHat;
  const hasPermission = id ? canConfirmCleanliness(currentUser?.id, id) : false;
  const nextBooking = booking
    ? getNextBooking(booking.zone, booking.date, booking.endTime)
    : undefined;

  useEffect(() => {
    if (booking && booking.cleanPhotos && !hasPermission) {
      addNotification('error', '您不是该时段下一位预约者，无权确认清洁状态');
      navigate('/', { replace: true });
    }
  }, [booking, hasPermission, navigate, addNotification]);

  const handleConfirm = () => {
    if (!booking) return;
    setSubmitting(true);
    setTimeout(() => {
      confirmCleanliness(booking.id, true);
      navigate('/');
    }, 600);
  };

  const handleReport = () => {
    if (!booking || !reportReason.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      confirmCleanliness(booking.id, false, reportReason.trim());
      navigate('/');
    }, 600);
  };

  if (!booking || !booking.cleanPhotos) {
    return (
      <div className="page-container">
        <div className="max-w-lg mx-auto card p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-olive-800 mb-2">
            无清洁照片待确认
          </h2>
          <p className="text-olive-500 mb-6">该预约尚未上传清洁照片或记录不存在</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="page-container">
        <div className="max-w-lg mx-auto card p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-olive-800 mb-2">
            无权限确认
          </h2>
          <p className="text-olive-500 mb-6">
            只有该时段的下一位预约者才能确认清洁状态
            {nextBooking && (
              <span className="block mt-2 text-xs">
                下一位使用者：{nextBooking.userName}（{nextBooking.startTime} 开始）
              </span>
            )}
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const photos = booking.cleanPhotos;
  const photoLabels = ['台面清洁', '地面清洁', '设备清洁', '整体环境'];

  return (
    <div className="page-container">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-olive-600 hover:text-terracotta-600 transition-colors mb-6 animate-fade-in-up"
      >
        <ArrowLeft className="w-5 h-5" />
        返回
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className={`inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br ${zoneConfig?.gradient} items-center justify-center shadow-lg mb-4`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-olive-800 mb-2">
            清洁状态确认
          </h1>
          <p className="text-olive-600">
            请仔细检查上一位用户的清洁情况后进行确认
          </p>
        </div>

        <div className="card p-6 mb-6 animate-fade-in-up delay-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 p-4 rounded-xl bg-cream-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-olive-100 flex items-center justify-center">
                <User className="w-6 h-6 text-olive-600" />
              </div>
              <div>
                <p className="font-semibold text-olive-800">{booking.userName}</p>
                <p className="text-xs text-olive-500">上一位使用用户</p>
              </div>
            </div>
            <div className="h-px sm:h-12 sm:w-px bg-cream-200 sm:mx-2" />
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm flex-1">
              <div className="flex items-center gap-1.5 text-olive-600">
                <CalendarDays className="w-4 h-4 text-olive-400" />
                {formatDateCN(booking.date)}
              </div>
              <div className="flex items-center gap-1.5 text-olive-600">
                <Clock className="w-4 h-4 text-olive-400" />
                {booking.startTime} - {booking.endTime}
              </div>
              <div className="flex items-center gap-1.5 text-olive-600">
                {zoneNameMap[booking.zone]}
              </div>
            </div>
          </div>

          <h3 className="font-serif text-lg font-semibold text-olive-800 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-terracotta-500" />
            清洁照片
            <span className="text-sm font-normal text-olive-500">（共 {photos.length} 张）</span>
          </h3>

          <div className="relative rounded-2xl overflow-hidden bg-olive-900 mb-4 aspect-video">
            <img
              src={photos[photoIdx]}
              alt={photoLabels[photoIdx] || '清洁照片'}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 text-white text-sm">
              {photoLabels[photoIdx] || `照片 ${photoIdx + 1}`}
            </div>
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/60 text-white text-sm">
              {photoIdx + 1} / {photos.length}
            </div>
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors rotate-180"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {photos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setPhotoIdx(idx)}
                className={`aspect-square rounded-lg overflow-hidden transition-all border-2 ${
                  photoIdx === idx
                    ? 'border-terracotta-500 shadow-md scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={photo} alt={`缩略图 ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 animate-fade-in-up delay-200">
          {!showReport ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="card p-6 text-left hover:-translate-y-1 transition-all border-2 border-transparent hover:border-emerald-300 group disabled:opacity-60"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-lg font-serif font-bold text-olive-800 mb-1">
                  清洁合格
                </h4>
                <p className="text-sm text-olive-500 leading-relaxed">
                  台面、地面、设备均已清洁到位，物品归位整齐
                </p>
              </button>

              <button
                onClick={() => setShowReport(true)}
                disabled={submitting}
                className="card p-6 text-left hover:-translate-y-1 transition-all border-2 border-transparent hover:border-rose-300 group disabled:opacity-60"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <XCircle className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-lg font-serif font-bold text-olive-800 mb-1">
                  举报不合格
                </h4>
                <p className="text-sm text-olive-500 leading-relaxed">
                  发现清洁不到位、物品损坏或其他问题需要上报
                </p>
              </button>
            </div>
          ) : (
            <div className="card p-6 border-rose-200 bg-gradient-to-br from-rose-50 to-white">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-rose-800">
                    举报清洁不合格
                  </h4>
                  <p className="text-sm text-rose-600 mt-1">
                    请详细描述发现的问题，管理员将根据情况处理
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <label className="label-text flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  举报原因 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  rows={5}
                  className="input-field resize-none"
                  placeholder="请详细描述清洁问题，例如：台面残留油污、地面有积水、设备未清理干净..."
                />
                <div className="flex flex-wrap gap-2">
                  {[
                    '台面残留油污',
                    '地面有积水/垃圾',
                    '设备未清理',
                    '餐具未清洗',
                    '物品未归位',
                    '垃圾桶未清空',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setReportReason((r) => (r ? `${r}，${tag}` : tag))
                      }
                      className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 text-sm hover:bg-rose-50 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 mb-6">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                恶意举报将同样被记录违规，并扣除相应信用分
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReport(false)}
                  className="btn-outline flex-1"
                >
                  返回
                </button>
                <button
                  onClick={handleReport}
                  disabled={!reportReason.trim() || submitting}
                  className="btn-primary !bg-rose-500 hover:!bg-rose-600 flex-1"
                >
                  {submitting ? '提交中...' : '确认举报'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
