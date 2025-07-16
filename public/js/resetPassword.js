document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginButton = document.getElementById("loginButton");
  const loginMessage = document.getElementById("loginMessage");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Disable the submit button to prevent multiple submissions
    loginButton.disabled = true;

    // Extract the token from the URL path
    const token = extractTokenFromURL();

    // Get the new password and password confirm from the user
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;

    try {
      // Send a request to your server to reset the password
      const response = await fetch(`/api/v1/users/resetPassword/${token}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, passwordConfirm }),
      });

      const data = await response.json();

      if (response.status === 200 && data.status === "success") {
        // Show a success message to the user
        loginMessage.textContent = "Password Changed Successfully!";
        loginMessage.style.color = "green";
        setTimeout(function () {
          window.location.href = "/";
        }, 2000);
      } else {
        // Show an error message to the user
        loginMessage.textContent = data.message;
        loginMessage.style.color = "red";
      }

      loginMessage.style.display = "block";
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      // Re-enable the submit button
      loginButton.disabled = false;
    }
  });
});

// Function to extract the token from the URL path
function extractTokenFromURL() {
  const url = window.location.href;
  const token = url.substring(url.lastIndexOf("/") + 1);
  return token;
}
