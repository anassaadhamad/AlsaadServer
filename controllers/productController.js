const factory = require(`${__dirname}/handlerFactory`);
const Product = require(`${__dirname}/../models/productModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const AppError = require(`${__dirname}/../utils/appError`);
const fs = require("fs");
const multer = require("multer");
const xlsxj = require("xlsx-to-json");
const XLSX = require("xlsx");

exports.getAllProducts = factory.getAll(Product);
exports.getProduct = factory.getOne(Product);
exports.createProduct = factory.createOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);

exports.searchProducts = catchAsync(async (req, res, next) => {
  const searchText = req.query.text; // Retrieve the search text from the query parameters

  if (searchText) {
    // Define which fields to select based on the user's role
    let selectFields = [];

    if (
      req.user.role === "admin" ||
      req.user.role === "cashier" ||
      req.user.role === "user"
    ) {
      selectFields.push(
        "الكود",
        "الاسم",
        "سعر البيع",
        "سعر قبل الخصم",
        "سعر بعد الخصم",
        "الرصيد",
        "الوصف"
      );
    } else if (req.user.role === "customer") {
      // Customers have restricted access
      selectFields.push(
        "الكود",
        "الاسم",
        "سعر البيع",
        "سعر قبل الخصم",
        "سعر بعد الخصم"
      );
    } else {
      // Guests have no access
      return next(
        new AppError("You are not allowed to search for products", 401)
      );
    }

    // Use a regular expression to perform a case-insensitive search
    const products = await Product.find({
      $or: [
        { الكود: { $regex: searchText, $options: "i" } }, // Search in the code field
        // { الاسم: { $regex: searchText, $options: "i" } }, // Search in the name field
      ],
    }).select(selectFields); // Select the fields based on the user's role

    if (products.length > 0) {
      res.status(200).json({
        status: "success",
        data: {
          products,
        },
      });
    } else {
      return next(
        new AppError("No products found for the given search text", 404)
      );
    }
  } else {
    return next(new AppError("Invalid search parameter", 400));
  }
});

exports.uploadProducts = catchAsync(async (req, res, next) => {
  // Define a storage engine for multer to use
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Store uploaded files in the "uploads" directory
    },
    filename: (req, file, cb) => {
      cb(null, "products.xlsx");
    },
  });

  // Initialize multer with the defined storage engine
  const upload = multer({ storage });

  upload.single("file")(req, res, (err) => {
    if (err) {
      return next(new AppError("No file was uploaded.", 400));
    } else {
      console.log("File Uploaded");
      next();
    }
  });
});

exports.convertProducts = catchAsync(async (req, res, next) => {
  xlsxj(
    {
      input: `${__dirname}/../uploads/products.xlsx`,
      output: `${__dirname}/../uploads/products.json`,
    },
    function (err, result) {
      if (err) {
        console.error(err);
        return next(new AppError("Error converting XLSX to JSON.", 500));
      } else {
        console.log("Converted to json");
        req.jsonData = result; // Attach the JSON data to the request object
        next();
      }
    }
  );
});

exports.removeAllProducts = catchAsync(async (req, res, next) => {
  try {
    const result = await Product.deleteMany(); // This will remove all documents in the collection
    console.log(`${result.deletedCount} documents were removed.`);
    res.status(200).json({
      message: "All products deleted successfully",
    });
  } catch (error) {
    console.error("Error removing documents:", error);
    return next(new AppError("Error removing documents.", 500));
  }
});

exports.importProducts = catchAsync(async (req, res, next) => {
  // Assuming req.jsonData is a JavaScript object, not a JSON string
  const data = JSON.parse(
    fs.readFileSync(`${__dirname}/../uploads/products.json`, "utf-8")
  );

  // const data = req.jsonData;

  try {
    // Insert the data into the database
    await Product.insertMany(data);
    res.json({
      message: `Successfully imported products`, // use result.length to get the number of inserted products
    });
  } catch (error) {
    console.error("Error importing data:", error);
    return next(new AppError("Error importing data", 500));
  }
});

exports.downloadExcelMiddleware = catchAsync(async (req, res, next) => {
  try {
    // Assuming the data is passed in the request body as an array of product objects
    const rows = req.body.data; // Assuming the data is passed in the request body
    if (!rows || !Array.isArray(rows)) {
      throw new Error("Data is missing or not in the expected format");
    }

    // Create a new array to hold the rows of data for the Excel sheet
    const data = [];

    // Iterate through each product and extract the data for each row
    rows.forEach((product) => {
      const rowData = {
        الكود: product.الكود,
        الاسم: product.الاسم,
        الرصيد: product.الرصيد,
        // "سعر البيع": product["سعر البيع"],
        // "سعر قبل الخصم": product["سعر قبل الخصم"],
        // "سعر بعد الخصم": product["سعر بعد الخصم"],
        الكمية: product.الكمية,
        // الوصف: product.الوصف,
      };

      // Add the rowData object to the data array
      data.push(rowData);
    });

    // Convert data to Excel format
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice");

    // Convert workbook to buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    // Send the Excel file as response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=invoice.xlsx");
    res.send(excelBuffer);
  } catch (error) {
    console.error("Error generating Excel file:", error);
    return next(new AppError("Error generating Excel file.", 500));
  }
});
