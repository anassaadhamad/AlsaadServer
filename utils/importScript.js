const Product = require(`${__dirname}/../models/productModel`);
const fs = require("fs");
const path = require("path");
const catchAsync = require(`${__dirname}/catchAsync`);

const importDataMiddleware = catchAsync(async (req, res, next) => {
  // Assuming req.jsonData is a JavaScript object, not a JSON string
  const data = req.jsonData;

  try {
    // Insert the data into the database
    await Product.insertMany(data);
    res.send("Good");
    res.json({
      message: `Successfully imported products`, // use result.length to get the number of inserted products
    });
  } catch (error) {
    console.error("Error importing data:", error);
    return res.status(500).json({ message: "Error importing data" });
  }
});

module.exports = importDataMiddleware;
