export type ExpType = `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y'}`;

export const convertExpToSecond = (exp: ExpType): number => {
  switch (exp[exp.length - 1]) {
    case 's':
      return Number(exp.substring(0, exp.length - 1));
    case 'm':
      return Number(exp.substring(0, exp.length - 1)) * 60;
    case 'd':
      return Number(exp.substring(0, exp.length - 1)) * 60 * 60 * 24;
    case 'w':
      return Number(exp.substring(0, exp.length - 1)) * 60 * 60 * 24 * 7;
    case 'M':
      return Number(exp.substring(0, exp.length - 1)) * 60 * 60 * 24 * 30;
    case 'y':
      return Number(exp.substring(0, exp.length - 1)) * 60 * 60 * 24 * 365;
    default:
      throw new Error('Expected exp to be ExpType');
  }
};
