const DEFAULT_LOCALE = 'en-US';

const createFormatter = (options) => (date) => 
  new Date(date).toLocaleString(DEFAULT_LOCALE, options);

export const formatDate = createFormatter({
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const formatTime = createFormatter({
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
});

export const formatDateTime = createFormatter({
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
});

export const getDateDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

export const getDayName = createFormatter({ weekday: 'short' });