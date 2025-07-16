const productCodeInput = document.getElementById("productCode");
const productCode2 = document.getElementById("productCode2");
const productName = document.getElementById("productName");
const balance = document.getElementById("balance");
const sellingPrice = document.getElementById("sellingPrice");
const sellingPrice1 = document.getElementById("sellingPrice1");
const sellingPrice2 = document.getElementById("sellingPrice2");
const notes = document.getElementById("notes");
const rowTotalPrice = document.getElementById("");
// const addToBasketButton = document.getElementById("addToBasket");
const clearAllButton = document.getElementById("clearAllBtn");
const printInvoiceButton = document.getElementById("printInvoiceBtn");

const groupSelect = document.getElementById("groupSelect");
const codePrefix = document.getElementById("prefix");
const keyboardLetters = document.querySelector(".keyboard-letters");

async function getUserRole() {
  try {
    const response = await fetch("/api/v1/users/me"); // Replace with the function to get the user's role
    const data = await response.json();

    if (data.status === "success" && data.data && data.data.data) {
      const userRole = data.data.data.role;

      return userRole;
    } else {
      console.error("Failed to retrieve user data");
      return null;
    }
  } catch (error) {
    console.error("Error while fetching user data:", error);
    return null;
  }
}

// Function to set the initial state of the navbar buttons
function setInitialNavbarState() {
  const logoutButton = document.querySelector(".logout");
  const loginButton = document.querySelector(".login");
  const signupButton = document.querySelector(".signup");

  // Assume the user is logged out initially
  logoutButton.style.display = "none";
  loginButton.style.display = "inline-block";
  signupButton.style.display = "inline-block";
}

// Call the function to set the initial state when the page loads
window.addEventListener("DOMContentLoaded", setInitialNavbarState);

// Function to fetch user data and update navbar
async function updateUserNavbar() {
  try {
    const userData = await getUserRole();
    const helloMessage = document.getElementById("helloMessage");
    const logoutButton = document.querySelector(".logout");
    const loginButton = document.querySelector(".login");
    const signupButton = document.querySelector(".signup");

    if (userData !== "customer" && userData !== null) {
      // User is logged in
      helloMessage.textContent = "مرحبًا " + userData;
      helloMessage.style.display = "block";
      logoutButton.style.display = "flex";
      loginButton.style.display = "none";
      signupButton.style.display = "none";
    } else {
      // User is logged out
      helloMessage.style.display = "none"; // Hide hello message if user is logged out
      logoutButton.style.display = "none";
      loginButton.style.display = "inline-block";
      signupButton.style.display = "inline-block";
    }
  } catch (error) {
    console.error("Error updating navbar:", error);
    // Handle the error: Show default state or log error
  }
}

// Call the function to update the navbar when the page loads
window.addEventListener("DOMContentLoaded", updateUserNavbar);

// Define a map of group values to prefixes
const groupPrefixMap = {
  التحف: "a-",
  "النجف والأباجورات": "b-",
  المفروشات: "c-",
  "الأدوات المنزلية": "e-",
  الملابس: "g-",
};

// Function to hide or show the letter row
function toggleLetterRow(display) {
  keyboardLetters.style.display = display;
}

// Add an event listener to the المجموعة select element
groupSelect.addEventListener("change", function () {
  const selectedValue = groupSelect.value;
  codePrefix.textContent = groupPrefixMap[selectedValue] || "";

  // Define an array of group values where you want to show the letter row
  const showLettersForGroups = ["يدوي", "باركود اسكانر"];

  // Check if the selected group is in the showLettersForGroups array
  if (showLettersForGroups.includes(selectedValue)) {
    toggleLetterRow("flex"); // Show the letter row
    productCodeInput.inputMode = "text";
  } else {
    toggleLetterRow("none"); // Hide the letter row
    productCodeInput.inputMode = "numeric";
  }

  // Focus on the input code
  productCodeInput.focus();
});

// Initialize the search text in the URL
const currentSearchText =
  new URLSearchParams(window.location.search).get("text") || "";

productCodeInput.value = currentSearchText;

function updateTableWithData(productData) {
  productCode2.textContent = productData.الكود;
  productName.textContent = productData.الاسم;
  balance.textContent = productData.الرصيد;
  notes.textContent = productData.الوصف || "لا يوجد";

  const sellingPrices = [
    { key: "سعر البيع", element: sellingPrice, thClass: "selling-price" },
    {
      key: "سعر قبل الخصم",
      element: sellingPrice1,
      thClass: "price-before-discount",
    },
    {
      key: "سعر بعد الخصم",
      element: sellingPrice2,
      thClass: "price-after-discount",
    },
  ];

  let priceAfterDiscountExists = false;

  sellingPrices.forEach(({ key, element, thClass }) => {
    const price = productData[key];
    if (price !== undefined && price !== null && price !== "0") {
      element.textContent = `${price} جنيه`;
      element.style.display = "";
      document.querySelector(`th.${thClass}`).style.display = ""; // Show the corresponding th
    } else {
      element.style.display = "none";
      document.querySelector(`th.${thClass}`).style.display = "none"; // Hide the corresponding th
    }

    if (key === "سعر بعد الخصم" && price && price !== "0") {
      priceAfterDiscountExists = true;
    }
  });

  if (priceAfterDiscountExists) {
    sellingPrice.style.display = "none";
    document.querySelector("th.selling-price").style.display = "none"; // Hide the corresponding th
  } else {
    sellingPrice.style.display = "";
    document.querySelector("th.selling-price").style.display = ""; // Show the corresponding th
  }
}

// Function to enable input event listener and disable change event listener
function enableInputEventListener() {
  productCodeInput.removeEventListener("change", handleProductCodeChange);
  productCodeInput.addEventListener("input", handleProductCodeInput);
}

// Function to enable change event listener and disable input event listener
function enableChangeEventListener() {
  productCodeInput.removeEventListener("input", handleProductCodeInput);
  productCodeInput.addEventListener("change", handleProductCodeChange);
}

// Event listener to handle changes in the selected option
groupSelect.addEventListener("change", function () {
  const selectedOption = groupSelect.value;

  if (selectedOption === "باركود اسكانر") {
    enableChangeEventListener();
  } else {
    enableInputEventListener();
  }
});

// Initialize event listener based on the default selected option
if (groupSelect.value === "باركود اسكانر") {
  enableChangeEventListener();
} else {
  enableInputEventListener();
}

// Input event listener for "يدوي"
function handleProductCodeInput() {
  const searchText = `${prefix.textContent}${productCodeInput.value}`;

  if (searchText) {
    const exactMatch = `^${searchText}$`;

    // Fetch the product data
    fetch(`/api/v1/products/search?text=${exactMatch}`)
      .then((response) => response.json())
      .then((data) => {
        if (
          data.status === "success" &&
          data.data &&
          data.data.products &&
          data.data.products.length > 0
        ) {
          const productData = data.data.products[0];
          updateTableWithData(productData);
        } else {
          resetToDefaultValues();
        }
      })
      .catch((error) => console.error("Error:", error));
  }
  // Check if prefix text content is not empty and prevent non-numeric input
  if (prefix.textContent !== "") {
    productCodeInput.value = productCodeInput.value.replace(/[^0-9]/g, "");
    if (productCodeInput.value.length > 4) {
      productCodeInput.value = "";
      resetToDefaultValues();
    }
  }
  if (productCodeInput.value.length > 6) {
    productCodeInput.value = "";
    resetToDefaultValues();
  }
}

// Change event listener for "باركود اسكانر"
function handleProductCodeChange() {
  const searchText = `${prefix.textContent}${productCodeInput.value}`;

  if (searchText) {
    const exactMatch = `^${searchText}$`;

    // Fetch the product data
    fetch(`/api/v1/products/search?text=${exactMatch}`)
      .then((response) => response.json())
      .then((data) => {
        if (
          data.status === "success" &&
          data.data &&
          data.data.products &&
          data.data.products.length > 0
        ) {
          const productData = data.data.products[0];
          updateTableWithData(productData);
        } else {
          resetToDefaultValues();
        }
      })
      .catch((error) => console.error("Error:", error));
  }
  // Check if prefix text content is not empty and prevent non-numeric input
  if (prefix.textContent !== "") {
    productCodeInput.value = productCodeInput.value.replace(/[^0-9]/g, "");
    if (productCodeInput.value.length > 4) {
      productCodeInput.value = "";
      resetToDefaultValues();
    }
  }
  if (productCodeInput.value.length > 6) {
    productCodeInput.value = "";
    resetToDefaultValues();
  }
}

productCodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const searchText = `${prefix.textContent}${productCodeInput.value}`;
    if (searchText) {
      const exactMatch = `^${searchText}$`;

      // Fetch the product data
      fetch(`/api/v1/products/search?text=${exactMatch}`)
        .then((response) => response.json())
        .then((data) => {
          if (
            data.status === "success" &&
            data.data &&
            data.data.products &&
            data.data.products.length > 0
          ) {
            const productData = data.data.products[0];

            // Create and dispatch a custom event with the product data as the detail
            const productDataFoundEvent = new CustomEvent("productDataFound", {
              detail: productData,
            });
            window.dispatchEvent(productDataFoundEvent);

            // Clear the input field
            productCodeInput.value = "";
          } else {
            productCodeInput.value = "";
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  }
});

// Focus on the input element when the page loads
productCodeInput.focus();

// Add an event listener to maintain focus when typing
document.addEventListener("keydown", (event) => {
  const target = event.target;

  // Check if the pressed key is not the number input
  if (target && !target.classList.contains("quantityInput")) {
    // Focus on the input element when any key is pressed
    productCodeInput.focus();
  }
});

// Prevent the input from triggering the global keydown event
productCodeInput.addEventListener("keydown", (event) => {
  event.stopPropagation();
});

function resetToDefaultValues() {
  productCode2.textContent = "لا يوجد";
  productName.textContent = "لا يوجد";
  balance.textContent = "0";
  sellingPrice.textContent = "0" + " جنيه";
  sellingPrice1.textContent = "0" + " جنيه";
  sellingPrice2.textContent = "0" + " جنيه";
  notes.textContent = "لا يوجد";
}

// addToBasketButton.addEventListener("click", () => {
//   // Simulate pressing the "Enter" key
//   const enterKeyEvent = new KeyboardEvent("keydown", {
//     key: "Enter",
//     code: "Enter",
//     which: 13,
//     keyCode: 13,
//     charCode: 13,
//   });

//   // Dispatch the "Enter" key event on the input field
//   productCodeInput.dispatchEvent(enterKeyEvent);
// });

// Function to print the invoice
function printInvoice() {
  // Open a new window for printing
  const printWindow = window.open("", "_blank");

  // Write the HTML content for the printable invoice
  const invoiceContent = `
  <html>
    <head>
      <title>طباعة فاتورة</title>
      <style>
        /* Add any additional styles for the printed invoice here */
        body {
          font-family: Arial, sans-serif;
          direction: rtl;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-weight: bold;
        }
        th, td {
          border: 1px dashed #000;
          padding: 8px;
          text-align: center;
        }
        th {
          background-color: #f2f2f2;
        }

        /* Responsive styles for smaller paper sizes */
        @media print {
          body {
            margin: 5px; /* Adjust the margin for smaller paper sizes */
            font-size: 10pt; /* Adjust the base font size for printing */
          }
          table {
            margin-top: 10px; /* Adjust the margin for smaller paper sizes */
            
          }
        }
      </style>
    </head>
    <body>
      <h2 style="font-size: 2rem; text-align: center;">مول السعد</h2>
      <table>
        <thead>
          <tr>
            <th>الكود</th>
            <th>الصنف</th>
            <th>سعر البيع</th>
            <th>الكمية</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${getInvoiceRows()}
          <tr>
            <td colspan="3" style="border: 0"></td>
            <td style="font-weight: bold; font-size: 14pt; color: #f00">${getTotalQuantity()}</td>
            <td style="font-weight: bold; font-size: 14pt; color: #f00">${
              document.getElementById("totalPrice").textContent
            } ج</td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
`;

  // Write the content to the new window and print it
  printWindow.document.write(invoiceContent);
  printWindow.document.close();
  printWindow.print();
}

// Function to get the total quantity
function getTotalQuantity() {
  const rows = historyTable.querySelectorAll("tr");
  let totalQuantity = 0;

  rows.forEach((row) => {
    const quantity = parseFloat(row.querySelector(".quantityInput").value);
    if (!isNaN(quantity)) {
      totalQuantity += quantity;
    }
  });

  return totalQuantity;
}

// Function to get HTML rows for the invoice
function getInvoiceRows() {
  const rows = historyTable.querySelectorAll("tr");
  let invoiceRows = "";

  rows.forEach((row) => {
    const code = row.querySelector("[data-label='الكود']").textContent;
    const name = row.querySelector("[data-label='إسم الصنف']").textContent;
    const price = row.querySelector("[data-label='سعر البيع']").textContent;
    const quantity = row.querySelector(".quantityInput").value;
    const total = row.querySelector(
      "[data-label='السعر الإجمالي']"
    ).textContent;

    invoiceRows += `
      <tr>
        <td>${code}</td>
        <td>${name}</td>
        <td>${price}</td>
        <td>${quantity}</td>
        <td>${total}</td>
      </tr>
    `;
  });

  return invoiceRows;
}

// Add click event listener to the print invoice button
document.getElementById("printInvoiceBtn").addEventListener("click", () => {
  printInvoice();
});

// Add click event listener to the download excel invoice button
document.addEventListener("DOMContentLoaded", () => {
  const downloadExcelBtn = document.getElementById("downloadExcelBtn");
  if (downloadExcelBtn) {
    downloadExcelBtn.addEventListener("click", () => {
      const rows = Array.from(document.querySelectorAll("#historyTable tr"));

      const productData = rows.map((row) => {
        const cells = row.querySelectorAll("td");

        return {
          الكود: cells[0].textContent.trim(), // Use trim() to remove leading/trailing whitespace
          الاسم: cells[1].textContent.trim(),
          الرصيد: cells[2].textContent.trim(),
          // "سعر البيع": cells[3].textContent.trim(),
          // "سعر قبل الخصم": cells[4].textContent.trim(),
          // "سعر بعد الخصم": cells[5].textContent.trim(),
          الكمية: cells[6].querySelector(".quantityInput").value.trim(), // Assuming .quantityInput exists
          // الوصف: cells[7].textContent.trim(),
        };
      });
      // console.log(JSON.stringify(productData));
      fetch("/api/v1/products/downloadExcel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: productData }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to download Excel file");
          }
          return response.blob();
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "invoice.xlsx";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error("Error downloading Excel file:", error);
          // Handle the error as needed
        });
    });
  }
});

// Add event listener for showing the tooltip on the warning icon
document.addEventListener("DOMContentLoaded", function () {
  const dangerIcon = document.querySelector(".fa-exclamation-circle");
  if (dangerIcon) {
    dangerIcon.addEventListener("mouseover", function () {
      // Show the tooltip when hovering over the warning icon
      if (dangerIcon.title) {
        alert(dangerIcon.title);
      }
    });
  }
});
