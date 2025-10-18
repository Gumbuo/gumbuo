"use client";

export default function PresaleEthAllocation() {
  return (
    <div style={{
      margin: "2rem auto",
      padding: "2rem",
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: "12px",
      color: "white",
      fontSize: "1.5rem",
      textAlign: "center",
      width: "100%",
      maxWidth: "100%",
      lineHeight: "2.5rem"
    }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Presale ETH Allocation</h2>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <p style={{ width: "100%", maxWidth: "1600px" }}>
          ?? <strong>Total ETH Raised:</strong> Live soon
        </p>
        <p style={{ width: "100%", maxWidth: "1600px" }}>
          ?? <strong>Liquidity Pool:</strong> 60% ? <span style={{ color: "lime" }}>0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b</span>
        </p>
        <p style={{ width: "100%", maxWidth: "1600px" }}>
          ?? <strong>Marketing & Community:</strong> 25% ? <span style={{ color: "lime" }}>0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b</span>
        </p>
        <p style={{ width: "100%", maxWidth: "1600px" }}>
          ?? <strong>Treasury Reserve:</strong> 15% ? <span style={{ color: "lime" }}>0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b</span>
        </p>
      </div>
      <p style={{ marginTop: "2rem", fontStyle: "italic" }}>
        Funds are transparently allocated. Liquidity will be locked at launch.<br />
        <span style={{ fontWeight: "bold", color: "lime" }}>FULL FUCKING TRANSPARENCY!</span>
      </p>
    </div>
  );
}

