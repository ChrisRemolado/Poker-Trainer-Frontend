import React, {useEffect, useState} from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const Graph = ({ setPage }) => {
    const [sessions, setSessions] = useState([]);

    function computeCumulativeStats(sessions) {
      let running = 0;

      return sessions.map((s) => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);

        const durationHours = (end - start) / (1000 * 60 * 60);
        const hourlyRate = durationHours > 0 ? s.profit / durationHours : 0;

        running += s.profit;

        return {
          ...s,
          durationHours: Number(durationHours.toFixed(2)),
          hourlyRate: Number(hourlyRate.toFixed(2)),
          bankroll: running
        };
      });
    }

    function formatMoney(n) {
      const abs = Math.abs(n).toFixed(2);
      return n < 0 ? `-$${abs}` : `$${abs}`;
    }

    const CustomTooltip = ({ active, payload }) => {
      if (!active || !payload || payload.length === 0) return null;

      const s = payload[0].payload;

      return (
        <div
          style={{
            background: "#0C1218",
            border: "1px solid #D4AF37",
            padding: "10px",
            borderRadius: "8px",
            color: "white",
            lineHeight: "1.4"
          }}
        >
          <div><strong>{s.date}</strong></div>
          <div>Session: {s.name}</div>
          <div>Profit: {formatMoney(s.profit)}</div>
          <div>Bankroll: {formatMoney(s.bankroll)}</div>
        </div>
      );
    };

    useEffect(() => {
        async function load() {
            const res = await fetch("https://poker-trainer-backend.onrender.com/load_sessions");
            const data = await res.json();

            let running = 0;
            const sessions = data
              .slice()
              .reverse()
              .map((s, index) => {
                  running += s.profit;
                  return {
                      name: s.sessionName,
                      profit: s.profit,
                      date: s.startTime.split("T")[0],
                      bankroll: running,
                      x: `${s.startTime.split("T")[0]}-${index}` // UNIQUE X VALUE
                  };
              });

            setSessions(sessions);
        }

        load();


    }, []);

  return (
    <div className="wynn-graph-screen">
      <h1 className="wynn-graph-title">Bankroll Graph</h1>
        
      <div className="wynn-graph-panel">
          <div className="wynn-graph-area-scroll">
            <div className="wynn-graph-area">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis datsaKey="x"
                         tickFormatter={(value) => value.split("-")[0] + "-" + value.split("-")[1] + "-" + value.split("-")[2]} // show only the date
                         stroke="#D4AF37" />
                  <YAxis stroke="#D4AF37" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="bankroll"
                    stroke="#D4AF37"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#0E4F7A", stroke: "#D4AF37", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
      </div>


      <div className="wynn-button-row">
            <button className="wynn-button" onClick={() => setPage("bankroll")}>
              Back
            </button>

            <button className="wynn-button" onClick={() => console.log("Add Session")}>
              Add Session
            </button>
      </div>
    </div>
  );
};

export default Graph;
