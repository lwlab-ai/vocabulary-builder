import webpush from 'web-push'
import { prisma } from './prisma'
import { getRandomUnseen } from './user-word'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushToUser(userId: string, isTesting: boolean = false) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.pushSubscription) return

  const unseenWord = await getRandomUnseen(userId)
  if (!unseenWord) return
  
  const randomWord = unseenWord?.word

  const payload = JSON.stringify({
    title: `${isTesting ? "[Test]" : ""}📚 New word arrived 👉 ${randomWord.word}`,
    body: `${randomWord.pronunciation} - ${randomWord.definition.substring(0, 100)}...`,
    url: '/dashboard'
  })

  try {
    const subscription = JSON.parse(user.pushSubscription)
    await webpush.sendNotification(subscription, payload)
    return randomWord
  } catch (error) {
    const err = error as { statusCode?: number; message?: string }
    // If subscription is expired/invalid, clean it up
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.error(`Push failed for user ${userId}, turning off notifications:`, err.message)
      await prisma.user.update({
        where: { id: userId },
        data: { pushSubscription: null, notificationPref: 'OFF' }
      })
    }
    console.error(`Push failed for user ${userId}:`, err.message)
  }
  return null
}

export async function sendScheduledNotifications(preference: string) {
  const users = await prisma.user.findMany({
    where: {
      notificationPref: preference,
      pushSubscription: { not: null }
    }
  })

  console.log(`Sending ${preference} notifications to ${users.length} users`)

  for (const user of users) {
    await sendPushToUser(user.id)
  }
}
