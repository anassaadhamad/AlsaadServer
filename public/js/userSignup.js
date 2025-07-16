document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signup-form");
  const signupButton = document.getElementById("signupButton");

  // Reference to the message div
  const signupMessage = document.getElementById("signupMessage");

  signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Capture form input values
    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Create a data object
    const userData = {
      name,
      username,
      email,
      password,
      passwordConfirm: confirmPassword,
    };

    // Send a POST request to your API endpoint for signup
    try {
      const response = await fetch("/api/v1/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        // Signup was successful
        // Display the success message to the user
        signupMessage.textContent = "Account created successfully!";
        signupMessage.style.color = "green";
        signupMessage.style.display = "block";
        signupMessage.style.marginTop = "20px";
      } else {
        // Handle other response statuses (e.g., validation errors)
        const data = await response.json();
        if (data.message) {
          // Display error messages to the user
          signupMessage.textContent = data.message;
          signupMessage.style.color = "red";
          signupMessage.style.display = "block";
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
});
