document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.getElementById("registerForm");
    const registerMessage = document.getElementById("registerMessage");

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            registerMessage.textContent = "Passwords do not match!";
            registerMessage.style.color = "red";
            return;
        }

        const user = {
            name: name,
            email: email,
            password: password
        };

        localStorage.setItem("registeredUser", JSON.stringify(user));

        registerMessage.textContent = "Registration successful!";
        registerMessage.style.color = "green";

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1000);
    });

});