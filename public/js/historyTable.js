// Get the history table element
const historyTable = document.getElementById("historyTable");

// Create a new row in the search history table
function createNewRow(productData) {
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td data-label="الكود">${productData.الكود}</td>
    <td data-label="إسم الصنف">${productData.الاسم}</td>
    <td data-label="المخزون" class="inventory">${productData.الرصيد}</td>
    <td data-label="سعر البيع">${productData["سعر البيع"] || 0} ج</td>
    <td data-label="السعر قبل الخصم" style="text-decoration: line-through;">${
      productData["سعر قبل الخصم"] || 0
    } ج</td>
    <td data-label="السعر بعد الخصم">${productData["سعر بعد الخصم"] || 0} ج</td>
    <td data-label="الكمية">
      <div class="input-group">
        <button class="btn btn-outline-secondary quantity-btn" type="button" onclick="decreaseQuantity(this)">-</button>
        <input type="number" class="quantityInput form-control input-number text-center" style="min-width: 50px;" tabindex="-1" value="${getInitialQuantity(
          productData.الكود
        )}" min="1"/>
        <button class="btn btn-outline-secondary quantity-btn" type="button" onclick="increaseQuantity(this)">+</button>
      </div>
    </td>
    <td data-label="الملاحظات" class="notes">${
      productData.الوصف || "لا يوجد"
    }</td>
    <td data-label="السعر الإجمالي"></td>
    <td data-label="العمليات">
      <button class="delete-product">
        <i class="fas fa-trash-alt"></i>
      </button>
    </td>
  `;

  return newRow;
}

// Function to increase quantity
function increaseQuantity(button) {
  const input = button.parentNode.querySelector(".quantityInput");
  const currentValue = parseInt(input.value);
  input.value = currentValue + 1; // Increase the quantity

  // Manually trigger the input event
  const event = new Event("input");
  input.dispatchEvent(event);
}

// Function to decrease quantity
function decreaseQuantity(button) {
  const input = button.parentNode.querySelector(".quantityInput");
  const currentValue = parseInt(input.value);
  if (currentValue > 1) {
    input.value = currentValue - 1; // Decrease the quantity

    // Manually trigger the input event
    const event = new Event("input");
    input.dispatchEvent(event);
  }
}

// Function to get the initial quantity from local storage
function getInitialQuantity(productCode) {
  try {
    const savedProducts =
      JSON.parse(localStorage.getItem("savedProducts")) || [];
    const product = savedProducts.find(
      (product) => product.الكود === productCode
    );
    return product ? product.الكمية : 1;
  } catch (error) {
    console.error(
      "Error while getting initial quantity from local storage:",
      error
    );
    return 1; // Default to 1 in case of an error
  }
}

// Function to update the total price for a row with error handling
function updateRowTotalPrice(row) {
  try {
    const quantityInput = row.querySelector(".quantityInput");
    const priceCell = row.querySelector("[data-label='سعر البيع']");
    const secondPriceCell = row.querySelector("[data-label='السعر بعد الخصم']");
    const totalColumn = row.querySelector("[data-label='السعر الإجمالي']");

    if (!quantityInput || !priceCell || !totalColumn) {
      throw new Error("Missing required elements in the row.");
    }

    let price = parseFloat(priceCell.textContent);
    const quantity = parseFloat(quantityInput.value);

    // Check if سعر بعد الخصم exists and use it as the price if found
    if (secondPriceCell && secondPriceCell.textContent.trim() !== "0 ج") {
      const secondPrice = parseFloat(secondPriceCell.textContent);
      if (!isNaN(secondPrice)) {
        price = secondPrice;
      }
    }

    if (isNaN(price) || isNaN(quantity)) {
      totalColumn.textContent = 0 + " ج";
      throw new Error("Invalid price or quantity values.");
    }

    const totalPrice = price * quantity;

    if (isNaN(totalPrice)) {
      throw new Error("Invalid total price calculation.");
    }

    totalColumn.textContent = totalPrice.toFixed(2) + " ج";
  } catch (error) {
    console.error("Error in updateRowTotalPrice:", error);
    // You can handle the error by showing an alert or taking other appropriate actions.
  }
}

// Function to save data for a row to local storage
function saveDataForProduct(productData, quantity, total) {
  try {
    const savedProducts =
      JSON.parse(localStorage.getItem("savedProducts")) || [];
    const productIndex = savedProducts.findIndex(
      (product) => product.الكود === productData.الكود
    );

    if (productIndex !== -1) {
      savedProducts[productIndex].الكمية = quantity;
      savedProducts[productIndex].الإجمالي = total;
    } else {
      savedProducts.push({ ...productData, الكمية: quantity, الإجمالي: total });
    }

    localStorage.setItem("savedProducts", JSON.stringify(savedProducts));
  } catch (error) {
    console.error("Error while saving data to local storage:", error);
  }
}

// Function to update the total price and show a danger icon if any row has notes value
function updateTotalPrice() {
  const rows = historyTable.querySelectorAll("tr");
  let totalPrice = 0;
  let showWarningIcon = false;

  rows.forEach((row) => {
    const totalColumn = row.querySelector("[data-label='السعر الإجمالي']");
    totalPrice += parseFloat(totalColumn.textContent);

    const notesColumn = row.querySelector("[data-label='الملاحظات']");
    const notesValue = notesColumn.textContent.trim();

    if (notesValue && notesValue !== "لا يوجد") {
      showWarningIcon = true;
    } else {
    }
  });

  const totalPriceElement = document.getElementById("totalPrice");
  totalPriceElement.textContent = totalPrice.toFixed(2);

  // Add or remove the danger icon based on showWarningIcon
  const existingIcon = totalPriceElement.previousElementSibling;
  if (showWarningIcon) {
    if (!existingIcon) {
      const warningIcon = document.createElement("i");
      warningIcon.classList.add("fas", "fa-exclamation-circle", "text-warning");
      totalPriceElement.insertAdjacentElement("beforebegin", warningIcon);

      $(function () {
        $('[data-toggle="tooltip"]').tooltip();
      });
    }
  } else {
    if (existingIcon) {
      totalPriceElement.parentNode.removeChild(existingIcon);
    }
  }
}

// Function to add a new row or update quantity for an existing row in the history table
function addProductToHistoryTable(productData) {
  // Check if a row with the same code already exists
  const existingRow = findRowByProductCode(productData.الكود);

  if (existingRow) {
    const quantityInput = existingRow.querySelector(".quantityInput");
    const currentQuantity = parseFloat(quantityInput.value);
    quantityInput.value = currentQuantity + 1; // Increase the quantity

    // Move the existing row to the top
    historyTable.prepend(existingRow);

    updateRowTotalPrice(existingRow);
    updateTotalPrice();
    saveDataForProduct(
      productData,
      parseFloat(quantityInput.value),
      parseFloat(
        existingRow.querySelector("[data-label='السعر الإجمالي']").textContent
      )
    );

    // Check if price after discount exists
    const priceAfterDiscountCell = existingRow.querySelector(
      "[data-label='السعر بعد الخصم']"
    );
    if (priceAfterDiscountCell.textContent !== "0 ج") {
      // Price after discount exists
      existingRow.querySelector("[data-label='سعر البيع']").style.color = "red"; // Set selling price to red
      existingRow.querySelector("[data-label='سعر البيع']").style.fontWeight =
        "bold"; // Set font weight to bold
      priceAfterDiscountCell.style.color = "green"; // Set price after discount to green
      priceAfterDiscountCell.style.fontWeight = "bold"; // Set font weight to bold
    } else {
      // Price after discount does not exist
      existingRow.querySelector("[data-label='سعر البيع']").style.color =
        "green"; // Set selling price to green
      existingRow.querySelector("[data-label='سعر البيع']").style.fontWeight =
        "bold"; // Set font weight to bold
      priceAfterDiscountCell.style.color = "red"; // Set price after discount to red
      priceAfterDiscountCell.style.fontWeight = "bold"; // Set font weight to bold
    }

    // Set price before discount always to red
    existingRow.querySelector("[data-label='السعر قبل الخصم']").style.color =
      "red";
  } else {
    const newRow = createNewRow(productData);
    historyTable.prepend(newRow);

    const quantityInput = newRow.querySelector(".quantityInput");
    const deleteButton = newRow.querySelector(".delete-product");

    // Save data for the new product immediately after adding it to the table
    saveDataForProduct(
      productData,
      parseFloat(quantityInput.value),
      parseFloat(
        newRow.querySelector("[data-label='السعر الإجمالي']").textContent
      )
    );

    quantityInput.addEventListener("input", () => {
      updateRowTotalPrice(newRow);
      saveDataForProduct(
        productData,
        parseFloat(quantityInput.value),
        parseFloat(
          newRow.querySelector("[data-label='السعر الإجمالي']").textContent
        )
      );
      updateTotalPrice();
    });

    deleteButton.addEventListener("click", () => {
      deleteProductFromHistoryTable(newRow, productData);
    });

    updateRowTotalPrice(newRow);
    updateTotalPrice();

    // Check if price after discount exists
    const priceAfterDiscountCell = newRow.querySelector(
      "[data-label='السعر بعد الخصم']"
    );
    if (priceAfterDiscountCell.textContent !== "0 ج") {
      // Price after discount exists
      newRow.querySelector("[data-label='سعر البيع']").style.color = "red"; // Set selling price to red
      newRow.querySelector("[data-label='سعر البيع']").style.fontWeight =
        "bold"; // Set font weight to bold
      priceAfterDiscountCell.style.color = "green"; // Set price after discount to green
      priceAfterDiscountCell.style.fontWeight = "bold"; // Set font weight to bold
    } else {
      // Price after discount does not exist
      newRow.querySelector("[data-label='سعر البيع']").style.color = "green"; // Set selling price to green
      newRow.querySelector("[data-label='سعر البيع']").style.fontWeight =
        "bold"; // Set font weight to bold
      priceAfterDiscountCell.style.color = "red"; // Set price after discount to red
      priceAfterDiscountCell.style.fontWeight = "bold"; // Set font weight to bold
    }

    // Set price before discount always to red
    newRow.querySelector("[data-label='السعر قبل الخصم']").style.color = "red";
    newRow.querySelector("[data-label='السعر قبل الخصم']").style.fontWeight =
      "bold"; // Set font weight to bold
  }
}

// Function to find a row by product code
function findRowByProductCode(productCode) {
  const rows = historyTable.querySelectorAll("tr");
  for (const row of rows) {
    const productCodeCell = row.querySelector("[data-label='الكود']");
    if (productCodeCell.textContent === productCode) {
      return row;
    }
  }
  return null;
}

// Function to delete a product row from the history table
function deleteProductFromHistoryTable(row, productData) {
  historyTable.removeChild(row);
  updateLocalStorageOnDelete(productData.الكود);
  updateTotalPrice();
}

// Function to update local storage when a product is deleted
function updateLocalStorageOnDelete(productCode) {
  try {
    const savedProducts =
      JSON.parse(localStorage.getItem("savedProducts")) || [];
    const updatedProducts = savedProducts.filter(
      (product) => product.الكود !== productCode
    );
    localStorage.setItem("savedProducts", JSON.stringify(updatedProducts));
  } catch (error) {
    console.error("Error while updating local storage on delete:", error);
  }
}

// Function to clear the invoice (remove all rows)
function clearInvoice() {
  try {
    historyTable.innerHTML = "";
    localStorage.removeItem("savedProducts");
    updateTotalPrice();
  } catch (error) {
    console.error("Error while clearing the invoice:", error);
    // Handle the error or inform the user about it.
  }
}

// Event listener for clearing the invoice
// Add a click event listener for the confirmation button
document.getElementById("confirmClearInvoice").addEventListener("click", () => {
  clearInvoice(); // Call the clearInvoice function when confirmed
  $("#confirmationModal").modal("hide"); // Close the confirmation modal
});

window.addEventListener("productDataFound", (event) => {
  const productData = event.detail;
  addProductToHistoryTable(productData);
  updateTotalPrice();
});

window.addEventListener("load", () => {
  try {
    const savedProducts =
      JSON.parse(localStorage.getItem("savedProducts")) || [];
    savedProducts.forEach((productData) => {
      addProductToHistoryTable(productData);
    });
  } catch (error) {
    console.error(
      "Error while loading saved products from local storage:",
      error
    );
    // Handle the error or inform the user about it.
  }
});
