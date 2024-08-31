import { startOfWeek, addDays, format } from 'date-fns';

export const processWeeklyVisitsData = (weeklyVisits) => {
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 });

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfCurrentWeek, i);
    const dayDiff = Math.floor((date - today) / (1000 * 60 * 60 * 24));
    let label;
    if (dayDiff === 0) {
      label = 'Today';
    } else if (dayDiff === -1) {
      label = 'Yesterday';
    } else {
      label = format(date, 'EEE');
    }
    return { date, label };
  });

  const processedData = last7Days.reduce((acc, { label }) => {
    acc[label] = {
      "PDL Visitor": 0,
      "Service Provider": 0,
      "Personnel": 0
    };
    return acc;
  }, {});

  weeklyVisits.forEach(visit => {
    const dayName = visit.name || visit.week_number; // Adjust based on actual property name
    const matchingDay = last7Days.find(day => day.label === dayName);
    if (matchingDay) {
      processedData[matchingDay.label]["PDL Visitor"] = visit["PDL Visitor"] || 0;
      processedData[matchingDay.label]["Service Provider"] = visit["Service Provider"] || 0;
      processedData[matchingDay.label]["Personnel"] = visit["Personnel"] || 0;
    }
  });

  return last7Days.map(({ label }) => ({
    name: label,
    "PDL Visitor": processedData[label]["PDL Visitor"],
    "Service Provider": processedData[label]["Service Provider"],
    "Personnel": processedData[label]["Personnel"]
  }));
};