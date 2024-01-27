const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  الكود: {
    type: String,
    unique: true,
  },
  الاسم: {
    type: String,
  },
  الوصف: {
    type: String,
  },
  الرصيد: {
    type: String,
  },
  "سعر البيع": {
    type: String,
  },
});

Product = mongoose.model("Product", productSchema);

module.exports = Product;
