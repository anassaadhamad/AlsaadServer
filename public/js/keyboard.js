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

const icon = document.getElementById("toggleKeyboardButton");
const keyboard = document.getElementById("keyboard");

let isDragging = false;
let offset = { x: 0, y: 0 };

function snapToSide(x, y, element) {
  const iconWidth = element.offsetWidth;
  const iconHeight = element.offsetHeight;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const margin = 20; // الهامش من جميع الجهات
  const middleX = screenWidth / 2;

  // Snap أفقياً
  const snapX = x < middleX ? margin : screenWidth - iconWidth - margin;

  // Snap عمودياً مع ترك هامش علوي وسفلي
  const snapY = Math.min(
    Math.max(margin, y),
    screenHeight - iconHeight - margin
  );

  return { x: snapX, y: snapY };
}

// 🖱️ Mouse
icon.addEventListener("mousedown", (e) => {
  isDragging = true;
  offset.x = e.clientX - icon.getBoundingClientRect().left;
  offset.y = e.clientY - icon.getBoundingClientRect().top;
  e.preventDefault();

  // إزالة right/bottom المؤقتة عند السحب
  icon.style.right = "auto";
  icon.style.bottom = "auto";
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    icon.style.left = `${e.clientX - offset.x}px`;
    icon.style.top = `${e.clientY - offset.y}px`;
  }
});

document.addEventListener("mouseup", (e) => {
  if (isDragging) {
    const finalX = e.clientX - offset.x;
    const finalY = e.clientY - offset.y;
    const snapped = snapToSide(finalX, finalY, icon);

    icon.style.left = `${snapped.x}px`;
    icon.style.top = `${snapped.y}px`;
    icon.style.right = "auto";
    icon.style.bottom = "auto";

    isDragging = false;
  }
});

// 📱 Touch
icon.addEventListener("touchstart", (e) => {
  isDragging = true;
  const touch = e.touches[0];
  offset.x = touch.clientX - icon.getBoundingClientRect().left;
  offset.y = touch.clientY - icon.getBoundingClientRect().top;

  icon.style.right = "auto";
  icon.style.bottom = "auto";
});

document.addEventListener("touchmove", (e) => {
  if (isDragging) {
    const touch = e.touches[0];
    icon.style.left = `${touch.clientX - offset.x}px`;
    icon.style.top = `${touch.clientY - offset.y}px`;
  }
});

document.addEventListener("touchend", (e) => {
  if (isDragging) {
    const lastTouch = e.changedTouches[0];
    const finalX = lastTouch.clientX - offset.x;
    const finalY = lastTouch.clientY - offset.y;
    const snapped = snapToSide(finalX, finalY, icon);

    icon.style.left = `${snapped.x}px`;
    icon.style.top = `${snapped.y}px`;
    icon.style.right = "auto";
    icon.style.bottom = "auto";

    isDragging = false;
  }
});

icon.addEventListener("click", () => {
  keyboard.classList.toggle("show");
  icon.classList.toggle("keyboard-showing"); // Add this line
});
