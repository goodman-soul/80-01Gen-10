import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, UserPlus, Users, ArrowRight, Phone, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import type { UserRole } from '@/types';

export const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const addNotification = useBookingStore((s) => s.addNotification);

  const [role, setRole] = useState<UserRole>('resident');
  const [phone, setPhone] = useState('13800138001');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(role === 'resident' ? phone : undefined, role);
    addNotification('success', role === 'admin' ? '管理员登录成功' : '欢迎回来！');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-cream-50 to-olive-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-olive-500 via-olive-600 to-olive-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-terracotta-400 blur-3xl" />
            <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-olive-300 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-white">社区共享厨房</h1>
                <p className="text-olive-100 text-sm mt-0.5">时段管理系统</p>
              </div>
            </div>

            <h2 className="text-4xl font-serif font-bold text-white leading-tight mb-6">
              邻里共享<br />
              <span className="text-terracotta-300">美好生活</span>
            </h2>

            <p className="text-olive-100 leading-relaxed max-w-sm">
              便捷预约三大功能区，烘焙、烹饪、清洗自由切换。
              智能门禁管理，信用体系保障社区规范有序。
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-olive-100">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm">多角色灵活切换</span>
            </div>
            <div className="flex items-center gap-3 text-olive-100">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-sm">一键预约 无需注册</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 lg:p-12">
          <div className="max-w-sm mx-auto w-full">
            <h3 className="text-2xl font-serif font-bold text-olive-800 mb-2">
              欢迎登录
            </h3>
            <p className="text-olive-500 mb-8">请选择身份后继续</p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <button
                onClick={() => setRole('resident')}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                  role === 'resident'
                    ? 'border-terracotta-500 bg-terracotta-50'
                    : 'border-cream-200 hover:border-cream-300 hover:bg-cream-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                  role === 'resident' ? 'bg-terracotta-500' : 'bg-cream-200'
                }`}>
                  <Users className={`w-5 h-5 ${role === 'resident' ? 'text-white' : 'text-olive-600'}`} />
                </div>
                <div className={`text-sm font-semibold ${role === 'resident' ? 'text-terracotta-700' : 'text-olive-700'}`}>
                  居民用户
                </div>
              </button>

              <button
                onClick={() => setRole('admin')}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                  role === 'admin'
                    ? 'border-olive-500 bg-olive-50'
                    : 'border-cream-200 hover:border-cream-300 hover:bg-cream-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                  role === 'admin' ? 'bg-olive-500' : 'bg-cream-200'
                }`}>
                  <UserPlus className={`w-5 h-5 ${role === 'admin' ? 'text-white' : 'text-olive-600'}`} />
                </div>
                <div className={`text-sm font-semibold ${role === 'admin' ? 'text-olive-700' : 'text-olive-700'}`}>
                  管理员
                </div>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {role === 'resident' ? (
                <div className="mb-8">
                  <label className="label-text">手机号</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field pl-12"
                      placeholder="请输入手机号"
                    />
                  </div>
                  <p className="text-xs text-olive-400 mt-2">
                    演示账号：13800138001-13800138005
                  </p>
                </div>
              ) : (
                <div className="mb-8 p-4 bg-olive-50 rounded-2xl border border-olive-100">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-olive-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-olive-800">管理员模式</p>
                      <p className="text-xs text-olive-500 mt-1 leading-relaxed">
                        以社区管理员身份登录，可审核预约申请、查看使用记录、处理违规举报。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 group"
              >
                <span>{role === 'admin' ? '进入管理后台' : '登录系统'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-cream-200">
              <p className="text-center text-xs text-olive-400 text-center leading-relaxed">
                登录即表示您同意遵守《社区共享厨房使用规范》及《清洁承诺书》
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
