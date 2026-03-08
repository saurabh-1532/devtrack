import User from "../models/User.js"


export const updateStreak = async (user) => {
  const today = new Date().toISOString().split('T')[0];

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  if (user.lastActiveDate === today) {
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    };
  }

  
  if (user.lastActiveDate === yesterday) {
    user.currentStreak++;
  } else {
    
    user.currentStreak = 1;
  }

  
  if (user.currentStreak > user.longestStreak) {
    user.longestStreak = user.currentStreak;
  }

  
  user.lastActiveDate = today;

  await user.save();

  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
  };
};