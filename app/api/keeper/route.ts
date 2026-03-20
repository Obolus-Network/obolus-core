import { NextResponse } from "next/server"
import * as fs from "fs"
import path from "path"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Read keeper state from shared logs directory
const STATE_PATH = path.join(
  process.env.KEEPER_LOGS_PATH || 
  "/Users/jaibajrang/Desktop/Projects/cardano/obolus/obolus-keeper/logs",
  "keeper-state.json"
)

export async function GET() {
  try {
    if (!fs.existsSync(STATE_PATH)) {
      return NextResponse.json({
        exchangeRate: 1.000000,
        totalCycles: 0,
        lastCycle: null
      })
    }
    const state = JSON.parse(fs.readFileSync(STATE_PATH, "utf8"))
    return NextResponse.json(state)
  } catch {
    return NextResponse.json({ exchangeRate: 1.000000, totalCycles: 0 })
  }
}
