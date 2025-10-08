export default function PresaleBar() {
  return (
    <div style={{
      marginTop: "2rem",
      padding: "1rem",
      backgroundColor: "#0f0f23",
      borderRadius: "12px",
      color: "#ffffff",
      fontFamily: "Orbitron, sans-serif",
      boxShadow: "0 0 12px #00ffcc"
    }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>?? Gumbuo Presale Status</h2>
      <p><strong>Price:</strong> 0.00042 ETH per GMB</p>
      <p><strong>Sold:</strong> 12,400,000 GMB</p>
      <p><strong>Remaining:</strong> 37,600,000 GMB</p>
      <div style={{
        marginTop: "1rem",
        height: "20px",
        backgroundColor: "#222",
        borderRadius: "10px",
        overflow: "hidden"
      }}>
        <div style={{
          width: "24.8%",
          height: "100%",
          backgroundColor: "#00ffcc"
        }}></div>
      </div>
      <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>24.8% sold</p>

      <h3 style={{ marginTop: "1.5rem", fontSize: "1.2rem" }}>?? Launch Tokenomics</h3>
      <ul>
        <li><strong>Total Supply:</strong> 50,000,000 GMB</li>
        <li><strong>Presale Allocation:</strong> 80%</li>
        <li><strong>Liquidity Pool:</strong> 15%</li>
        <li><strong>Team Reserve:</strong> 5%</li>
        <li><strong>Launch Valuation:</strong> ~21 ETH</li>
      </ul>
    </div>
  );
}

