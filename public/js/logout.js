const logoutButton = document.querySelector(".logout");

// Get the modal and the confirm button
const logoutModal = document.getElementById("logoutModal");
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

// Add event listener to the logout button to show the modal
logoutButton.addEventListener("click", () => {
  // Show the modal
  const bootstrapModal = new bootstrap.Modal(logoutModal);
  bootstrapModal.show();
});

// Add event listener to the confirm logout button
confirmLogoutBtn.addEventListener("click", async () => {
  try {
    // Make a request to logout endpoint
    await fetch("/api/v1/users/logout", {
      method: "GET",
      credentials: "same-origin", // Send cookies
    });

    // Refresh the page
    window.location.reload();

    // Hide the logout button
    logoutButton.style.display = "none";
  } catch (error) {
    console.error("Error logging out:", error);
  }
});
