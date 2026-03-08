import User from '../models/User.js';
import Goal from '../models/Goal.js';
import Resource from '../models/Resource.js';

export const checkBadges = async (user, event) => {
  const newBadges = [];

  // helper — checks if user already has this badge at this tier or higher
  const hasBadge = (id, tier) => {
    return user.badges.some(b => b.id === id && b.tier >= tier);
  };

  // helper — awards a badge if not already earned
  const award = (id, tier) => {
    if (!hasBadge(id, tier)) {
      user.badges.push({ id, tier, earnedAt: new Date() });
      newBadges.push({ id, tier });
    }
  };

  // ── counts we need for badge checks ──
  const totalResources = await Resource.countDocuments({ userId: user._id });
  const completedResources = await Resource.countDocuments({ userId: user._id, status: 'done' });
  const totalGoals = await Goal.countDocuments({ userId: user._id });

  // completed goals — all resources under goal are done
  const goals = await Goal.find({ userId: user._id });
  let completedGoals = 0;
  let goalsCompletedBeforeDeadline = 0;

  for (const goal of goals) {
    const resources = await Resource.find({ goalId: goal._id });
    if (resources.length === 0) continue;

    const allDone = resources.every(r => r.status === 'done');
    if (allDone) {
      completedGoals++;
      // check if completed before deadline
      if (goal.deadline && new Date() < new Date(goal.deadline)) {
        goalsCompletedBeforeDeadline++;
      }
    }
  }

  // ── 🎯 First Step — create first goal ──
  if (totalGoals >= 1) award('first_step', 1);

  // ── 📚 Resource Hunter ──
  if (totalResources >= 1)  award('resource_hunter', 1);
  if (totalResources >= 10) award('resource_hunter', 2);
  if (totalResources >= 25) award('resource_hunter', 3);

  // ── ⚡ Finisher ──
  if (completedResources >= 1)  award('finisher', 1);
  if (completedResources >= 10) award('finisher', 2);
  if (completedResources >= 25) award('finisher', 3);

  // ── 🔥 Streak ──
  if (user.currentStreak >= 3)  award('streak', 1);
  if (user.currentStreak >= 7)  award('streak', 2);
  if (user.currentStreak >= 30) award('streak', 3);

  // ── 🎓 Goal Crusher ──
  if (completedGoals >= 1) award('goal_crusher', 1);
  if (completedGoals >= 3) award('goal_crusher', 2);
  if (completedGoals >= 5) award('goal_crusher', 3);

  // ── ⏰ Ahead of Time ──
  if (goalsCompletedBeforeDeadline >= 1) award('ahead_of_time', 1);
  if (goalsCompletedBeforeDeadline >= 3) award('ahead_of_time', 2);

  // save user only if new badges were earned
  if (newBadges.length > 0) {
    await user.save();
  }

  return newBadges;
};