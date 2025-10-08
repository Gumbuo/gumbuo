import { useState } from "react"

export default function Staking() {
  const [wallet, setWallet] = useState("")
  const [status, setStatus] = useState("")

  const handleClaim = async () => {
    const res = await fetch("/api/triggerClaim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet })
    })
    const result = await res.text()
    setStatus(result)
  }

  return (
    <main>
      <h1>?? Staking Dashboard</h1>
      <input value={wallet} onChange={e => setWallet(e.target.value)} placeholder="Enter wallet" />
      <button onClick={handleClaim}>Claim Reward</button>
      <p>{status}</p>
    </main>
  )
}
