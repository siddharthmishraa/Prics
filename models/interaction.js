// models/Interaction.js
import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: true,
    },
    type: {
      type: String,
      enum: ["view", "save"],
      default: "view",
    },
  },
  { timestamps: true }
);

// Make sure each (userId, imageId, type) is only stored once
interactionSchema.index({ userId: 1, imageId: 1, type: 1 }, { unique: true });

export default mongoose.models.Interaction || mongoose.model("Interaction", interactionSchema, "interactions");
