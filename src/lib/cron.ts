import cron from 'node-cron'
import { sendScheduledNotifications } from './push'

let initialized = false

export function initCronJobs() {
  if (initialized) return
  initialized = true

  // Hourly notifications — every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Sending hourly notifications...')
    await sendScheduledNotifications('HOURLY')
  })

  // Daily notifications — every day at 9:00 AM UTC
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Sending daily notifications...')
    await sendScheduledNotifications('DAILY')
  })

  console.log('[CRON] Notification schedulers initialized')
}
