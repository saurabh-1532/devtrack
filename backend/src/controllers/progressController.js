import User from '../models/User.js';
import Goal from '../models/Goal.js';
import Resource from '../models/Resource.js';
import ActivityLog from '../models/ActivityLog.js';

export const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    // ── 1. STATS ──
    const totalGoals = await Goal.countDocuments({ userId });
    const totalResources = await Resource.countDocuments({ userId });
    const completedResources = await Resource.countDocuments({ userId, status: 'done' });
    const totalStudyDays = await ActivityLog.countDocuments({ userId });

    // completed goals — all resources under goal are done
    const goals = await Goal.find({ userId });
    const resources = await Resource.find({ userId });

    let completedGoals = 0;
    const goalSummaries = goals.map(goal => {
      const goalResources = resources.filter(r => r.goalId.toString() === goal._id.toString());

      const progress = goalResources.length > 0
        ? Math.round(goalResources.reduce((sum, r) => {
            return sum + (r.totalUnits > 0 ? (r.doneUnits / r.totalUnits) * 100 : 0)
          }, 0) / goalResources.length)
        : 0;

      const allDone = goalResources.length > 0 && goalResources.every(r => r.status === 'done');
      if (allDone) completedGoals++;

      const daysRemaining = goal.deadline
        ? Math.ceil((new Date(goal.deadline) - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        _id: goal._id,
        name: goal.name,
        emoji: goal.emoji,
        progress,
        daysRemaining,
        status: allDone ? 'done' : progress > 0 ? 'in-progress' : 'saved',
      };
    });

    // ── 2. STREAK ──
    const streak = {
      currentStreak: req.user.currentStreak,
      longestStreak: req.user.longestStreak,
    };

    // ── 3. LAST 7 DAYS ACTIVITY ──
    const today = new Date().toISOString().split('T')[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];

    const recentLogs = await ActivityLog.find({
      userId,
      date: { $gte: startDate },
    });

    const last7Dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Dates.push(date.toISOString().split('T')[0]);
    }

    const last7Days = last7Dates.map(date => {
      const log = recentLogs.find(l => l.date === date);
      return {
        date,
        studied: !!log,
        units: log ? log.unitsCompleted : 0,
      };
    });

    // ── 4. WEEKLY COMPARISON ──
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    const startDate14 = fourteenDaysAgo.toISOString().split('T')[0];

    const allRecentLogs = await ActivityLog.find({
      userId,
      date: { $gte: startDate14 },
    });

    const thisWeekUnits = allRecentLogs
      .filter(l => l.date >= startDate)
      .reduce((sum, l) => sum + l.unitsCompleted, 0);

    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 13);
    const lastWeekStartStr = lastWeekStart.toISOString().split('T')[0];

    const lastWeekEnd = new Date();
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
    const lastWeekEndStr = lastWeekEnd.toISOString().split('T')[0];

    const lastWeekUnits = allRecentLogs
      .filter(l => l.date >= lastWeekStartStr && l.date <= lastWeekEndStr)
      .reduce((sum, l) => sum + l.unitsCompleted, 0);

    const change = lastWeekUnits === 0
      ? 100
      : Math.round(((thisWeekUnits - lastWeekUnits) / lastWeekUnits) * 100);

    const weeklyComparison = {
      thisWeek: thisWeekUnits,
      lastWeek: lastWeekUnits,
      change,
      improved: thisWeekUnits >= lastWeekUnits,
    };

    // ── 5. FINAL RESPONSE ──
    res.status(200).json({
      stats: {
        totalGoals,
        completedGoals,
        totalResources,
        completedResources,
        totalStudyDays,
      },
      streak,
      last7Days,
      weeklyComparison,
      goals: goalSummaries,
      badges: req.user.badges,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};