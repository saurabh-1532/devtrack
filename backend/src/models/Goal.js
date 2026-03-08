import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    emoji: {
      type: String,
      default: '🎯',
    },
    deadlineDays: {
      type: Number,
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;