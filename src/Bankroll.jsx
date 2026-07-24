import {useEffect, useState} from "react";

export default function Bankroll({ setPage }) {
    const btnStyle = {
      padding: "10px 20px",
      background: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px"
    };

    const inputStyle = {
              width: "50%",
              padding: "8px",
              margin: "6px 0 12px 0",
              borderRadius: "4px",
              border: "1px solid #ccc"
            };

    const defaultStakes = [
      "1/2",
      "1/3",
      "2/5",
      "5/10",
      "10/20"
    ];

    const [showAddModal, setShowAddModal] = useState(false);
    const [dummySessions, setDummySessions] = useState([]);
    const [error, setError] = useState(null);

    async function loadSessions() {
      try {
        const res = await fetch("https://poker-trainer-backend.onrender.com/load_sessions");
        const data = await res.json();
        setDummySessions(data);
      } catch (err) {
        setError("Could not reach backend.");
      }
    }

    async function addSession(newSession) {
      try {
        const res = await fetch("https://poker-trainer-backend.onrender.com/add_session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionName: newSession.sessionName,
            startTime: newSession.startTime,
            endTime: newSession.endTime,
            stakes: newSession.stakes,
            profit: newSession.profit
          })
        });

        const data = await res.json();
        setDummySessions(data);
      } catch (err) {
        setError("Could not reach backend.");
      }
    }

    useEffect(() => {
      loadSessions();
    }, []);

// COMPUTE STATS BEFORE LOADING
function computeSessionStats(session) {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    const durationHours = (end - start) / (1000 * 60 * 60);
    const hourlyRate = session.profit / durationHours;

    return {
        ...session,
        durationHours: Number(durationHours.toFixed(2)),
        hourlyRate: Number(hourlyRate.toFixed(2))
    };
}

function toUSD(amount) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function toUSDStakes(amount) {
  return "$"+ amount;
}

function decimalHoursToHM(decimal) {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

function nowLocalDatetime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function splitDateAndTime(DT){
    const dateTime = DT.split("T");
    return dateTime;
}

function to12Hour(t) {
  let [h, m] = t.split(":");
  h = Number(h);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12; // convert 0 → 12, 13 → 1, etc.
  return `${h}:${m} ${suffix}`;
}

const sessions = dummySessions.map(computeSessionStats)
const [showDropdown, setShowDropdown] = useState(false);

const [sessionName, setSessionName] = useState("");
const [startTime, setStartTime] = useState("");
const [endTime, setEndTime] = useState("");
const [stakes, setStakes] = useState("");
const [profit, setProfit] = useState("");


  return (

    <div className="wynn-bankroll-screen">
      <h2 className="wynn-bankroll-title">Bankroll History</h2>

        <div className="wynn-bankroll-table-container">
            <div className="wynn-table-scroll-x">
              <table className="wynn-blue-table">
                <thead>
                    <tr>
                        <th>Session</th>
                        <th>Date & Time</th>
                        <th>Duration</th>
                        <th>Stakes</th>
                        <th className="text-right">Profit</th>
                        <th>Hourly</th>
                    </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id}>
                      <td>{s.sessionName}</td>
                      <td>{splitDateAndTime(s.startTime)[0]}, {to12Hour(splitDateAndTime(s.startTime)[1])}</td>
                      <td>{decimalHoursToHM(s.durationHours)} hrs</td>
                      <td>{toUSDStakes(s.stakes)}</td>
                      <td className={s.profit >= 0 ? "wynn-profit-win" : "wynn-profit-loss"}>
                          {toUSD(s.profit)}
                      </td>
                      <td>{toUSD(s.hourlyRate)}/hr</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


        </div>
        <div className="wynn-button-row">
              <button className="wynn-button" onClick={() => console.log("Edit Session")}>
                Edit Session
              </button>

              <button className="wynn-button" onClick={() => setShowAddModal(true)}>
                Add Session
              </button>


                {showAddModal && (
                  <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}>
                    <div style={{
                      background: "white",
                      padding: "20px",
                      borderRadius: "8px",
                      width: "300px"
                    }}>
                      <h3>Add Session</h3>

                      <label>Session Name</label>
                      <input
                          type="text"
                          value={sessionName}
                          onChange={(e) => setSessionName(e.target.value)}

                        />

                      <label>Start Time</label>
                      <input
                          type="datetime-local"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />

                      <label>End Time</label>
                      <input
                          type="datetime-local"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />


                      <label>Stakes</label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            value={stakes}
                            onChange={(e) => setStakes(e.target.value)}
                            onFocus={() => setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                            placeholder="Type or select"
                          />

                          {showDropdown && (
                            <div style={{
                              position: "absolute",
                              top: "40px",
                              left: 0,
                              width: "100%",
                              background: "white",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              zIndex: 10
                            }}>
                              {defaultStakes.map((s) => (
                                <div
                                  key={s}
                                  onMouseDown={() => setStakes(s)}
                                  style={{
                                    padding: "8px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #eee"
                                  }}
                                >
                                  {s}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      <label>Profit / Loss ($)</label>
                      <input
                          type="number"
                          value={profit}
                          onChange={(e) => setProfit(e.target.value)}
                          placeholder="Type a value in USD"
                        />

                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                        <button onClick={() => setShowAddModal(false)} style={btnStyle}>
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const newSession = {
                              sessionName,
                              startTime,
                              endTime,
                              stakes,
                              profit
                            };
                            addSession(newSession);
                            setShowAddModal(false);
                          }}
                          style={btnStyle}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              <button
                  className="wynn-button"
                  onClick={() => setPage("graph")}
                >
                  Graph
                </button>
            </div>
    </div>
  );
}


