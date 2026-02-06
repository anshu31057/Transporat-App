export const getCurrentIsoDate = () => new Date().toISOString().slice(0, 10);

export const formatDisplayDate = (dateValue) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateValue));
