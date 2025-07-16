const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const XLSX = require("xlsx");

const downloadExcelMiddleware = catchAsync(async (req, res, next) => {
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

module.exports = downloadExcelMiddleware;
