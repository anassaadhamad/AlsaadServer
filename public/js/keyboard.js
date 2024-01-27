// keyboard.js

document.getElementById("keyboard").addEventListener("click", function (event) {
  const target = event.target;

  if (target.classList.contains("key")) {
    const key = target.getAttribute("data-key");
    if (key) {
      addToInput(key);
    }

    const action = target.getAttribute("data-action");
    if (action === "deleteLastCharacter") {
      deleteLastCharacter();
    } else if (action === "clearInputField") {
      clearInputField();
    } else if (action === "enter") {
      performEnterAction();
    }
  }
});

function addToInput(value) {
  const inputField = document.getElementById("productCode");
  inputField.value += value;

  // Trigger the input event to listen for changes
  const event = new Event("input", {
    bubbles: true,
    cancelable: true,
  });
  inputField.dispatchEvent(event);
}

function deleteLastCharacter() {
  const inputField = document.getElementById("productCode");
  const currentText = inputField.value;
  inputField.value = currentText.substring(0, currentText.length - 1);

  // Trigger the input event to listen for changes
  const event = new Event("input", {
    bubbles: true,
    cancelable: true,
  });
  inputField.dispatchEvent(event);
}

function clearInputField() {
  const inputField = document.getElementById("productCode");
  inputField.value = ""; // Clear the input field
  inputField.dispatchEvent(new Event("input"));

  // Trigger the input event to listen for changes
  const event = new Event("input", {
    bubbles: true,
    cancelable: true,
  });
  inputField.dispatchEvent(event);
}

function performEnterAction() {
  const inputField = document.getElementById("productCode");

  // Create a new "Enter" key press event
  const enterKeyEvent = new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    which: 13,
    keyCode: 13,
    bubbles: true,
    cancelable: true,
  });

  // Dispatch the event on the input field
  inputField.dispatchEvent(enterKeyEvent);
}

const toggleKeyboardButton = document.getElementById("toggleKeyboardButton");
const keyboard = document.getElementById("keyboard");

toggleKeyboardButton.addEventListener("click", () => {
  keyboard.classList.toggle("show");
  toggleKeyboardButton.classList.toggle("keyboard-showing"); // Add this line
});
