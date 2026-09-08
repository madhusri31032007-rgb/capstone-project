document.addEventListener("DOMContentLoaded", function () {

    // Login form
    const loginForm = document.getElementById("loginForm");

    // Message area
    const message = document.getElementById("loginMessage");

    // Check form exists
    if (!loginForm) {
        console.log("Login form not found.");
        return;
    }

    loginForm.addEventListener("submit", function (event) {

        // Stop page refresh
        event.preventDefault();

        // Get email and password
        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        // Get registered users
        const users =
            JSON.parse(localStorage.getItem("users")) || [];

        // Find matching user
        const user = users.find(function (account) {

            return (
                account.email === email &&
                account.password === password
            );

        });

        // Wrong login
        if (!user) {

            message.textContent =
                "Invalid email or password.";

            return;
        }

        // Save logged-in user
        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(user)
        );

        // Success message
        message.textContent =
            "Login successful!";

        // Go to Dashboard
        setTimeout(function () {

            window.location.href =
                "dashboard.html";

        }, 500);

    });

});