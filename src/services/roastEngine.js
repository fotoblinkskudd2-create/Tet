import { roasts } from '../data/roasts';

class RoastEngine {
  constructor() {
    this.usedRoasts = new Set();
  }

  /**
   * Get a random roast from an array, avoiding repeats
   */
  getRandomRoast(roastArray) {
    if (!roastArray || roastArray.length === 0) {
      return 'Du vet hva du må gjøre. Gjør det.';
    }

    // Reset if we've used all roasts
    if (this.usedRoasts.size >= roastArray.length * 0.8) {
      this.usedRoasts.clear();
    }

    // Find unused roasts
    const unusedRoasts = roastArray.filter(
      (roast) => !this.usedRoasts.has(roast)
    );

    const options = unusedRoasts.length > 0 ? unusedRoasts : roastArray;
    const selected = options[Math.floor(Math.random() * options.length)];

    this.usedRoasts.add(selected);
    return selected;
  }

  /**
   * Get daily greeting based on performance
   */
  getDailyGreeting(completionRate, roastLevel = 'normal') {
    const isSuccess = completionRate >= 0.7; // 70% or more is success
    const category = isSuccess ? 'success' : 'failing';

    return this.getRandomRoast(roasts.dailyGreeting[category][roastLevel]);
  }

  /**
   * Get notification message based on time of day
   */
  getNotification(timeOfDay, roastLevel = 'normal') {
    const validTimes = ['morning', 'midday', 'evening'];
    const time = validTimes.includes(timeOfDay) ? timeOfDay : 'midday';

    return this.getRandomRoast(roasts.notifications[time][roastLevel]);
  }

  /**
   * Get snooze message
   */
  getSnoozeMessage(roastLevel = 'normal') {
    return this.getRandomRoast(roasts.snooze[roastLevel]);
  }

  /**
   * Get stats summary roast
   */
  getStatsSummary(completionRate, roastLevel = 'normal') {
    let category;
    if (completionRate < 0.4) {
      category = 'poor';
    } else if (completionRate < 0.7) {
      category = 'average';
    } else {
      category = 'good';
    }

    return this.getRandomRoast(roasts.statsSummary[category][roastLevel]);
  }

  /**
   * Get leaderboard title based on rank percentage
   */
  getLeaderboardTitle(rankPercentile) {
    if (rankPercentile >= 0.9) {
      // Top 10%
      return roasts.leaderboard.topTier[
        Math.floor(Math.random() * roasts.leaderboard.topTier.length)
      ];
    } else if (rankPercentile >= 0.4) {
      // Middle 50%
      return roasts.leaderboard.midTier[
        Math.floor(Math.random() * roasts.leaderboard.midTier.length)
      ];
    } else {
      // Bottom 40%
      return roasts.leaderboard.bottomTier[
        Math.floor(Math.random() * roasts.leaderboard.bottomTier.length)
      ];
    }
  }

  /**
   * Get panic redemption messages
   */
  getPanicRedemption(stage, roastLevel = 'normal') {
    const validStages = ['start', 'success', 'failure'];
    const redemptionStage = validStages.includes(stage) ? stage : 'start';

    return this.getRandomRoast(
      roasts.panicRedemption[redemptionStage][roastLevel]
    );
  }

  /**
   * Get time of day category
   */
  getTimeOfDay() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 17) {
      return 'midday';
    } else {
      return 'evening';
    }
  }

  /**
   * Get contextual roast based on current state
   */
  getContextualRoast(context) {
    const {
      type = 'daily',
      completionRate = 0,
      roastLevel = 'normal',
      stage = null,
      rankPercentile = 0.5,
    } = context;

    switch (type) {
      case 'daily':
        return this.getDailyGreeting(completionRate, roastLevel);

      case 'notification':
        const timeOfDay = this.getTimeOfDay();
        return this.getNotification(timeOfDay, roastLevel);

      case 'snooze':
        return this.getSnoozeMessage(roastLevel);

      case 'stats':
        return this.getStatsSummary(completionRate, roastLevel);

      case 'leaderboard':
        return this.getLeaderboardTitle(rankPercentile);

      case 'panic':
        return this.getPanicRedemption(stage, roastLevel);

      default:
        return this.getDailyGreeting(completionRate, roastLevel);
    }
  }
}

export default new RoastEngine();
