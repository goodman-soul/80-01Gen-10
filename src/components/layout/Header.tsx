import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ChefHat,
  Home,
  CalendarPlus,
  ListChecks,
  ShieldAlert,
  LogOut,
  User,
  Menu,
  X,
  FileCheck,
  ClipboardList,
  AlertOctagon,
  Shuffle,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { permissionLevelConfig } from '@/components/ui/statusConfig';
import { useBookingStore } from '@/store/bookingStore';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, switchRole } = useAuthStore();
  const addNotification = useBookingStore((s) => s.addNotification);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRoleClick = () => {
    if (!currentUser) return;
    if (currentUser.role === 'admin') {
      switchRole();
      setMobileMenuOpen(false);
      addNotification('info', '已切换为居民视图');
    } else {
      setShowPasswordModal(true);
      setPassword('');
      setPasswordError('');
    }
  };

  const handleConfirmSwitch = () => {
    const success = switchRole(password);
    if (success) {
      setShowPasswordModal(false);
      setMobileMenuOpen(false);
      addNotification('success', '已切换为管理员视图');
    } else {
      setPasswordError('密码错误，请重试');
    }
  };

  const residentLinks = [
    { to: '/', label: '首页', icon: Home },
    { to: '/booking', label: '预约时段', icon: CalendarPlus },
    { to: '/my-bookings', label: '我的预约', icon: ListChecks },
    { to: '/violations', label: '违规记录', icon: ShieldAlert },
  ];

  const adminLinks = [
    { to: '/', label: '总览', icon: Home },
    { to: '/admin/review', label: '预约审核', icon: FileCheck },
    { to: '/admin/bookings', label: '预约总览', icon: ClipboardList },
    { to: '/admin/violations', label: '违规管理', icon: AlertOctagon },
  ];

  const links = currentUser?.role === 'admin' ? adminLinks : residentLinks;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-cream-200 shadow-soft">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl-2 bg-gradient-to-br from-olive-500 to-terracotta-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg md:text-xl font-semibold text-olive-800 leading-tight">
                  共享厨房
                </span>
                <span className="text-xs text-olive-500 hidden sm:block">Community Kitchen</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-olive-50 text-olive-700 shadow-sm'
                        : 'text-olive-600 hover:text-olive-800 hover:bg-cream-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 md:gap-3">
              {currentUser && (
                <button
                  onClick={handleSwitchRoleClick}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-olive-600 hover:text-olive-800 hover:bg-cream-100 transition-colors"
                  title={currentUser.role === 'admin' ? '切换为居民视图' : '切换为管理员视图（需密码）'}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">
                    {currentUser.role === 'admin' ? '居民视图' : '管理员视图'}
                  </span>
                </button>
              )}

              {currentUser && (
                <div className="hidden md:flex items-center gap-3 pl-3 border-l border-cream-200">
                  <div className="text-right">
                    <div className="text-sm font-medium text-olive-800 flex items-center gap-2 justify-end">
                      <User className="w-4 h-4 text-olive-500" />
                      {currentUser.name}
                      {currentUser.role === 'admin' && (
                        <span className="px-1.5 py-0.5 rounded bg-terracotta-100 text-terracotta-700 text-[10px] font-semibold">
                          管理员
                        </span>
                      )}
                    </div>
                    {currentUser.role === 'resident' && (
                      <div
                        className={`text-xs mt-0.5 px-2 py-0.5 rounded-full inline-block ${permissionLevelConfig[currentUser.permissionLevel].className}`}
                      >
                        {permissionLevelConfig[currentUser.permissionLevel].label}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl text-olive-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    title="退出登录"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}

              <button
                className="md:hidden p-2 rounded-xl text-olive-700 hover:bg-cream-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-cream-100 pt-4 animate-slide-in">
              <nav className="flex flex-col gap-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                        isActive
                          ? 'bg-olive-50 text-olive-700'
                          : 'text-olive-600 hover:bg-cream-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
                {currentUser && (
                  <>
                    <div className="h-px bg-cream-200 my-2" />
                    <div className="px-4 py-3 rounded-xl bg-cream-50">
                      <div className="flex items-center gap-2 font-medium text-olive-800">
                        <User className="w-5 h-5" />
                        {currentUser.name}
                        {currentUser.role === 'admin' && (
                          <span className="px-1.5 py-0.5 rounded bg-terracotta-100 text-terracotta-700 text-[10px] font-semibold">
                            管理员
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-olive-500 mt-1">
                        {currentUser.building} {currentUser.room}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSwitchRoleClick}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-olive-600 bg-cream-100"
                      >
                        <Shuffle className="w-4 h-4" />
                        切换角色
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-rose-600 bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        退出
                      </button>
                    </div>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-olive-900/50 backdrop-blur-sm animate-fade-in-up">
          <div className="card p-6 max-w-sm w-full animate-slide-in shadow-2xl">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-terracotta-100 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-terracotta-600" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-olive-800">
                  切换到管理员
                </h3>
                <p className="text-sm text-olive-500 mt-1">请输入管理员密码以继续</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="label-text">管理员密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmSwitch()}
                autoFocus
                className={`input-field ${passwordError ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''}`}
                placeholder="请输入管理员密码"
              />
              {passwordError && (
                <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {passwordError}
                </p>
              )}
              <p className="text-xs text-olive-400 mt-2">
                提示：演示密码为 <span className="font-mono font-semibold text-olive-600">admin123</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setPasswordError('');
                }}
                className="flex-1 btn-outline"
              >
                取消
              </button>
              <button
                onClick={handleConfirmSwitch}
                disabled={!password}
                className="flex-1 btn-secondary"
              >
                确认切换
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
