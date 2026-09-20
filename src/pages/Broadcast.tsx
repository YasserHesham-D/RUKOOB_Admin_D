import React, { useState } from 'react';
import {
  BellRing,
  Send,
  Users,
  Car,
  Globe,
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AdminService } from '../api/adminService';
import { useNotifications } from '../context/NotificationContext';

export const Broadcast: React.FC = () => {
  const [targetAudience, setTargetAudience] = useState<'all' | 'drivers' | 'passengers'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { addNotification } = useNotifications();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      setSubmitting(true);
      const count = await AdminService.broadcastNotification(title, message, targetAudience);
      addNotification({
        type: 'success',
        title: 'تم إرسال الإشعار الجماعي بنجاح',
        message: `تم إرسال الإشعار الجماعي لـ ${count} مستخدم عبر سيرفر ركوب.`,
      });
      setTitle('');
      setMessage('');
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'فشل إرسال الإشعار الجماعي',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const audienceOptions = [
    { id: 'all', label: 'جميع المستخدمين', desc: 'كل الكباتن والركاب المسجلين في أسوان', icon: Globe },
    { id: 'drivers', label: 'كباتن ركوب فقط', desc: 'جميع سائقي السيارات والتوكتوك المعتمدين', icon: Car },
    { id: 'passengers', label: 'الركاب والعملاء', desc: 'جميع العملاء المسجلين في التطبيق', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cairo text-slate-900 dark:text-white flex items-center gap-2">
            <BellRing className="w-7 h-7 text-rukoob-forest-light dark:text-rukoob-gold" />
            مركز الإشعارات الجماعية (Broadcast)
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            إرسال إشعارات فورية مباشرة (Push Notifications) لهواتف الكباتن والركاب
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Composer Form Card */}
        <div className="lg:col-span-7 card-glass p-6 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-cairo">
            إنشاء إشعار جماعي فوري
          </h2>

          <form onSubmit={handleSend} className="space-y-5">
            {/* Target Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                الفئة المستهدفة بالإشعار:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {audienceOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = targetAudience === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTargetAudience(opt.id as any)}
                      className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between space-y-1.5 ${
                        isSelected
                          ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark border-rukoob-forest dark:border-rukoob-gold shadow-md'
                          : 'bg-slate-50 dark:bg-rukoob-darker/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-slate-400 dark:hover:border-rukoob-forest'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white dark:text-rukoob-dark' : 'text-rukoob-forest-light dark:text-rukoob-gold'}`} />
                        {isSelected && <span className="text-[10px] font-bold">✓ محدد</span>}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-white dark:text-rukoob-dark' : 'text-slate-900 dark:text-white'}`}>
                          {opt.label}
                        </p>
                        <p className={`text-[10px] leading-tight mt-0.5 ${isSelected ? 'text-white/80 dark:text-rukoob-dark/80' : 'text-slate-500 dark:text-slate-400'}`}>
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                عنوان الإشعار
              </label>
              <input
                type="text"
                required
                placeholder="مثال: خصم 20% على مشاوير اليوم في أسوان!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-white rounded-xl placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold font-medium"
              />
            </div>

            {/* Notification Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                نص الرسالة
              </label>
              <textarea
                rows={4}
                required
                placeholder="اكتب نص الإشعار بالتفصيل هنا..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-white rounded-xl placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold font-medium leading-relaxed"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={submitting || !title.trim() || !message.trim()}
              className="w-full py-3 rounded-xl bg-rukoob-forest dark:bg-rukoob-gold hover:bg-rukoob-forest-light dark:hover:bg-rukoob-gold-light text-white dark:text-rukoob-dark font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all duration-200 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'جاري الإرسال عبر السيرفر...' : 'إرسال الإشعار فورياً الآن'}</span>
            </button>
          </form>
        </div>

        {/* Live Smartphone Preview Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card-glass p-6 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-rukoob-forest-light dark:text-rukoob-gold" />
              <span>معاينة الإشعار على شاشة الهاتف</span>
            </h3>

            {/* Simulated Smartphone Lockscreen Notification */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2.5 shadow-xl">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-rukoob-gold text-rukoob-dark flex items-center justify-center font-bold text-[10px] font-outfit shadow-sm">
                    R
                  </div>
                  <span className="font-bold text-slate-100 font-cairo">تطبيق ركوب • RUKOOB</span>
                </div>
                <span className="font-mono text-[10px]">الآن</span>
              </div>

              <div>
                <p className="text-xs font-bold text-white leading-snug">
                  {title || 'عنوان الإشعار يظهر هنا للمستخدم'}
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                  {message || 'نص رسالة الإشعار والعروض الترويجية أو التنبيهات يظهر هنا...'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-rukoob-forest/10 border border-slate-200 dark:border-rukoob-forest/30 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              💡 يصل الإشعار لجميع الأجهزة النشطة في نفس اللحظة عبر خدمة الإشعارات اللحظية.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
