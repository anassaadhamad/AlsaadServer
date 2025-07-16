const Product = require(`${__dirname}/../models/productModel`);
const catchAsync = require(`${__dirname}/catchAsync`);

const removeAllProductsMiddleware = catchAsync(async (req, res, next) => {
  try {
    const result = await Product.deleteMany(); // This will remove all documents in the collection
    console.log(`${result.deletedCount} documents were removed.`);
    next(); // Proceed to the next middleware or route
  } catch (error) {
    console.error("Error removing documents:", error);
    return res.status(500).json({ message: "Error removing documents." });
  }
});

module.exports = removeAllProductsMiddleware;
