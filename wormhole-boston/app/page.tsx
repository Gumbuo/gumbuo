import entries from "../data/entries.json";

type Entry = {
  id: string;
  name: string;
  screenshot: string;
  date: string;
  note?: string;
};

export default function Home() {
  const sorted = [...(entries as Entry[])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 80px" }}>
      {/* Launch banner */}
      <div
        style={{
          background: "#cc2200",
          color: "#fff",
          textAlign: "center",
          padding: "14px 20px",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 1,
          margin: "0 -20px 0",
        }}
      >
        OFFICIAL LAUNCH: JULY 4TH, 2026 — INDEPENDENCE DAY
      </div>

      {/* Header */}
      <header
        style={{
          borderBottom: "2px solid #cc2200",
          padding: "40px 0 28px",
          marginBottom: 48,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: 4,
            color: "#cc2200",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          wormhole.boston
        </div>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 800,
            lineHeight: 1.1,
            color: "#ffffff",
            marginBottom: 16,
          }}
        >
          Internet Bully Exposure
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "#aaa",
            maxWidth: 600,
            lineHeight: 1.6,
          }}
        >
          This page documents adults who target and harass children on Facebook
          and other social platforms. All incidents shown are based on publicly
          visible posts and verified reports. These people chose to do this
          publicly — we are choosing to remember it publicly.
        </p>
      </header>

      {/* Count bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 36,
          color: "#888",
          fontSize: 13,
        }}
      >
        <span
          style={{
            background: "#cc2200",
            color: "#fff",
            fontWeight: 700,
            fontSize: 12,
            padding: "3px 10px",
            borderRadius: 4,
          }}
        >
          {sorted.length} {sorted.length === 1 ? "RECORD" : "RECORDS"}
        </span>
        <span>Sorted newest first. Updated as new incidents are verified.</span>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <p style={{ color: "#555", fontStyle: "italic" }}>
          No records yet. Check back soon.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {sorted.map((entry) => (
            <BullyCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          marginTop: 80,
          paddingTop: 24,
          borderTop: "1px solid #222",
          color: "#444",
          fontSize: 12,
          lineHeight: 1.8,
        }}
      >
        <p>
          All content on this page consists of publicly available information
          and direct screenshots of public posts. This site does not publish
          private addresses, phone numbers, or non-public personal data. If you
          have a verified incident to report, contact us at wormhole.boston.
        </p>
      </footer>
    </main>
  );
}

function BullyCard({ entry }: { entry: Entry }) {
  const formattedDate = new Date(entry.date + "T12:00:00").toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <article
      style={{
        background: "#111",
        border: "1px solid #2a2a2a",
        borderTop: "3px solid #cc2200",
        borderRadius: 6,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Screenshot */}
      <div
        style={{
          background: "#0a0a0a",
          minHeight: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.screenshot}
          alt={`Screenshot of ${entry.name}`}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: "16px 18px 20px", flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            color: "#cc2200",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {formattedDate}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#ff4422",
            marginBottom: entry.note ? 10 : 0,
            wordBreak: "break-word",
          }}
        >
          {entry.name}
        </div>
        {entry.note && (
          <p
            style={{
              fontSize: 13,
              color: "#999",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {entry.note}
          </p>
        )}
      </div>
    </article>
  );
}
