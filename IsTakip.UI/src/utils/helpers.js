export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("tr-TR");

export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const generateDays = (startStr, endStr) => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const dateArray = [];
  while (start <= end) {
    dateArray.push(new Date(start));
    start.setDate(start.getDate() + 1);
  }
  return dateArray;
};
