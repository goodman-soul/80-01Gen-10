import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-rose-50 border-rose-200 text-rose-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-sky-50 border-sky-200 text-sky-800',
};

const iconColorMap = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  warning: 'text-amber-500',
  info: 'text-sky-500',
};

export const NotificationToast = () => {
  const { notifications, removeNotification } = useBookingStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full animate-fade-in-up">
      {notifications.map((n, idx) => {
        const Icon = iconMap[n.type];
        return (
          <div
            key={n.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-card animate-slide-in backdrop-blur-sm ${colorMap[n.type]}`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColorMap[n.type]}`} />
            <p className="flex-1 text-sm font-medium leading-relaxed">{n.message}</p>
            <button
              onClick={() => removeNotification(n.id)}
              className="p-1 rounded-lg hover:bg-white/50 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 opacity-60" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
