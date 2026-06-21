import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Trash2,
  ImageOff,
  Clock,
  AlertTriangle,
  UserX,
  AlertCircle,
  ChevronRight,
  CalendarCheck,
  Award,
  Info,
  AlertOctagon,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { violationTypeConfig, permissionLevelConfig } from '@/components/ui/statusConfig';
import { getPermissionDescription, CREDIT_THRESHOLDS } from '@/utils/credit';
import { formatDateTimeCN } from '@/utils/dateTime';

const violationIconMap: Record<string, typeof Trash2> = {
  unclean: Trash2,
  no_clean_photo: ImageOff,
  overtime: Clock,
  equipment_damage: AlertTriangle,
  no_show: UserX,
  other: AlertCircle,
};

export const Violations = () => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const getUserViolations = useBookingStore((s) => s.getUserViolations);

  const violations = currentUser ? getUserViolations(currentUser.id) : [];
  const score = currentUser?.creditScore || 100;
  const level = currentUser?.permissionLevel || 'normal';

  const scoreColor =
    score > CREDIT_THRESHOLDS.RESTRICTED
      ? 'from-emerald-400 to-emerald-600'
      : score > CREDIT_THRESHOLDS.SUSPENDED
      ? 'from-amber-400 to-orange-500'
      : 'from-rose-500 to-red-600';

  const scorePercent = score;

  return (
    <div className="page-container">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-olive-800 mb-2">
          违规记录
        </h1>
        <p className="text-olive-600">查看您的信用分和违规历史记录</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 animate-fade-in-up delay-100 bg-gradient-to-br from-cream-50 to-white">
            <h2 className="font-serif text-lg font-semibold text-olive-800 mb-5 flex items-center gap-2">
              <Award className="w-5 h-5 text-terracotta-500" />
              信用评分
            </h2>

            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#E7ECE0"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${scorePercent * 2.64} 264`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={score > 60 ? '#34d399' : score > 30 ? '#fbbf24' : '#f43f5e'} />
                    <stop offset="100%" stopColor={score > 60 ? '#059669' : score > 30 ? '#f97316' : '#dc2626'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-serif font-bold text-olive-800">{score}</span>
                <span className="text-xs text-olive-500 mt-1">/ 100 分</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${permissionLevelConfig[level].className} mb-4`}>
              <p className="font-semibold flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                {permissionLevelConfig[level].label}
              </p>
              <p className="text-xs mt-1 opacity-80 leading-relaxed">
                {getPermissionDescription(level)}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-olive-500 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4" />
                  正常阈值
                </span>
                <span className="font-semibold text-emerald-600">{CREDIT_THRESHOLDS.RESTRICTED}+ 分</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-olive-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  受限阈值
                </span>
                <span className="font-semibold text-amber-600">{CREDIT_THRESHOLDS.SUSPENDED}-{CREDIT_THRESHOLDS.RESTRICTED} 分</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-olive-500 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  暂停阈值
                </span>
                <span className="font-semibold text-rose-600">0-{CREDIT_THRESHOLDS.SUSPENDED} 分</span>
              </div>
            </div>
          </div>

          <div className="card p-6 animate-fade-in-up delay-200 bg-gradient-to-br from-olive-50 via-white to-terracotta-50 border-terracotta-100">
            <h3 className="font-serif text-lg font-semibold text-olive-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-terracotta-500" />
              信用恢复指南
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-olive-700">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>保持连续5次无违规预约，每次可恢复 2 分</span>
              </li>
              <li className="flex items-start gap-2 text-olive-700">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>主动在社区做志愿服务可申请加分（每次5-10分）</span>
              </li>
              <li className="flex items-start gap-2 text-olive-700">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>对违规记录有异议可在3天内发起申诉</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6 animate-fade-in-up delay-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-semibold text-olive-800 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-terracotta-500" />
                违规记录
              </h2>
              <span className="badge bg-cream-100 text-olive-600">
                共 {violations.length} 条
              </span>
            </div>

            {violations.length === 0 ? (
              <div className="py-16 text-center">
                <CalendarCheck className="w-20 h-20 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-bold text-olive-700 mb-2">
                  暂无违规记录
                </h3>
                <p className="text-olive-500 mb-6">
                  继续保持！规范使用共享厨房，维护良好环境
                </p>
                <Link to="/booking" className="btn-primary inline-flex items-center gap-2">
                  去预约
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-terracotta-300 via-cream-200 to-olive-200" />
                <div className="space-y-6">
                  {violations.map((v, idx) => {
                    const config = violationTypeConfig[v.type];
                    const Icon = violationIconMap[v.type] || AlertCircle;
                    return (
                      <div
                        key={v.id}
                        className="relative pl-14 animate-fade-in-up"
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <div className={`absolute left-0 top-0 w-10 h-10 rounded-xl bg-gradient-to-br ${config.className.split(' ')[0].replace('bg-', 'from-').replace('50', '400')} to-${config.className.split(' ')[0].replace('bg-', '').replace('50', '600')} flex items-center justify-center shadow-md border-2 border-white`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>

                        <div className="card p-5">
                          <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-olive-800">{config.label}</h4>
                              <span className={`badge ${config.className}`}>
                                -{v.pointDeduction} 分
                              </span>
                              {v.appealStatus === 'pending' && (
                                <span className="badge bg-amber-50 text-amber-700 border border-amber-200">
                                  申诉中
                                </span>
                              )}
                              {v.appealStatus === 'approved' && (
                                <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  申诉通过
                                </span>
                              )}
                              {v.appealStatus === 'rejected' && (
                                <span className="badge bg-rose-50 text-rose-700 border border-rose-200">
                                  申诉驳回
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-olive-400">
                              {formatDateTimeCN(v.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-olive-600 leading-relaxed mb-3">
                            {v.description}
                          </p>
                          {v.reportedBy && (
                            <p className="text-xs text-olive-400 flex items-center gap-1">
                              <UserX className="w-3.5 h-3.5" />
                              处理人：{v.reportedBy === 'system' ? '系统自动检测' : v.reportedBy === 'admin_001' ? '管理员' : '用户举报'}
                            </p>
                          )}
                          {v.appealStatus === 'none' && (
                            <div className="mt-4 pt-3 border-t border-cream-100 flex justify-end">
                              <button className="btn-ghost text-sm flex items-center gap-1">
                                发起申诉
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
