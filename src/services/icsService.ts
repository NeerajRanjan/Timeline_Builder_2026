import type { PlacedGoal} from '../types/types';
import { MONTHS } from '../types/types';


export const generateICS = (goals: PlacedGoal[], userName: string) => {
  let calendarContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//2026 Timeline Builder//EN",
    `X-WR-CALNAME:${userName}'s 2026 Goals`
  ];

  goals.forEach((goal) => {
    // Start date: 1st of the selected month in 2026
    const monthStr = (goal.monthIndex + 1).toString().padStart(2, '0');
    const startDate = `2026${monthStr}01T090000`;
    const endDate = `2026${monthStr}01T100000`; // 1 hour duration placeholder

    calendarContent.push(
      "BEGIN:VEVENT",
      `SUMMARY:Start Goal: ${goal.title}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `DESCRIPTION:${goal.suggestion || 'Kickoff your goal!'} Frequency: ${goal.frequency}`,
      "END:VEVENT"
    );
  });

  calendarContent.push("END:VCALENDAR");

  const blob = new Blob([calendarContent.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', '2026_goals.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};