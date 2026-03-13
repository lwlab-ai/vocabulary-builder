import webpush from 'web-push'
import { prisma } from './prisma'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushToUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.pushSubscription) return

  // Get random unseen words for this user via UserWord join
  const unseenUserWords = await prisma.userWord.findMany({
    where: { userId, seen: false },
    include: {
      word: {
        include: { category: { select: { name: true } } },
      },
    },
    take: 10,
  })

  if (unseenUserWords.length === 0) return

  const randomUserWord = unseenUserWords[Math.floor(Math.random() * unseenUserWords.length)]
  const randomWord = randomUserWord.word

  const payload = JSON.stringify({
    title: `📚 ${randomWord.word}`,
    body: `${randomWord.pronunciation} — ${randomWord.definition.substring(0, 100)}...`,
    url: '/dashboard'
  })

  try {
    const subscription = JSON.parse(user.pushSubscription)
    await webpush.sendNotification(subscription, payload)
  } catch (error: any) {
    // If subscription is expired/invalid, clean it up
    if (error.statusCode === 410 || error.statusCode === 404) {
      await prisma.user.update({
        where: { id: userId },
        data: { pushSubscription: null, notificationPref: 'OFF' }
      })
    }
    console.error(`Push failed for user ${userId}:`, error.message)
  }
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
