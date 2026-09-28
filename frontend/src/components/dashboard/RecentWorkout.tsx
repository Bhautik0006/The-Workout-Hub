const activity = [
  { day: "Mon", value: 70 },
  { day: "Tue", value: 45 },
  { day: "Wed", value: 85 },
  { day: "Thu", value: 55 },
  { day: "Fri", value: 95 },
  { day: "Sat", value: 40 },
  { day: "Sun", value: 65 },
];

export default function ActivityChart() {
  return (
    <div className="activity-card">
      <div className="section-header">
        <div>
          <h2>Weekly Activity</h2>
          <p>Your workout activity this week</p>
        </div>

        <select className="period-select">
          <option>This Week</option>
          <option>Last Week</option>
          <option>This Month</option>
        </select>
      </div>

      <div className="chart">
        {activity.map((item) => (
          <div className="chart-column" key={item.day}>
            <div className="bar-container">
              <div
                className="bar"
                style={{ height: `${item.value}%` }}
              ></div>
            </div>

            <span>{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}