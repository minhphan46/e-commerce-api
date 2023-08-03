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

// when add a review, update averageRating and numOfReviews in Product model
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating",
        },
        numOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);
  // update product model
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0].averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Review", ReviewSchema);
