const Validate = {
  email: (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  URL: (url: string): boolean => /^(ftp|http|https):\/\/[^ "]+$/.test(url),
  phone: (phone: string): boolean => /^[0-9]+$/.test(phone),
  integer: (value: unknown): boolean =>
    typeof value === 'number' && Number.isInteger(value),
  positiveInteger: (value: unknown): boolean =>
    typeof value === 'number' && Number.isInteger(value) && value >= 0,
  string: (value: unknown): boolean =>
    typeof value === 'string' && value.trim() !== '',
  array: (value: unknown): boolean => Array.isArray(value) && value.length > 0,
  object: (value: unknown): boolean =>
    typeof value === 'object' &&
    value !== null &&
    Object.keys(value as object).length > 0,
  date: (date: string): boolean => !isNaN(Date.parse(date)),
  formatPhone: (phone: string): string => {
    const inputString = phone
      .split(' ')
      .join('')
      .split('+')
      .join('')
      .split('-')
      .join('')
      .split('(')
      .join('')
      .split(')')
      .join('');
    if (inputString.startsWith('009')) {
      return inputString.slice(3);
    } else if (inputString.startsWith('0')) {
      return '234' + inputString.slice(1);
    } else {
      return inputString;
    }
  },
};

export default Validate;
