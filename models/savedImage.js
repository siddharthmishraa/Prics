import mongoose from "mongoose";

const SavedImageSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

export default mongoose.models.SavedImage || mongoose.model("SavedImage", SavedImageSchema);
