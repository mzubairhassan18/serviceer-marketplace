"use client";

export default function OfflinePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>You&apos;re offline</h1>
      <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
        Connect to the internet to browse Serviceer.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn btn-primary"
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
