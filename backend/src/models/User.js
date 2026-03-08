import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: String,  
    },
    badges: [
      {
        id:       { type: String },
        tier:     { type: Number },
        earnedAt: { type: Date },
      }
    ],
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;