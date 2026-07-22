import { useState, useEffect } from "react";
import Trainer from "./Trainer";
import Bankroll from "./Bankroll";
import Graph from "./Graph";

export default function App() {
  const [page, setPage] = useState("trainer");

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {/* Navigation */}
      <nav style={{
        display: "flex",
        justifyContent: "space-around",
        padding: "12px",
        background: "#222",
        color: "white"
      }}>
        <button onClick={() => setPage("trainer")} style={navBtn(page === "trainer")}>Trainer</button>
        <button onClick={() => setPage("bankroll")} style={navBtn(page === "bankroll")}>Bankroll</button>
        <button onClick={() => setPage("favorites")} style={navBtn(page === "favorites")}>Favorites</button>
      </nav>

      {/* Page Content */}
      <div style={{ padding: "20px" }}>
      {page === "trainer" && <Trainer setPage={setPage} />}
      {page === "bankroll" && <Bankroll setPage={setPage} />}
      {page === "favorites" && <Favorites setPage={setPage} />}
      {page === "graph" && <Graph setPage={setPage} />}
    </div>

    </div>
  );
}

function navBtn(active) {
  return {
    background: active ? "#007bff" : "#444",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer"
  };
}

// Placeholder components
function Favorites() {
  return <h2>Favorite Hands</h2>;
}