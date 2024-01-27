const productCodeInput = document.getElementById("productCode");
const productCode2 = document.getElementById("productCode2");
const productName = document.getElementById("productName");
const balance = document.getElementById("balance");
const sellingPrice = document.getElementById("sellingPrice");
const notes = document.getElementById("notes");
const rowTotalPrice = document.getElementById("");
const addToBasketButton = document.getElementById("addToBasket");
const clearAllButton = document.getElementById("clearAllBtn");

const groupSelect = document.getElementById("groupSelect");
const codePrefix = document.getElementById("prefix");
const keyboardLetters = document.querySelector(".keyboard-letters");

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
  const showLettersForGroups = ["يدوي"];

  // Check if the selected group is in the showLettersForGroups array
  if (showLettersForGroups.includes(selectedValue)) {
    toggleLetterRow("flex"); // Show the letter row
    productCodeInput.inputMode = "text";
  } else {
    toggleLetterRow("none"); // Hide the letter row
    productCodeInput.inputMode = "numeric";
  }
});

// Initialize the search text in the URL
const currentSearchText =
  new URLSearchParams(window.location.search).get("text") || "";

productCodeInput.value = currentSearchText;

function updateTableWithData(productData) {
  productCode2.textContent = productData.الكود;
  productName.textContent = productData.الاسم;
  balance.textContent = productData.الرصيد;
  sellingPrice.textContent = productData["سعر البيع"] + " جنيه";

  if (!productData.الوصف || productData.الوصف === "") {
    notes.textContent = "لا يوجد";
  } else {
    notes.textContent = productData.الوصف;
  }
}

productCodeInput.addEventListener("input", () => {
  // Your existing code for updating the search table
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
});

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
  notes.textContent = "لا يوجد";
}

addToBasketButton.addEventListener("click", () => {
  // Simulate pressing the "Enter" key
  const enterKeyEvent = new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    which: 13,
    keyCode: 13,
    charCode: 13,
  });

  // Dispatch the "Enter" key event on the input field
  productCodeInput.dispatchEvent(enterKeyEvent);
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
