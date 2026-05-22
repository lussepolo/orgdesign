import { useState, useEffect, useCallback } from "react";

// --- Configuration ---
// To change the password, run simpleHash('yournewpassword') in the browser console
// and replace the PASS_HASH value below.
const PASS_HASH = "ec8f6a6f"; // hash of 'lifewidelearning2026'
const SESSION_KEY = "concept_rio_auth";

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return (hash >>> 0).toString(16);
}

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "true") {
      setAuthenticated(true);
    }
  }, []);

  const attempt = useCallback(() => {
    if (simpleHash(input.trim()) === PASS_HASH) {
      setUnlocking(true);
      sessionStorage.setItem(SESSION_KEY, "true");
      setTimeout(() => setAuthenticated(true), 600);
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 2500);
    }
  }, [input]);

  if (authenticated) return <>{children}</>;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#f7f5f2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: unlocking ? 0 : 1,
        transform: unlocking ? "scale(1.02)" : "scale(1)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .gate-input:focus {
          border-color: #E87722 !important;
          box-shadow: 0 0 0 3px rgba(232, 119, 34, 0.1);
        }
        .gate-btn:hover { background: #d46a1a !important; }
        .gate-btn:active { transform: scale(0.985); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gate-animate { animation: fadeUp 0.7s ease both; }
        .gate-animate-1 { animation-delay: 0.1s; }
        .gate-animate-2 { animation-delay: 0.2s; }
        .gate-animate-3 { animation-delay: 0.3s; }
        .gate-animate-4 { animation-delay: 0.4s; }
        .gate-animate-5 { animation-delay: 0.5s; }
        .gate-animate-6 { animation-delay: 0.55s; }
        .gate-animate-7 { animation-delay: 0.6s; }
      `}</style>

      {/* Subtle background texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(232,119,34,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(232,119,34,0.03) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ textAlign: "center", maxWidth: 380, padding: "2rem", position: "relative", zIndex: 1 }}>
        {/* Orange mark */}
        <div
          className="gate-animate gate-animate-1"
          style={{
            width: 48,
            height: 4,
            background: "#E87722",
            borderRadius: 2,
            margin: "0 auto 2.5rem",
          }}
        />

        {/* Label */}
        <p
          className="gate-animate gate-animate-2"
          style={{
            fontSize: "0.7rem",
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#8a8580",
            marginBottom: "0.75rem",
          }}
        >
          Escola Concept
        </p>

        {/* Title */}
        <h1
          className="gate-animate gate-animate-3"
          style={{
            fontSize: "1.5rem",
            fontWeight: 300,
            lineHeight: 1.35,
            color: "#2c2c2c",
            marginBottom: "2.5rem",
          }}
        >
          <span style={{ fontWeight: 500 }}>Rio de Janeiro</span>
          <br />
          Strategic Organizational Architecture
        </h1>

        {/* Input */}
        <div className="gate-animate gate-animate-4" style={{ marginBottom: "1rem" }}>
          <input
            className="gate-input"
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && attempt()}
            placeholder="Enter access code"
            autoComplete="off"
            spellCheck={false}
            autoFocus
            style={{
              width: "100%",
              padding: "0.9rem 1.1rem",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "0.95rem",
              fontWeight: 400,
              letterSpacing: "0.04em",
              color: "#2c2c2c",
              background: "transparent",
              border: "1.5px solid #e0dcd6",
              borderRadius: 8,
              outline: "none",
              transition: "border-color 0.25s ease, box-shadow 0.25s ease",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Button */}
        <button
          className="gate-animate gate-animate-5 gate-btn"
          onClick={attempt}
          style={{
            width: "100%",
            padding: "0.85rem",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "0.85rem",
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#fff",
            background: "#E87722",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            transition: "background 0.2s ease, transform 0.15s ease",
          }}
        >
          Enter
        </button>

        {/* Error */}
        <p
          className="gate-animate gate-animate-6"
          style={{
            fontSize: "0.8rem",
            color: "#c0392b",
            marginTop: "0.75rem",
            minHeight: "1.2em",
            transition: "opacity 0.25s ease",
            opacity: error ? 1 : 0,
          }}
        >
          Incorrect code. Please try again.
        </p>

        {/* Footer */}
        <p
          className="gate-animate gate-animate-7"
          style={{
            marginTop: "3rem",
            fontSize: "0.7rem",
            color: "#8a8580",
            letterSpacing: "0.05em",
          }}
        >
          Internal document. Authorized access only.
        </p>
      </div>
    </div>
  );
}
