export const asyncHandler =
  (fn: (...args: any[]) => Promise<any>) =>
  (...args: any[]) => {
    const next = args[args.length - 1];
    return Promise.resolve(fn(...args)).catch(next);
  };

export const sanitizeInput = (value: string): string => value.trim().slice(0, 2000);
