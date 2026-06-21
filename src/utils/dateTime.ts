export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateCN = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

export const getWeekdayCN = (dateStr: string): string => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const date = new Date(dateStr);
  return weekdays[date.getDay()];
};

export const getUpcomingDays = (days: number): Array<{ date: string; label: string; weekday: string; day: number }> => {
  const result = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = formatDate(d.toISOString());
    result.push({
      date: dateStr,
      label: i === 0 ? '今天' : i === 1 ? '明天' : `${d.getMonth() + 1}/${d.getDate()}`,
      weekday: getWeekdayCN(dateStr),
      day: d.getDate(),
    });
  }
  return result;
};

export const generateTimeSlots = (): Array<{ time: string; label: string }> => {
  const slots = [];
  for (let hour = 8; hour <= 21; hour++) {
    slots.push({
      time: `${String(hour).padStart(2, '0')}:00`,
      label: `${String(hour).padStart(2, '0')}:00`,
    });
    slots.push({
      time: `${String(hour).padStart(2, '0')}:30`,
      label: `${String(hour).padStart(2, '0')}:30`,
    });
  }
  return slots;
};

export const getMinutesBetween = (startTime: string, endTime: string): number => {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
};

export const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

export const isTimeInRange = (checkTime: string, startTime: string, endTime: string): boolean => {
  return checkTime >= startTime && checkTime < endTime;
};

export const getCurrentTime = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const formatDateTimeCN = (isoStr: string): string => {
  const d = new Date(isoStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const getRelativeTime = (isoStr: string): string => {
  const now = new Date().getTime();
  const then = new Date(isoStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return formatDateTimeCN(isoStr);
};
