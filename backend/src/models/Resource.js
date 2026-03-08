import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    flag: {
      type: String,
      enum: ['revision', null],
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
);

const resourceSchema = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['video', 'docs', 'project', 'article'],
      required: true,
    },
    totalUnits: {
      type: Number,
      default: 0,
    },
    doneUnits: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['saved', 'in-progress', 'done'],
      default: 'saved',
    },
    notes: [noteSchema],
  },
  { timestamps: true }
);

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;