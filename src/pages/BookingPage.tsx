import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChefHat,
  CookingPot,
  Sparkles,
  CalendarDays,
  Users,
  Wrench,
  Leaf,
  ShieldCheck,
  MessageSquarePlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { zones } from '@/data/zones';
import { getUpcomingDays, generateTimeSlots, addMinutes, getMinutesBetween, formatDateCN, getCurrentTime } from '@/utils/dateTime';
import { canBook, getPermissionDescription, getPermissionColor } from '@/utils/credit';
import type { KitchenZone } from '@/types';

const zoneIconMap: Record<string, typeof ChefHat> = {
  baking: ChefHat,
  cooking: CookingPot,
  cleaning: Sparkles,
};

export const BookingPage = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const createBooking = useBookingStore((s) => s.createBooking);
  const getBookingsByZoneAndDate = useBookingStore((s) => s.getBookingsByZoneAndDate);

  const [step, setStep] = useState(1);
  const [selectedZone, setSelectedZone] = useState<KitchenZone | null>(null);
  const [selectedDate, setSelectedDate] = useState(getUpcomingDays(7)[0].date);
  const [startTime, setStartTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [peopleCount, setPeopleCount] = useState(2);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState('');
  const [cleanPromise, setCleanPromise] = useState(false);
  const [remarks, setRemarks] = useState('');

  const days = getUpcomingDays(7);
  const currentDay = getUpcomingDays(7)[0];
  const timeSlots = generateTimeSlots();
  const currentTimeStr = getCurrentTime();

  const zoneConfig = zones.find((z) => z.id === selectedZone);
  const endTime = startTime ? addMinutes(startTime, duration) : '';

  const bookedSlots = useMemo(() => {
    if (!selectedZone) return new Set<string>();
    const bookings = getBookingsByZoneAndDate(selectedZone, selectedDate);
    const booked = new Set<string>();
    bookings.forEach((b) => {
      for (
        let t = b.startTime;
        getMinutesBetween(t, b.endTime) > 0;
        t = addMinutes(t, 30)
      ) {
        booked.add(t);
      }
    });
    return booked;
  }, [selectedZone, selectedDate, getBookingsByZoneAndDate]);

  const isSlotDisabled = (time: string, isToday: boolean): boolean => {
    if (bookedSlots.has(time)) return true;
    if (isToday && time <= currentTimeStr) return true;
    if (startTime) {
      const selectedEnd = addMinutes(startTime, duration);
      if (time >= startTime && time < selectedEnd) return false;
    }
    return false;
  };

  const getAvailableEndTime = (start: string): string => {
    let t = start;
    let maxEnd = '22:00';
    for (let i = 0; i < 28; i++) {
      const next = addMinutes(start, (i + 1) * 30);
      if (bookedSlots.has(addMinutes(start, i * 30)) || next > maxEnd) {
        return addMinutes(start, i * 30);
      }
    }
    return maxEnd;
  };

  const canProceedToStep2 = selectedZone !== null;
  const canProceedToStep3 = startTime !== '' && duration >= 30 && peopleCount >= 1;
  const canSubmit =
    selectedEquipment.length > 0 &&
    ingredients.trim().length > 0 &&
    cleanPromise &&
    currentUser !== null &&
    canBook(currentUser.permissionLevel);

  const handleZoneSelect = (zoneId: KitchenZone) => {
    setSelectedZone(zoneId);
    const z = zones.find((z) => z.id === zoneId);
    if (z) {
      setSelectedEquipment([]);
      setPeopleCount(Math.min(peopleCount, z.capacity));
    }
    setStartTime('');
  };

  const handleStartTimeSelect = (time: string) => {
    setStartTime(time);
    const maxPossible = Math.min(180, getMinutesBetween(time, getAvailableEndTime(time)));
    if (duration > maxPossible) {
      setDuration(Math.max(30, maxPossible));
    }
  };

  const toggleEquipment = (equip: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(equip) ? prev.filter((e) => e !== equip) : [...prev, equip]
    );
  };

  const handleSubmit = () => {
    if (!selectedZone || !startTime || !currentUser) return;

    createBooking({
      userId: currentUser.id,
      zone: selectedZone,
      date: selectedDate,
      startTime,
      endTime: endTime,
      peopleCount,
      equipment: selectedEquipment,
      ingredients,
      cleanPromise,
      remarks,
    });

    navigate('/my-bookings');
  };

  const restricted = currentUser && !canBook(currentUser.permissionLevel);

  return (
    <div className="page-container">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-olive-800 mb-2">
          预约共享厨房
        </h1>
        <p className="text-olive-600">按步骤填写预约信息，管理员审核通过后即可使用</p>
      </div>

      {restricted && (
        <div className={`mb-6 p-4 rounded-2xl border animate-fade-in-up ${getPermissionColor(currentUser.permissionLevel)}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">预约受限</p>
              <p className="text-sm mt-1 opacity-80">
                {getPermissionDescription(currentUser.permissionLevel)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2">
          {[
            { num: 1, label: '选择区域' },
            { num: 2, label: '选择时段' },
            { num: 3, label: '填写详情' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  step >= s.num
                    ? 'bg-olive-600 text-white shadow-md'
                    : 'bg-white border border-cream-200 text-olive-400'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step >= s.num ? 'bg-white/20' : 'bg-cream-100'
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {s.num < 3 && (
                <div
                  className={`w-8 md:w-16 h-0.5 rounded-full ${
                    step > s.num ? 'bg-olive-400' : 'bg-cream-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="animate-fade-in-up">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-terracotta-500" />
            第一步：选择厨房区域
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {zones.map((zone) => {
              const Icon = zoneIconMap[zone.id];
              const isSelected = selectedZone === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => handleZoneSelect(zone.id)}
                  className={`card card-hover p-0 overflow-hidden text-left transition-all duration-300 ${
                    isSelected
                      ? 'ring-2 ring-terracotta-500 -translate-y-1 shadow-card-hover'
                      : ''
                  }`}
                >
                  <div className={`h-36 bg-gradient-to-br ${zone.gradient} p-5 relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-25">
                      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/30 blur-3xl" />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      {isSelected && (
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                      )}
                    </div>
                    <h3 className="relative z-10 text-white text-2xl font-serif font-bold mt-5">
                      {zone.name}
                    </h3>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-olive-600 mb-4 leading-relaxed">
                      {zone.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-olive-700 mb-3">
                      <Users className="w-4 h-4 text-olive-500" />
                      最多容纳 <span className="font-semibold">{zone.capacity}</span> 人
                    </div>
                    <div>
                      <p className="text-xs text-olive-500 mb-2">配备设备：</p>
                      <div className="flex flex-wrap gap-1.5">
                        {zone.equipment.slice(0, 4).map((e) => (
                          <span
                            key={e}
                            className="px-2 py-1 rounded-lg bg-cream-100 text-olive-700 text-xs"
                          >
                            {e}
                          </span>
                        ))}
                        {zone.equipment.length > 4 && (
                          <span className="px-2 py-1 rounded-lg bg-cream-100 text-olive-500 text-xs">
                            +{zone.equipment.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedToStep2 || restricted}
              className="btn-primary flex items-center gap-2"
            >
              下一步：选择时段
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-terracotta-500" />
              第二步：选择使用时段
            </h2>
            {zoneConfig && (
              <span className="badge bg-olive-50 text-olive-700 border border-olive-100">
                {zoneConfig.name}
              </span>
            )}
          </div>

          <div className="card p-5 md:p-6 mb-6">
            <p className="label-text">选择日期</p>
            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {days.map((d) => {
                const isSelected = selectedDate === d.date;
                const isToday = d.date === currentDay.date;
                return (
                  <button
                    key={d.date}
                    onClick={() => {
                      setSelectedDate(d.date);
                      setStartTime('');
                    }}
                    className={`p-2 md:p-4 rounded-xl text-center transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-olive-500 to-olive-600 text-white shadow-md'
                        : 'bg-cream-50 hover:bg-cream-100 text-olive-700'
                    }`}
                  >
                    <p className={`text-xs ${isSelected ? 'text-olive-100' : 'text-olive-500'}`}>
                      {d.label}
                    </p>
                    <p className={`text-xl md:text-2xl font-bold mt-1 ${isSelected ? '' : 'font-serif'}`}>
                      {d.day}
                    </p>
                    <p className={`text-xs mt-1 ${isSelected ? 'text-olive-100' : 'text-olive-400'}`}>
                      {d.weekday}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card p-5 md:p-6 mb-6">
            <p className="label-text flex items-center gap-2">
              <Clock className="w-4 h-4" />
              选择开始时间
              <span className="text-olive-400 font-normal ml-1">
                （{formatDateCN(selectedDate)}，灰色为不可用）
              </span>
            </p>
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {timeSlots.map((slot) => {
                const isToday = selectedDate === currentDay.date;
                const disabled = isSlotDisabled(slot.time, isToday);
                const isSelected = startTime === slot.time;
                const isInRange =
                  startTime &&
                  slot.time > startTime &&
                  getMinutesBetween(startTime, slot.time) < duration;

                return (
                  <button
                    key={slot.time}
                    onClick={() => !disabled && handleStartTimeSelect(slot.time)}
                    disabled={disabled}
                    className={`py-2.5 px-1 rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-terracotta-500 text-white shadow-md'
                        : isInRange
                        ? 'bg-terracotta-100 text-terracotta-700'
                        : disabled
                        ? 'bg-cream-50 text-cream-300 cursor-not-allowed line-through'
                        : 'bg-cream-100 text-olive-700 hover:bg-olive-100'
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="card p-5 md:p-6">
              <p className="label-text">使用时长</p>
              <div className="grid grid-cols-4 gap-2">
                {[30, 60, 90, 120, 150, 180].map((mins) => {
                  const maxPossible = startTime
                    ? Math.min(180, getMinutesBetween(startTime, getAvailableEndTime(startTime)))
                    : 180;
                  const disabled = mins > maxPossible;
                  return (
                    <button
                      key={mins}
                      onClick={() => setDuration(mins)}
                      disabled={disabled || !startTime}
                      className={`py-3 rounded-xl text-sm font-medium transition-all ${
                        duration === mins
                          ? 'bg-olive-600 text-white shadow-md'
                          : disabled
                          ? 'bg-cream-50 text-cream-300 cursor-not-allowed'
                          : 'bg-cream-100 text-olive-700 hover:bg-olive-100'
                      }`}
                    >
                      {mins < 60 ? `${mins}分钟` : `${mins / 60}小时`}
                    </button>
                  );
                })}
              </div>
              {startTime && (
                <p className="mt-4 p-3 rounded-xl bg-olive-50 text-sm text-olive-700">
                  时间段：<span className="font-semibold">{startTime}</span> -{' '}
                  <span className="font-semibold">{endTime}</span>
                  ，共 {getMinutesBetween(startTime, endTime)} 分钟
                </p>
              )}
            </div>

            <div className="card p-5 md:p-6">
              <p className="label-text">使用人数</p>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setPeopleCount((p) => Math.max(1, p - 1))}
                  className="w-12 h-12 rounded-xl bg-cream-100 hover:bg-cream-200 text-olive-700 text-2xl font-bold transition-colors"
                >
                  −
                </button>
                <div className="flex-1 text-center">
                  <Users className="w-5 h-5 text-olive-500 mx-auto mb-1" />
                  <p className="text-4xl font-serif font-bold text-olive-800">
                    {peopleCount}
                  </p>
                  <p className="text-xs text-olive-500">
                    人 · 区域上限 {zoneConfig?.capacity || 0} 人
                  </p>
                </div>
                <button
                  onClick={() =>
                    setPeopleCount((p) => Math.min(zoneConfig?.capacity || 8, p + 1))
                  }
                  className="w-12 h-12 rounded-xl bg-cream-100 hover:bg-cream-200 text-olive-700 text-2xl font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setStep(1)}
              className="btn-outline flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              上一步
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canProceedToStep2 || !canProceedToStep3}
              className="btn-primary flex items-center gap-2"
            >
              下一步：填写详情
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in-up">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-terracotta-500" />
            第三步：填写预约详情
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-5 md:p-6">
                <p className="label-text flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  需要使用的设备
                  <span className="text-rose-500">*</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {zoneConfig?.equipment.map((equip) => {
                    const checked = selectedEquipment.includes(equip);
                    return (
                      <label
                        key={equip}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                          checked
                            ? 'bg-olive-50 border-olive-400'
                            : 'bg-white border-cream-200 hover:border-cream-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                            checked
                              ? 'bg-olive-500 border-olive-500'
                              : 'border-cream-300'
                          }`}
                        >
                          {checked && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEquipment(equip)}
                          className="sr-only"
                        />
                        <span className={`text-sm ${checked ? 'font-medium text-olive-800' : 'text-olive-600'}`}>
                          {equip}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="card p-5 md:p-6">
                <p className="label-text flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  计划使用的食材
                  <span className="text-rose-500">*</span>
                </p>
                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="请列出主要食材名称和大致用量，如：鸡蛋10个、牛奶1L、草莓500g..."
                />
                <p className="text-xs text-olive-400 mt-2">
                  食材清单有助于管理员评估安全性和设备需求
                </p>
              </div>

              <div className="card p-5 md:p-6">
                <p className="label-text flex items-center gap-2">
                  <MessageSquarePlus className="w-4 h-4" />
                  备注说明（可选）
                </p>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="如有特殊需求请在此说明..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-5 md:p-6 bg-gradient-to-br from-cream-50 to-white">
                <h3 className="font-serif text-lg font-semibold text-olive-800 mb-4">预约摘要</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-olive-500">区域</dt>
                    <dd className="font-medium text-olive-800">{zoneConfig?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-olive-500">日期</dt>
                    <dd className="font-medium text-olive-800">{formatDateCN(selectedDate)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-olive-500">时段</dt>
                    <dd className="font-medium text-olive-800">
                      {startTime} - {endTime}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-olive-500">人数</dt>
                    <dd className="font-medium text-olive-800">{peopleCount} 人</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-olive-500">设备数</dt>
                    <dd className="font-medium text-olive-800">{selectedEquipment.length} 项</dd>
                  </div>
                </dl>
              </div>

              <div className="card p-5 md:p-6 bg-gradient-to-br from-terracotta-50 to-cream-50 border-terracotta-100">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      cleanPromise
                        ? 'bg-terracotta-500 border-terracotta-500'
                        : 'border-cream-300 group-hover:border-terracotta-400'
                    }`}
                  >
                    {cleanPromise && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={cleanPromise}
                    onChange={(e) => setCleanPromise(e.target.checked)}
                    className="sr-only"
                  />
                  <div>
                    <p className="font-semibold text-olive-800 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-terracotta-500" />
                      清洁承诺书
                      <span className="text-rose-500">*</span>
                    </p>
                    <p className="text-xs text-olive-600 mt-1.5 leading-relaxed">
                      我承诺使用完毕后清洁所有使用过的台面、设备和餐具，
                      将垃圾分类处理并归位所有物品。
                      如未按要求完成清洁，愿意接受违规记录和信用分扣除处理。
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={() => setStep(2)}
              className="btn-outline flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              上一步
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="btn-primary px-8 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              提交预约申请
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
