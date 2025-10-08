"use client";

export default function PresaleProjection() {
  const data = [
    { sold: "100M", price: "$0.000165" },
    { sold: "200M", price: "$0.00033" },
    { sold: "300M", price: "$0.000495" },
    { sold: "350M", price: "$0.0005775" },
  ];

  return (
    <div style={{ margin: "2rem auto", padding: "2rem", backgroundColor: "rgba(0,0,0,0.6)", borderRadius: "12px", color: "white", fontSize: "1.5rem", textAlign: "center", width: "60%" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Presale Price Projection</h2>
      <p style={{ fontSize: "1.25rem", marginBottom: "2rem", color: "#0ff" }}>
        <strong>Current Presale Price:</strong> $0.000055 per GMB
      </p>
      <table style={{ margin: "0 auto", borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ padding: "0.5rem", borderBottom: "1px solid lime" }}>GMB Sold</th>
            <th style={{ padding: "0.5rem", borderBottom: "1px solid lime" }}>Estimated Launch Price</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #444" }}>{row.sold}</td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #444" }}>{row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

