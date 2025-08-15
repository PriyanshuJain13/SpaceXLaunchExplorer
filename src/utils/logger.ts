export const logger = {
  info: (message: string, extra?: any) => {
    console.log(`[INFO] ${message}`, extra);
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  
  warn: (message: string, extra?: any) => {
    console.warn(`[WARN] ${message}`, extra);
  },
};