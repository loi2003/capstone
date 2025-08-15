import { useState } from "react";
import "./CheckupCalendar.css";

const CheckupCalendar = ({ reminders = [], appointments = [] }) => {
  const today = new Date();

  const [date, setDate] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]); // reminders + appointments

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "long" })
  );
  const years = Array.from(
    { length: 21 },
    (_, i) => today.getFullYear() - 10 + i
  );

  // --- Build reminders map ---
  const reminderDatesMap = {};
  reminders.forEach((r) => {
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    let current = new Date(start);
    while (current <= end) {
      const key = current.toDateString();
      if (!reminderDatesMap[key]) reminderDatesMap[key] = [];
      let rangeType =
        key === start.toDateString()
          ? "start"
          : key === end.toDateString()
          ? "end"
          : "middle";
      reminderDatesMap[key].push({ ...r, rangeType, itemType: "reminder" });
      current.setDate(current.getDate() + 1);
    }
  });

  // --- Build appointments map ---
  const appointmentDatesMap = {};
  appointments.forEach((a) => {
    // Try multiple possible field names
    const start = a.start || a.startDate || a.date;
    const dateKey = new Date(start).toDateString();

    if (!appointmentDatesMap[dateKey]) {
      appointmentDatesMap[dateKey] = [];
    }

    appointmentDatesMap[dateKey].push({
      ...a,
      start: new Date(start),
      end: a.end ? new Date(a.end) : null,
      itemType: "appointment",
    });
  });

  const daysInMonth = new Date(date.year, date.month + 1, 0).getDate();
  const firstDay = new Date(date.year, date.month, 1).getDay();

  const handleDayClick = (dateObj, isCurrentMonth) => {
    if (!isCurrentMonth) return;
    const key = dateObj.toDateString();
    if (selectedDay === key) {
      setSelectedDay(null);
      setSelectedItems([]);
    } else {
      setSelectedDay(key);
      const items = [
        ...(reminderDatesMap[key] || []),
        ...(appointmentDatesMap[key] || []),
      ];
      setSelectedItems(items);
    }
  };

  const goToToday = () => {
    setDate({ month: today.getMonth(), year: today.getFullYear() });
    setSelectedDay(null);
    setSelectedItems([]);
  };

  const goToNextMonth = () => {
    setDate(({ month, year }) =>
      month === 11 ? { month: 0, year: year + 1 } : { month: month + 1, year }
    );
    setSelectedDay(null);
    setSelectedItems([]);
  };

  const goToPrevMonth = () => {
    setDate(({ month, year }) =>
      month === 0 ? { month: 11, year: year - 1 } : { month: month - 1, year }
    );
    setSelectedDay(null);
    setSelectedItems([]);
  };

  const renderDays = () => {
    const cells = [];

    // Prev month tail
    const prevMonthDays = new Date(date.year, date.month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push(
        <div key={`prev-${i}`} className="calendar-day outside-month">
          {prevMonthDays - i}
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(date.year, date.month, day);
      const dateKey = dateObj.toDateString();

      const isToday = dateKey === today.toDateString();
      const isSelected = selectedDay === dateKey;
      const hasAppointment = !!appointmentDatesMap[dateKey];
      const remindersForDay = reminderDatesMap[dateKey];

      let reminderClass = "";
      if (remindersForDay?.length) {
        if (remindersForDay.some((r) => r.rangeType === "start"))
          reminderClass = "reminder-start";
        else if (remindersForDay.some((r) => r.rangeType === "end"))
          reminderClass = "reminder-end";
        else reminderClass = "reminder-middle";

        if (remindersForDay.some((r) => r.type === "urgent"))
          reminderClass += " urgent";
        else if (remindersForDay.some((r) => r.type === "recommended"))
          reminderClass += " recommended";

        if (remindersForDay.length > 1) reminderClass += " multiple";
      }

      const classes = [
        "calendar-day",
        isSelected && "selected",
        isToday && "today",
        hasAppointment && "appointment-highlight",
        reminderClass,
      ]
        .filter(Boolean)
        .join(" ");

      cells.push(
        <div
          key={dateKey}
          className={classes}
          onClick={() => handleDayClick(dateObj, true)}
        >
          {day}
        </div>
      );
    }

    // Next month leading days
    const totalCells = firstDay + daysInMonth;
    const nextMonthDays = 7 - (totalCells % 7);
    if (nextMonthDays < 7) {
      for (let i = 1; i <= nextMonthDays; i++) {
        cells.push(
          <div key={`next-${i}`} className="calendar-day outside-month">
            {i}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="checkup-calendar">
      <div className="calendar-header">
        <div className="calendar-controller-header">
          <button onClick={goToPrevMonth}>◀ Prev</button>
          <select
            value={date.month}
            onChange={(e) =>
              setDate({ ...date, month: parseInt(e.target.value) })
            }
          >
            {months.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={date.year}
            onChange={(e) =>
              setDate({ ...date, year: parseInt(e.target.value) })
            }
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button onClick={goToNextMonth}>Next ▶</button>
        </div>
        <button onClick={goToToday} className="today-calendar-btn">
          Back to Current Week
        </button>
      </div>

      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="calendar-day-name">
            {d}
          </div>
        ))}
        {renderDays()}
      </div>

      <div className="calendar-instruction">
        <span className="instruction today">● Today</span>
        <span className="instruction appointment-highlight">
          ● Upcoming Appointment
        </span>
        <span className="instruction recommended">● Recommended Checkup</span>
        <span className="instruction urgent">● Urgent</span>
      </div>

      {selectedItems.length > 0 && (
        <div className="reminder-details">
          {selectedItems.map((item, idx) => {
            let cardClass = "reminder-item";
            if (item.itemType === "reminder") {
              cardClass += item.type === "urgent" ? " urgent" : " recommended";
            } else if (item.itemType === "appointment") {
              cardClass += " appointment";
            }

            return (
              <div key={idx} className={cardClass}>
                {item.itemType === "appointment" ? (
                  <>
                    <h5>Appointment: {item.name || item.type}</h5>

                    {item.start && (
                      <div className="reminder-datetime">
                        {item.start.toLocaleDateString("en-GB")}{" "}
                        {item.start.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {item.end &&
                          ` - ${item.end.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`}
                      </div>
                    )}

                    {item.doctor && (
                      <div className="reminder-doctor">
                        with Dr. {item.doctor}
                      </div>
                    )}
                    {item.address && (
                      <div className="reminder-address">At: {item.address}</div>
                    )}
                    {item.note && (
                      <div className="reminder-note">Notes: {item.note}</div>
                    )}
                  </>
                ) : (
                  <>
                    <h5>{item.title}</h5>
                    <div className="reminder-dates">
                      {new Date(item.startDate).toLocaleDateString("en-GB")} -{" "}
                      {new Date(item.endDate).toLocaleDateString("en-GB")}
                    </div>
                    {item.note && (
                      <div className="reminder-note">{item.note}</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CheckupCalendar;
