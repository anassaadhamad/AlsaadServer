const forms = document.querySelectorAll("form");
const fileInput = document.getElementById("file");
const fileLabel = document.getElementById("fileLabel");
const fileInput2 = document.getElementById("file2");
const fileLabel2 = document.getElementById("fileLabel2");

function showForm(form) {
  if (form) {
    form.style.display = "flex"; // Show the form
  }
}

async function getUserRole() {
  try {
    const response = await fetch("/api/v1/users/me");
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

function hideOrShowElements(userRole) {
  const showElements = document.querySelectorAll(".notes, .inventory");
  try {
    if (userRole === "admin" || userRole === "cashier") {
      showForm(forms[0]);
      showForm(forms[1]);
    }

    if (userRole === "customer") {
      showElements.forEach((element) => {
        element.style.display = "none";
      });
    } else {
      showElements.forEach((element) => {
        element.style.display = "table-cell";
      });
    }
  } catch (error) {
    console.error("Error while processing user role:", error);
    showElements.forEach((element) => {
      element.style.display = "none";
    });
  }
}

fileInput2.addEventListener("change", () => {
  if (fileInput2.files.length > 0) {
    forms[1].submit();
    const uploadMessage = document.getElementById("uploadMessage");
    uploadMessage.innerText = "Uploading Database...";
    uploadMessage.style.display = "block";
  }
});

fileLabel2.addEventListener("click", (e) => {
  e.preventDefault();
  fileInput2.click();
});

// Add event listeners for handling user role and initial state
window.addEventListener("productDataFound", () => {
  getUserRole().then(hideOrShowElements);
});

document.addEventListener("DOMContentLoaded", () => {
  getUserRole().then(hideOrShowElements);
});
