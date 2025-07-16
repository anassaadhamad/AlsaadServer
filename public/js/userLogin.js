const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
  };

  try {
    const response = await fetch("/api/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      // Login was successful
      loginMessage.textContent = "Login successful!";
      loginMessage.style.color = "green";
      loginMessage.style.display = "block";
      setTimeout(function () {
        window.location.href = "/";
      }, 200);
    } else {
      const data = await response.json();
      if (data.message) {
        // Display error messages to the user
        loginMessage.textContent = data.message;
        loginMessage.style.color = "red";
        loginMessage.style.display = "block";
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
