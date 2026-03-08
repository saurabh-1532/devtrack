import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,   // "YYYY-MM-DD"
      required: true,
    },
    unitsCompleted: {
      type: Number,
      required: true,
      default: 0,
    },
  },
);

activityLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;