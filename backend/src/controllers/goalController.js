import Goal from "../models/Goal.js";
import Resource from "../models/Resource.js";


//creation
export const createGoal = async (req, res) => {
    try{
        const {name,deadlineDays,emoji} = req.body;
        const deadline = deadlineDays 
        ? new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000)
        : null
       
        const goal = await Goal.create({
            userId : req.user._id,
            name : name,
            emoji : emoji,
            deadlineDays:deadlineDays,
            deadline : deadline
        })
        res.status(201).json(goal);
    }catch(err){
        res.status(500).json({ message: err.message })
    }
}


//delete a goal
export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Goal.findByIdAndDelete(id);
    await Resource.deleteMany({ goalId: id });

    res.status(200).json({ message: 'Goal deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE all goals
export const deleteAllGoals = async (req, res) => {
  try {
    const userId = req.user.id;

    // delete all resources belonging to user's goals
    await Resource.deleteMany({ userId });

    // delete all goals
    await Goal.deleteMany({ userId });

    res.json({ message: 'All goals and resources deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//get all goals
export const getGoals = async (req, res) => {
  try {
    const id = req.user._id;

    const goals = await Goal.find({ userId: id });
    const resources = await Resource.find({ userId: id });

    const goalsWithStats = goals.map(goal => {
      const goalResources = resources.filter(r => r.goalId.toString() === goal._id.toString());

      const resourceCount = goalResources.length;

      const progress = resourceCount > 0
        ? Math.round(goalResources.reduce((sum, r) => {
            return sum + (r.totalUnits > 0 ? (r.doneUnits / r.totalUnits) * 100 : 0)
          }, 0) / resourceCount)
        : 0;

      const daysRemaining = goal.deadline
        ? Math.ceil((new Date(goal.deadline) - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...goal.toObject(),
        resourceCount,
        progress,
        daysRemaining,
      };
    });

    res.status(200).json(goalsWithStats);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get single goal
export const getGoal = async (req,res) => {
    try{
        const id = req.params.id;
        const goal = await Goal.findById(id);
        if(!goal){
            return res.status(404).json({ message: 'Goal not found' });
        }

        if (goal.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
         }
         const resources = await Resource.find({ goalId: id });
         const daysRemaining = goal.deadline
      ? Math.ceil((new Date(goal.deadline) - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    const progress = resources.length > 0
      ? Math.round(resources.reduce((sum, r) => {
          return sum + (r.totalUnits > 0 ? (r.doneUnits / r.totalUnits) * 100 : 0)
        }, 0) / resources.length)
      : 0;

    res.status(200).json({
      ...goal.toObject(),
      resources,
      progress,
      daysRemaining,
    });

    }catch(err){
        res.status(500).json({ message: err.message });
    }
}