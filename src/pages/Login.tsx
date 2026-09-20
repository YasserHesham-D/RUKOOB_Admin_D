import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  Headphones,
  SlidersHorizontal,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { RukoobLogo } from '../assets/logo';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('superadmin@rukoob.com');
  const [password, setPassword] = useState('SuperAdmin@2026!');
  const [selectedRole, setSelectedRole] = useState<Role>('SuperAdmin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleQuickSelect = (role: Role, defaultEmail: string, defaultPass: string) => {
    setSelectedRole(role);
    setEmail(defaultEmail);
    setPassword(defaultPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const targetRoute = await login(email, password, selectedRole);
      navigate(targetRoute, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات والمحاولة مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#080C0A] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-cairo select-none">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-rukoob-forest/10 dark:bg-rukoob-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rukoob-forest/10 dark:bg-rukoob-forest/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <RukoobLogo size="lg" showText={true} />
          </div>
          <h1 className="text-2xl font-bold font-cairo text-slate-900 dark:text-white">
            لوحة تحكم إدارة ركوب
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            المنظومة المركزية لإدارة الكباتن والرحلات والدعم الفني
          </p>
        </div>

        {/* Role Quick Selector Cards */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 text-center">
            اختر نوع الحساب وصلاحيات الدخول المعتمدة:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleRoleQuickSelect('SuperAdmin', 'superadmin@rukoob.com', 'SuperAdmin@2026!')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                selectedRole === 'SuperAdmin'
                  ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark border-rukoob-forest dark:border-rukoob-gold shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-rukoob-dark/70 border-slate-200 dark:border-rukoob-forest/40 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-rukoob-gold/60'
              }`}
            >
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold">مدير عام</span>
              <span className="text-[10px] opacity-80 font-mono">Super Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleQuickSelect('OpsAdmin', 'ops@rukoob.com', 'Operations@2026!')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                selectedRole === 'OpsAdmin'
                  ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark border-rukoob-forest dark:border-rukoob-gold shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-rukoob-dark/70 border-slate-200 dark:border-rukoob-forest/40 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-rukoob-gold/60'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold">عمليات</span>
              <span className="text-[10px] opacity-80 font-mono">Operations</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleQuickSelect('SupportAgent', 'support@rukoob.com', 'Support@2026!')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                selectedRole === 'SupportAgent'
                  ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark border-rukoob-forest dark:border-rukoob-gold shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-rukoob-dark/70 border-slate-200 dark:border-rukoob-forest/40 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-rukoob-gold/60'
              }`}
            >
              <Headphones className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold">دعم فني</span>
              <span className="text-[10px] opacity-80 font-mono">Support</span>
            </button>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-white dark:bg-[#0E1512] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 shadow-lg space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Phone Field */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                البريد الإلكتروني أو رقم الهاتف
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  dir="ltr"
                  required
                  placeholder="superadmin@rukoob.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-slate-900 dark:text-white rounded-xl text-xs font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pr-10 pl-10 py-2.5 bg-slate-50 dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-slate-900 dark:text-white rounded-xl text-xs font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-rukoob-forest dark:bg-rukoob-gold hover:bg-rukoob-forest-light dark:hover:bg-rukoob-gold-light text-white dark:text-rukoob-dark font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-200 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                <span>جاري التحقق من البيانات...</span>
              ) : (
                <>
                  <span>تسجيل الدخول إلى النظام</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-200 dark:border-rukoob-forest/30 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>اتصال مباشر ومؤمن مع خادم ركوب المركزي</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
