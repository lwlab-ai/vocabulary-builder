import { NextResponse } from "next/server"
import { initCronJobs } from "@/lib/cron"

initCronJobs()

export async function GET() {
  return NextResponse.json({ ok: true })
}
