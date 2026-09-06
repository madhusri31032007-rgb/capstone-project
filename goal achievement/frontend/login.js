document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        // Get registered user from localStorage
        const storedUser = localStorage.getItem("registeredUser");

        // Check whether user is registered
        if (!storedUser) {
            loginMessage.textContent = "No registered account found. Please register first.";
            loginMessage.style.color = "red";
            return;
        }

        const user = JSON.parse(storedUser);

        // Check email and password
        if (email === user.email && password === user.password) {

            loginMessage.textContent = "Login successful!";
            loginMessage.style.color = "green";

            // Save login status
            localStorage.setItem("isLoggedIn", "true");

            // Go to dashboard
            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 1000);

        } else {

            loginMessage.textContent = "Invalid email or password!";
            loginMessage.style.color = "red";

        }

    });

});