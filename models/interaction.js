import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imageId: { type: mongoose.Schema.Types.ObjectId, ref: "Image", required: true },
    type: { type: String, enum: ["view", "save"], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Interaction || mongoose.model("Interaction", interactionSchema);
