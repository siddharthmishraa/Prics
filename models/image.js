import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  creator_profile: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  mood: [
    {
      type: String,
      trim: true,
    }
  ],
  imgUrl: {
    type: String,
    required: true,
  },
  saves: [
    {
      type: String,
      ref: "User",
    }
  ]
}, {
  timestamps: true,
});

export default mongoose.models.Image || mongoose.model("Image", imageSchema, "images");
