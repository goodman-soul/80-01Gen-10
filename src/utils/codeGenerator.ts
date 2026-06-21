export const generateAccessCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateId = (prefix = ''): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`;
};

export const hashCode = (code: string, timestamp: string): string => {
  let hash = 0;
  const str = code + timestamp;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().slice(0, 8);
};
