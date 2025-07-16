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
  "سعر قبل الخصم": {
    type: String,
  },
  "سعر بعد الخصم": {
    type: String,
  },
});

Product = mongoose.model("Product", productSchema);

module.exports = Product;
