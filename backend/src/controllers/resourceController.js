import Goal from "../models/Goal.js";
import Resource from "../models/Resource.js";
import ActivityLog from '../models/ActivityLog.js';
import { updateStreak } from '../helpers/streakHelper.js';
import { checkBadges } from '../helpers/badgeHelper.js';

//resorce creation
export const createResource = async (req, res) => {
  try {
    const { goalId, title, url, type, totalUnits } = req.body;

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const resource = await Resource.create({
      userId: req.user._id,
      goalId: goalId,
      title: title,
      url: url,
      type: type,
      totalUnits: totalUnits || 0,
    });

    res.status(201).json(resource);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//resource deletion
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Resource.findByIdAndDelete(id);
    res.status(200).json({ message: 'Resource deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get a resource
export const getResource = async (req,res) => {
    try{
        const id = req.params.id;
        const resource = await Resource.findById(id);
        if(!resource){
            return res.status(404).json({ message: 'Resource not found' });
        }
        if (resource.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      res.status(200).json(resource);

        
    }catch(err){
        res.status(500).json({ message: err.message });
    }
}

//get all resources 
export const getResources = async (req,res) => {
    try {
        const id = req.user._id;
        const resources = await Resource.find({userId: id});
        res.status(200).json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

//progress updation
export const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { doneUnits } = req.body;

    // find resource
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // ownership check
    if (resource.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // validate doneUnits
    if (doneUnits > resource.totalUnits) {
      return res.status(400).json({ message: 'doneUnits cannot exceed totalUnits' });
    }

    if (doneUnits < resource.doneUnits) {
      return res.status(400).json({ message: 'Cannot decrement below saved progress' });
    }

    // derive status
    let status = 'saved';
    if (doneUnits === resource.totalUnits && doneUnits > 0) status = 'done';
    else if (doneUnits > 0) status = 'in-progress';

    // upsert activityLog only if positive progress
    const unitsDiff = doneUnits - resource.doneUnits;

    if (unitsDiff > 0) {
      const today = new Date().toISOString().split('T')[0];
      await ActivityLog.findOneAndUpdate(
        { userId: req.user._id, date: today },
        { $inc: { unitsCompleted: unitsDiff } },
        { upsert: true, new: true }
      );
    }

    resource.doneUnits = doneUnits;
    resource.status = status;
    await resource.save();

    const streak = await updateStreak(req.user);
    const newBadges = await checkBadges(req.user, 'progress');

    res.status(200).json({
    resource: {
        _id: resource._id,
        doneUnits: resource.doneUnits,
        status: resource.status,
        progress: resource.totalUnits > 0
        ? Math.round((resource.doneUnits / resource.totalUnits) * 100)
        : 0,
    },
    streak,
    newBadges,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//add a note
export const addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, flag } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Note text is required' });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      { $push: { notes: { text, flag: flag || null } } },
      { new: true }
    );

    const newNote = updatedResource.notes[updatedResource.notes.length - 1];
    res.status(201).json(newNote);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//delete a note
export const deleteNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Resource.findByIdAndUpdate(
      id,
      { $pull: { notes: { _id: noteId } } }
    );

    res.status(200).json({ message: 'Note deleted' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get resource by goal
export const getResourcesByGoal = async (req, res) => {
  
  try {
    const { goalId } = req.params;
    const resources = await Resource.find({ 
      userId: req.user._id,
      goalId: goalId 
    });
    res.status(200).json(resources);
  } catch (err) {
   
    res.status(500).json({ message: err.message });
  }
};
