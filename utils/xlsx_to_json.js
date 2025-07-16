// xlsxToJsonMiddleware.js
const xlsxj = require("xlsx-to-json");
const catchAsync = require(`${__dirname}/catchAsync`);

const xlsxToJsonMiddleware = catchAsync(async (req, res, next) => {
  xlsxj(
    {
      input: `${__dirname}/../uploads/products.xlsx`,
      output: `${__dirname}/../uploads/products.json`,
    },
    function (err, result) {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Error converting XLSX to JSON." });
      } else {
        console.log("Converted to json");
        req.jsonData = result; // Attach the JSON data to the request object
        next(); // Proceed to the next middleware or route
      }
    }
  );
});

module.exports = xlsxToJsonMiddleware;
