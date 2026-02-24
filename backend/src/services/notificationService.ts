/**
 * Notification service for push notifications and email.
 * In production, integrate with Firebase Cloud Messaging (FCM) and/or APNs.
 */

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(
  payload: NotificationPayload
): Promise<boolean> {
  // Placeholder: In production, use firebase-admin SDK
  console.log(`[PUSH] → ${payload.userId}: ${payload.title} - ${payload.body}`);
  return true;
}

export async function sendDailyReminder(userId: string): Promise<void> {
  await sendPushNotification({
    userId,
    title: "Husk å logge maten din i dag! 🍎",
    body: "Et par minutter nå gir store resultater over tid.",
    data: { action: "open_food_log" },
  });
}

export async function sendWeightReminder(userId: string): Promise<void> {
  await sendPushNotification({
    userId,
    title: "Tid for ukentlig veiing ⚖️",
    body: "Logg vekten din for å følge med på fremgangen.",
    data: { action: "open_weight_log" },
  });
}

export async function sendStreakCongrats(
  userId: string,
  days: number
): Promise<void> {
  await sendPushNotification({
    userId,
    title: `${days} dagers streak! 🔥`,
    body: "Du er på god vei. Fortsett det gode arbeidet!",
    data: { action: "open_dashboard" },
  });
}
