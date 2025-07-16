document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const loginButton = document.getElementById("loginButton");
  const loginMessage = document.getElementById("loginMessage");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Disable the submit button to prevent multiple submissions
    loginButton.disabled = true;

    // Get the email entered by the user
    const email = emailInput.value;

    try {
      // Send a request to your server to initiate the password reset process
      const response = await fetch("/api/v1/users/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 200 && data.status === "success") {
        // Show a success message to the user
        loginMessage.textContent = data.message;
        loginMessage.style.color = "green";
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
