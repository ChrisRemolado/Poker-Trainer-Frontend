import {useEffect, useState} from "react";

export default function Trainer() {
  const [hero, setHero] = useState("");
  const [villain, setVillain] = useState("");
  const [board, setBoard] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMatrix, setShowMatrix] = useState(false);

  const [heatmap, setHeatmap] = useState({});
  const [loadHeatmap, setLoadHeatmap] = useState(false);
  const [villainSelected, setVillainSelected] = useState(null);
  const [villainRange, setVillainRange] = useState(new Set());


function handleVillainSelect(label) {
  console.log("Villain selected:", label);

  // keep old single-select behavior
  setVillainSelected(label);

  // NEW: toggle in villainRange Set
  setVillainRange(prev => {
    const next = new Set(prev);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    return next;
  });
}

function normalizeVillainRange(villainRange) {
  if (!villainRange || villainRange.size === 0) return "";
  return Array.from(villainRange).join(",");
}


  useEffect(() => {
  if (!loadHeatmap) return;

  async function fetchHeatmap() {
    try {
      const res = await fetch("https://poker-trainer-backend.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero_range: hero,
          villain_range: villain,
          board: board,
          trials: 3000
        })
      });

      const data = await res.json();
      setHeatmap(data);   // <-- store backend heatmap
    } catch (err) {
      console.error("Heatmap error:", err);
    }

    setLoadHeatmap(false); // reset trigger
  }

  fetchHeatmap();
}, [loadHeatmap]);

  async function runEquity() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("https://poker-trainer-backend.onrender.com/range_equity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero_range: hero,
          villain_range: villain,
          board: board,
          trials: 5000
        })
      });

      if (!res.ok) {
        throw new Error("Backend error");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Could not reach backend.");
    }

    setLoading(false);
  }

  async function runEquityDefault() {
  setLoading(true);
  setError("");
  setResult(null);

  try {
    const res = await fetch("https://poker-trainer-backend.onrender.com/debug_heatmap");
    if (!res.ok) throw new Error("Backend error");

    const data = await res.json();
    setHeatmap(data);   // this is the important part
  } catch (err) {
    setError("Could not reach backend.");
  }

  setLoading(false);
}

async function loadDefaultEquities() {
  setLoading(true);
  setError("");
  setResult(null);

  try {
    const res = await fetch("https://poker-trainer-backend.onrender.com/default_equities");
    if (!res.ok) throw new Error("Backend error");

    const data = await res.json();
    setHeatmap(data);   // this is the important part
  } catch (err) {
    setError("Could not reach backend.");
  }

  setLoading(false);
}

  async function computeVsVillain() {
  if (!villainRange) {
    alert("Click a hand in the matrix first.");
    return;
  }

  const villainRangeNormalized = normalizeVillainRange(villainRange);

  try {
    const res = await fetch("http://localhost:8000/heatmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hero_range: hero,
        villain_range: villainRangeNormalized,
        board: board,
        trials: 5
      })
    });

    const data = await res.json();
    setHeatmap(data);
  } catch (err) {
    console.error("computeVsVillain error:", err);
  }
}


  return (
      <div className="wynn-trainer-screen">
        <div className="wynn-trainer-panel">
          <h2 className="wynn-trainer-title">Lux Poker Trainer</h2>
          <label>Hero Range</label>
          <input
            placeholder="A2s+, KQo, 55+"
            value={hero}
            onChange={(e) => setHero(e.target.value)}
          />

          <label>Villain Range</label>
          <input
            placeholder="KTo+, 22-99"
            value={villain}
            onChange={(e) => setVillain(e.target.value)}
          />

          <label>Board (optional)</label>
          <input
            placeholder="AhKd7c"
            value={board}
            onChange={(e) => setBoard(e.target.value)}
          />

          <button
            onClick={runEquity}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Run Equity
          </button>

          <button
            onClick={() => setShowMatrix(!showMatrix)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {showMatrix ? "Hide Matrix" : "Show Matrix"}
          </button>

          <button
            onClick={computeVsVillain}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              background: "#d63031",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Compute vs Selected Villain Hand
          </button>

          <button
            onClick={runEquityDefault}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              background: "grey",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Compute vs Random Villain Hand
          </button>

          <button
            onClick={loadDefaultEquities}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              background: "grey",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Load Default Equities
          </button>

          {loading && <p style={{ marginTop: "20px" }}>Calculating…</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {result && (
            <div style={{ marginTop: "20px" }}>
              <h3>Results</h3>
              <p>Hero: {result.hero_win.toFixed(3)}</p>
              <p>Villain: {result.villain_win.toFixed(3)}</p>
              <p>Tie: {result.tie.toFixed(3)}</p>
            </div>
          )}

          {showMatrix && <RangeMatrix
      heatmap={heatmap}
      villainRange={villainRange}
      setVillainRange={setVillainRange}
    />

    }
        </div>
      </div>
  );
}

function RangeMatrix({ heatmap, villainRange, setVillainRange }) {
  const ranks = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
  const [selected, setSelected] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [dragMode, setDragMode] = useState(null);

  function labelFor(i, j) {
      if (i === j) return ranks[i] + ranks[j];     // AA, KK, etc.
      if (i < j) return ranks[i] + ranks[j] + "s"; // suited: AKs
      return ranks[j] + ranks[i] + "o";            // offsuit: AKo
}

    function getCellColor(i, j, label, heatmap, villainRange) {
      if (villainRange && villainRange.has && villainRange.has(label)) {
        return "#e63946";
      }

      if (heatmap && heatmap[label] !== undefined) {
        const eq = heatmap[label];
        const r = Math.floor((1 - eq) * 255);
        const g = Math.floor(eq * 255);
        return `rgb(${r}, ${g}, 80)`;
      }

      if (i === j) return "#f4a261";
      if (i < j) return "#2a9d8f";
      return "#457b9d";
    }

  function toggle(label) {
    setSelected(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  }

  function handleMouseDown(e, i, j) {
      const label = labelFor(i, j);

      // CTRL + DRAG = rectangle deselect
      if (e.ctrlKey) {
        setIsDragging(true);
        setDragStart({ i, j });
        setDragMode("deselect");
        return;
      }

      // SHIFT + DRAG = rectangle select
      if (e.shiftKey) {
        setIsDragging(true);
        setDragStart({ i, j });
        setDragMode("select");
        return;
      }

      // NORMAL CLICK = toggle
      setVillainRange(prev => {
        const next = new Set(prev);
        if (next.has(label)) next.delete(label);
        else next.add(label);

        console.log("Selected villain hands:", Array.from(next));

        return next;
      });
    }


  function handleMouseEnter(i, j) {
      if (!isDragging || !dragStart) return;

      const startI = dragStart.i;
      const startJ = dragStart.j;

      const minI = Math.min(startI, i);
      const maxI = Math.max(startI, i);
      const minJ = Math.min(startJ, j);
      const maxJ = Math.max(startJ, j);

      setVillainRange(prev => {
        const next = new Set(prev);

        for (let x = minI; x <= maxI; x++) {
          for (let y = minJ; y <= maxJ; y++) {
            const label = labelFor(x, y);

            if (dragMode === "select") next.add(label);
            if (dragMode === "deselect") next.delete(label);
          }
        }

        return next;
      });
}


  function handleMouseUp() {
  setIsDragging(false);
  setDragStart(null);
  setDragMode(null);
}


  return (
    <div style={{ marginTop: "20px" }} onMouseUp={handleMouseUp}>
      <h3>Range vs Range Matrix</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(13, 1fr)",
          gap: "2px",
          marginTop: "10px",
          userSelect: "none"
        }}
      >
        {ranks.map((r1, i) =>
          ranks.map((r2, j) => {
            const label = labelFor(i, j);

            return (
              <div
                key={label}
                onMouseDown={(e) => handleMouseDown(e, i, j)}
                onMouseEnter={() => handleMouseEnter(i, j)}
                onMouseUp={handleMouseUp}
                style={{
                  background: getCellColor(i, j, label, heatmap, villainRange),
                  color: "white",
                  padding: "8px 0",
                  textAlign: "center",
                  fontSize: "12px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  transition: "0.15s"
                }}
              >
                <div>{label}</div>
                  <div style={{ fontSize: "9px", opacity: 0.8 }}>
                    {heatmap && heatmap[label] !== undefined
                      ? `${(heatmap[label] * 100).toFixed(2)}%`
                      : "0%"}
                  </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ marginTop: "15px", fontSize: "14px" }}>
        <strong>Selected:</strong>{" "}
        {Object.keys(selected).filter(k => selected[k]).join(", ")}
      </div>
    </div>
  );
}