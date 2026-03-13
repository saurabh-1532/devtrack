import Resource from "../models/Resource.js";
import Goal from "../models/Goal.js";
import User from "../models/User.js";

// DELETE user
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // cascade delete everything
    await Resource.deleteMany({ userId });
    await Goal.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};



export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // get all goals
    const allGoals = await Goal.find({ userId });
    const totalGoals = allGoals.length;

    // a goal is complete when all its resources are done
    let completedGoals = 0;
    for (const goal of allGoals) {
      const total = await Resource.countDocuments({ userId, goalId: goal._id });
      const done  = await Resource.countDocuments({ userId, goalId: goal._id, status: 'done' });
      if (total > 0 && total === done) completedGoals++;
    }

    const [totalResources, completedResources] = await Promise.all([
      Resource.countDocuments({ userId }),
      Resource.countDocuments({ userId, status: 'done' }),
    ]);

    // streak from user document
    const user = await User.findById(userId).select('currentStreak longestStreak');

    res.json({
      totalGoals,
      completedGoals,
      totalResources,
      completedResources,
      currentStreak: user?.currentStreak  || 0,
      longestStreak: user?.longestStreak  || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};