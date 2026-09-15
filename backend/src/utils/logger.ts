/* Logger utility with clean structured formatting */

export const logger = {
  info: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[36m[INFO]\x1b[0m [${timestamp}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`\x1b[33m[WARN]\x1b[0m [${timestamp}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`\x1b[31m[ERROR]\x1b[0m [${timestamp}] ${message}`, error ? error : '');
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.log(`\x1b[35m[DEBUG]\x1b[0m [${timestamp}] ${message}`, meta ? JSON.stringify(meta) : '');
    }
  },
  sms: (phone: string, message: string) => {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[32m[SMS GATEWAY MOCK]\x1b[0m [${timestamp}] To: ${phone} | Content: "${message}"`);
  },
  push: (target: string, title: string, body: string) => {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[34m[PUSH NOTIFICATION MOCK]\x1b[0m [${timestamp}] To: ${target} | Title: "${title}" | Body: "${body}"`);
  }
};
