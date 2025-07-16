const mongoose = require("mongoose");

// Create a Mongoose schema for the "Offer" model
const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  startDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        // Check if startDate is before endDate
        return this.endDate ? value < this.endDate : true;
      },
      message: "Start date must be before the end date.",
    },
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        // Check if endDate is after startDate
        return this.startDate ? value > this.startDate : true;
      },
      message: "End date must be after the start date.",
    },
  },
  discountPercentage: {
    type: Number,
    required: false,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "الأدوات المنزلية",
      "المفروشات",
      "الملابس",
      "النجف والأباجورات",
      "التحف",
      "كل الأقسام",
    ],
  },
});

// Create a Mongoose model based on the schema
const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
