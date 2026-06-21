import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Users,
  Wrench,
  Leaf,
  ShieldCheck,
  MessageSquare,
  Camera,
  KeyRound,
  ChefHat,
  CookingPot,
  Sparkles,
  XCircle,
  Upload,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { zones } from '@/data/zones';
import { statusConfig, zoneNameMap } from '@/components/ui/statusConfig';
import { formatDateCN, formatDateTimeCN, getRelativeTime } from '@/utils/dateTime';
import type { Booking } from '@/types';

const zoneIconMap: Record<string, typeof ChefHat> = {
  baking: ChefHat,
  cooking: CookingPot,
  cleaning: Sparkles,
};

export const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const getBooking = useBookingStore((s) => s.getBooking);
  const uploadCleanPhotos = useBookingStore((s) => s.uploadCleanPhotos);
  const getNextBooking = useBookingStore((s) => s.getNextBooking);

  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const booking = id ? getBooking(id) : undefined;
  const zoneConfig = booking ? zones.find((z) => z.id === booking.zone) : undefined;
  const nextBooking = booking
    ? getNextBooking(booking.zone, booking.date, booking.endTime)
    : undefined;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const newPhotos: string[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          newPhotos.push(ev.target.result as string);
          if (newPhotos.length === files.length) {
            setPhotos((prev) => [...prev, ...newPhotos]);
            setIsUploading(false);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitPhotos = () => {
    if (!booking || photos.length < 3) return;
    uploadCleanPhotos(booking.id, photos);
    navigate('/my-bookings');
  };

  if (!booking) {
    return (
      <div className="page-container">
        <div className="card p-16 text-center">
          <XCircle className="w-16 h-16 text-rose-300 mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-olive-800 mb-2">
            预约不存在
          </h2>
          <p className="text-olive-500 mb-6">该预约记录已被删除或不存在</p>
          <Link to="/my-bookings" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回预约列表
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.id === booking.userId;
  const s = statusConfig[booking.status];
  const Icon = zoneIconMap[booking.zone];
  const needsCleanPhotos = isOwner && ['in_use', 'clean_pending'].includes(booking.status);
  const canViewAccessCode = isOwner && booking.status === 'approved' && !!booking.accessCode;

  return (
    <div className="page-container">
      <div className="mb-6 animate-fade-in-up">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-olive-600 hover:text-terracotta-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-olive-800 mb-2">
              预约详情
            </h1>
            <p className="text-olive-500">
              提交于 {getRelativeTime(booking.createdAt)}
            </p>
          </div>
          <span className={`badge text-sm px-4 py-1.5 ${s.className}`}>
            {s.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 animate-fade-in-up delay-100">
            <div className="flex items-start gap-5">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${zoneConfig?.gradient} flex items-center justify-center shadow-md`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-serif font-bold text-olive-800">
                  {zoneConfig?.name}
                </h2>
                <p className="text-olive-600 mt-1">{zoneConfig?.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                  <div className="p-3 rounded-xl bg-cream-50">
                    <p className="text-xs text-olive-500 flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      日期
                    </p>
                    <p className="font-semibold text-olive-800 mt-1">{formatDateCN(booking.date)}</p>
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
                  <div className="p-3 rounded-xl bg-cream-50">
                    <p className="text-xs text-olive-500">申请人</p>
                    <p className="font-semibold text-olive-800 mt-1">{booking.userName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 animate-fade-in-up delay-200">
            <h3 className="font-serif text-lg font-semibold text-olive-800 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-terracotta-500" />
              使用的设备
            </h3>
            <div className="flex flex-wrap gap-2">
              {booking.equipment.map((e) => (
                <span
                  key={e}
                  className="px-4 py-2 rounded-xl bg-olive-50 text-olive-700 border border-olive-100 text-sm font-medium"
                >
                  {e}
                </span>
              ))}
            </div>
          </div>

          <div className="card p-6 animate-fade-in-up delay-300">
            <h3 className="font-serif text-lg font-semibold text-olive-800 mb-3 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-terracotta-500" />
              食材清单
            </h3>
            <p className="text-olive-700 leading-relaxed p-4 rounded-xl bg-cream-50">
              {booking.ingredients}
            </p>
          </div>

          {booking.remarks && (
            <div className="card p-6 animate-fade-in-up delay-300">
              <h3 className="font-serif text-lg font-semibold text-olive-800 mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-terracotta-500" />
                备注说明
              </h3>
              <p className="text-olive-700 leading-relaxed">{booking.remarks}</p>
            </div>
          )}

          {booking.cleanPromise && (
            <div className="card p-6 bg-gradient-to-br from-olive-50 to-cream-50 border-olive-100 animate-fade-in-up delay-300">
              <h3 className="font-serif text-lg font-semibold text-olive-800 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                清洁承诺
              </h3>
              <p className="text-sm text-olive-600 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 inline mr-1.5" />
                申请人已承诺使用完毕后清洁所有台面、设备和餐具，
                将垃圾分类处理并归位所有物品。
              </p>
            </div>
          )}

          {booking.rejectReason && (
            <div className="card p-6 bg-gradient-to-br from-rose-50 to-cream-50 border-rose-100 animate-fade-in-up delay-300">
              <h3 className="font-serif text-lg font-semibold text-rose-800 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                驳回原因
              </h3>
              <p className="text-rose-700 leading-relaxed">{booking.rejectReason}</p>
            </div>
          )}

          {needsCleanPhotos && (
            <div className="card p-6 animate-fade-in-up delay-300 border-terracotta-200">
              <h3 className="font-serif text-lg font-semibold text-olive-800 mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5 text-terracotta-500" />
                上传清洁照片
                <span className="text-sm font-normal text-rose-500 ml-1">
                  （至少3张：台面、地面、设备）
                </span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden group animate-slide-in"
                  >
                    <img
                      src={photo}
                      alt={`清洁照片 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/50 text-white text-xs">
                      {idx === 0 && '台面'}
                      {idx === 1 && '地面'}
                      {idx === 2 && '设备'}
                      {idx > 2 && `其他${idx - 2}`}
                    </div>
                  </div>
                ))}

                <label className="aspect-square rounded-xl border-2 border-dashed border-cream-300 hover:border-terracotta-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-cream-50 hover:bg-terracotta-50 group">
                  {isUploading ? (
                    <div className="w-8 h-8 border-3 border-terracotta-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-cream-400 group-hover:text-terracotta-500 mb-2" />
                      <span className="text-sm text-olive-500 group-hover:text-terracotta-600 font-medium">
                        上传照片
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-cream-50">
                <div>
                  <p className="font-medium text-olive-800">
                    已上传 {photos.length} / 3 张
                  </p>
                  <div className="w-40 h-2 bg-cream-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        photos.length >= 3 ? 'bg-emerald-500' : 'bg-terracotta-500'
                      }`}
                      style={{ width: `${Math.min(100, (photos.length / 3) * 100)}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSubmitPhotos}
                  disabled={photos.length < 3}
                  className="btn-primary"
                >
                  提交清洁照片
                </button>
              </div>
            </div>
          )}

          {booking.cleanPhotos && booking.cleanPhotos.length > 0 && (
            <div className="card p-6 animate-fade-in-up delay-300">
              <h3 className="font-serif text-lg font-semibold text-olive-800 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-terracotta-500" />
                清洁照片
                {booking.cleanConfirmedAt && (
                  <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 ml-2">
                    已确认合格
                  </span>
                )}
                {booking.cleanReportReason && (
                  <span className="badge bg-rose-50 text-rose-700 border border-rose-200 ml-2">
                    被举报不合格
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {booking.cleanPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl overflow-hidden shadow-sm"
                  >
                    <img
                      src={photo}
                      alt={`清洁照片 ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
              {booking.cleanConfirmedAt && (
                <p className="text-sm text-olive-500 mt-4">
                  确认时间：{formatDateTimeCN(booking.cleanConfirmedAt)}
                </p>
              )}
            </div>
          )}

          {nextBooking && booking.status === 'completed' && booking.cleanPhotos && !booking.cleanConfirmedAt && (
            <div className="card p-6 bg-gradient-to-br from-sky-50 to-cream-50 border-sky-200 animate-fade-in-up">
              <h3 className="font-serif text-lg font-semibold text-olive-800 mb-3">
                请下一位用户确认清洁
              </h3>
              <p className="text-sm text-olive-600 mb-4">
                下一场预约用户：{nextBooking.userName} · {nextBooking.startTime} 开始
              </p>
              <Link
                to={`/clean-confirm/${booking.id}`}
                className="btn-secondary inline-flex items-center gap-2"
              >
                前往确认清洁状态
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {canViewAccessCode && (
            <div className="card p-6 bg-gradient-to-br from-terracotta-50 via-white to-olive-50 border-terracotta-200 animate-fade-in-up delay-100">
              <h3 className="font-serif text-lg font-semibold text-olive-800 mb-4">
                门禁码
              </h3>
              <p className="text-xs text-olive-500 mb-4">
                门禁码将在预约开始前30分钟激活使用
              </p>
              <Link
                to={`/access-code/${booking.id}`}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <KeyRound className="w-5 h-5" />
                查看门禁码
              </Link>
            </div>
          )}

          <div className="card p-6 animate-fade-in-up delay-200">
            <h3 className="font-serif text-lg font-semibold text-olive-800 mb-4">
              时间线
            </h3>
            <div className="relative pl-6 space-y-5">
              <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-cream-200" />

              <div className="relative">
                <div className="absolute -left-6 w-5 h-5 rounded-full bg-olive-500 ring-4 ring-cream-50" />
                <p className="text-sm font-medium text-olive-800">创建预约</p>
                <p className="text-xs text-olive-500 mt-0.5">
                  {formatDateTimeCN(booking.createdAt)}
                </p>
              </div>

              {booking.accessCodeGeneratedAt && (
                <div className="relative">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-cream-50" />
                  <p className="text-sm font-medium text-olive-800">审核通过，生成门禁码</p>
                  <p className="text-xs text-olive-500 mt-0.5">
                    {formatDateTimeCN(booking.accessCodeGeneratedAt)}
                  </p>
                </div>
              )}

              {booking.status === 'rejected' && (
                <div className="relative">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-rose-500 ring-4 ring-cream-50" />
                  <p className="text-sm font-medium text-rose-800">预约被驳回</p>
                  <p className="text-xs text-olive-500 mt-0.5">
                    {formatDateTimeCN(booking.updatedAt)}
                  </p>
                </div>
              )}

              {booking.cleanConfirmedAt && (
                <div className="relative">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-emerald-600 ring-4 ring-cream-50" />
                  <p className="text-sm font-medium text-olive-800">清洁已确认完成</p>
                  <p className="text-xs text-olive-500 mt-0.5">
                    {formatDateTimeCN(booking.cleanConfirmedAt)}
                  </p>
                </div>
              )}

              {booking.status === 'completed' && !booking.cleanConfirmedAt && (
                <div className="relative">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-sky-500 ring-4 ring-cream-50 animate-pulse" />
                  <p className="text-sm font-medium text-sky-700">等待清洁确认</p>
                  <p className="text-xs text-olive-500 mt-0.5">
                    等待下一位用户确认
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
