import type { NextApiRequest, NextApiResponse } from "next"
import { exec } from "child_process"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed")
    return
  }

  const wallet = req.body.wallet
  if (!wallet) {
    res.status(400).send("Missing wallet")
    return
  }

  const command = `powershell.exe -ExecutionPolicy Bypass -File .\\scripts\\claim.ps1 -wallet ${wallet}`

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Claim script failed:", stderr)
      res.status(500).send("Claim failed")
    } else {
      res.status(200).send(stdout || "Claim successful")
    }
  })
}
