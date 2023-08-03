const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      minh: 1,
      max: 5,
      required: [true, "Please provide a rating between 1 and 5"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
      required: [true, "Please provide a title for the review"],
    },
    comment: {
      type: String,
      required: [true, "Please provide a comment for the review"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
