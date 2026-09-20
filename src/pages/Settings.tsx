import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  DollarSign,
  Percent,
  MapPin,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Sparkles
} from 'lucide-react';
import { AdminService } from '../api/adminService';
import { PlatformSettingDto } from '../types';
import { useNotifications } from '../context/NotificationContext';

export const Settings: React.FC = () => {
  const [settingsList, setSettingsList] = useState<PlatformSettingDto[]>([]);
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const { addNotification } = useNotifications();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getSettings();
      setSettingsList(data);
      const map: Record<string, string> = {};
      data.forEach((s) => {
        map[s.key] = s.value;
      });
      setSettingsMap(map);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'فشل تحميل الإعدادات من السيرفر',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSetting = async (key: string) => {
    try {
      setSavingKey(key);
      const val = settingsMap[key] || '';
      await AdminService.updateSetting(key, val);
      addNotification({
        type: 'success',
        title: 'تم التحديث بنجاح',
        message: `تم تحديث قيمة الإعداد (${key}) على السيرفر الحي بنجاح.`,
      });
      fetchSettings();
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'فشل حفظ الإعداد على السيرفر',
      });
    } finally {
      setSavingKey(null);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettingsMap((prev) => ({ ...prev, [key]: value }));
  };

  const getArabicDescription = (key: string, defaultDesc?: string | null): string => {
    switch (key) {
      case 'BaseFareEgp':
        return 'فتحة العداد / الأجرة الأساسية عند بدء الرحلة بالجنيه';
      case 'PricePerKmEgp':
        return 'سعر الكيلومتر الواحد في الرحلة بالجنيه';
      case 'MinimumFareEgp':
        return 'الحد الأدنى لقيمة أي مشوار بالجنيه';
      case 'CancellationFeeEgp':
        return 'رسوم إلغاء الرحلة بعد قبول الكابتن بالجنيه';
      case 'DefaultCommissionRate':
        return 'نسبة عمولة منصة ركوب (مثال: 0.08 تعني 8%)';
      case 'DriverMatchingRadiusKm':
        return 'نصف قطر البحث عن الكباتن المتاحين بالكيلومتر';
      case 'RideOfferTimeoutSeconds':
        return 'مهلة قبول عرض السعر بالثواني';
      case 'NightFareMultiplier':
        return 'مضاعف الأجرة الليلية (مثال: 1.15)';
      case 'MaxTripDistanceKm':
        return 'أقصى مسافة مسموح بها للرحلة بالكيلومتر';
      case 'SupportPhone':
        return 'رقم هاتف الدعم الفني وخدمة العملاء';
      case 'SupportWhatsApp':
        return 'رقم الواتساب الرسمي للدعم';
      default:
        return defaultDesc || key;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-rukoob-forest dark:border-rukoob-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cairo text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-7 h-7 text-rukoob-forest-light dark:text-rukoob-gold" />
            إعدادات المنصة وقواعد التسعير الحية
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            تعديل فوري ومباشر لقواعد التسعير والعمولات المخزنة في قاعدة بيانات السيرفر
          </p>
        </div>
        <button
          onClick={fetchSettings}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-rukoob-forest/40 hover:bg-slate-200 dark:hover:bg-rukoob-forest text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-rukoob-forest/60 transition-colors flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث الإعدادات</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
        {settingsList.map((setting) => (
          <div
            key={setting.key}
            className="card-glass p-5 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-rukoob-forest-light dark:text-rukoob-gold bg-slate-100 dark:bg-rukoob-forest/30 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-rukoob-forest/40">
                  {setting.key}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(setting.updatedAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-bold mb-3 leading-relaxed">
                {getArabicDescription(setting.key, setting.description)}
              </p>

              <div className="relative">
                <input
                  type="text"
                  value={settingsMap[setting.key] ?? setting.value}
                  onChange={(e) => handleChange(setting.key, e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-white rounded-xl placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold font-bold font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-slate-800/60">
              <button
                disabled={savingKey === setting.key}
                onClick={() => handleUpdateSetting(setting.key)}
                className="px-4 py-2 rounded-xl bg-rukoob-forest dark:bg-rukoob-gold hover:bg-rukoob-forest-light dark:hover:bg-rukoob-gold-light text-white dark:text-rukoob-dark font-bold text-xs flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingKey === setting.key ? 'جاري الحفظ...' : 'حفظ القيمة بالسيرفر'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
