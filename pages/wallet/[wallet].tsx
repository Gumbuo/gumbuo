import { useEffect, useState } from "react"
import { useRouter } from "next/router"

type WalletStatus = {
  wallet: string
  points: number
  eligible: boolean
  last_updated: string
}

export default function WalletPage() {
  const router = useRouter()
  const { wallet } = router.query
  const [status, setStatus] = useState<WalletStatus | null>(null)

  useEffect(() => {
    if (!wallet) return
    fetch(`/api/walletStatus?wallet=${wallet}`)
      .then(res => res.json())
      .then(json => setStatus(json))
  }, [wallet])

  if (!status) return <p>Loading...</p>

  return (
    <main>
      <h1>👾 Wallet Status</h1>
      <p>Wallet: {status.wallet}</p>
      <p>Points: {status.points}</p>
      <p>Eligible: {status.eligible ? 'Yes' : 'No'}</p>
      <p>Last Updated: {status.last_updated}</p>
    </main>
  )
}
