import { useEffect, useState } from "react"

type WalletEntry = {
  wallet: string
  points: number
}

export default function Leaderboard() {
  const [data, setData] = useState<WalletEntry[]>([])
  const [claims, setClaims] = useState<Record<string, string>>({})
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/leaderboard.json")
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) {
          const sorted = [...json].sort((a, b) => b.points - a.points)
          setData(sorted)
        } else {
          console.error("Leaderboard data is not an array:", json)
          setError(true)
        }
      })
      .catch(err => {
        console.error("Fetch failed:", err)
        setError(true)
      })

    fetch("/claims/index.json")
      .then(res => res.json())
      .then(json => setClaims(json))
      .catch(err => console.error("Claim history fetch failed:", err))
  }, [])

  const getTier = (points: number) => {
    if (points >= 800) return "?? Gold"
    if (points >= 500) return "?? Silver"
    return "?? Bronze"
  }

  if (error) {
    return <p>? Failed to load leaderboard</p>
  }

  return (
    <main>
      <h1>?? Leaderboard</h1>
      <ol>
        {data.map((entry, index) => (
          <li key={index}>
            {entry.wallet} — {entry.points} points — {getTier(entry.points)}<br />
            {claims[entry.wallet] ? `?? Last claimed: ${claims[entry.wallet]}` : "? Not claimed yet"}
          </li>
        ))}
      </ol>
    </main>
  )
}
