// ========================================
// Personal Goal Achievement Platform
// Main JavaScript File
// ========================================

console.log("Personal Goal Achievement Platform loaded successfully.");


// ========================================
// Login Page
// ========================================

if (document.title.includes("Login")) {

    const loginForm = document.querySelector("form");

    if (loginForm) {

        loginForm.addEventListener("submit", function(event) {

            event.preventDefault();

            alert("Login successful!");

            window.location.href = "dashboard.html";

        });

    }
}


// ========================================
// Register Page
// ========================================

if (document.title.includes("Register")) {

    const registerForm = document.querySelector("form");

    if (registerForm) {

        registerForm.addEventListener("submit", function(event) {

            event.preventDefault();

            const passwordInputs =
                registerForm.querySelectorAll('input[type="password"]');

            if (
                passwordInputs.length >= 2 &&
                passwordInputs[0].value !== passwordInputs[1].value
            ) {

                alert("Passwords do not match!");

                return;
            }

            alert("Account created successfully!");

            window.location.href = "login.html";

        });

    }
}


// ========================================
// Goals Page
// ========================================

if (document.title.includes("My Goals")) {

    const goalForm = document.querySelector("form");

    if (goalForm) {

        goalForm.addEventListener("submit", function(event) {

            event.preventDefault();

            alert("Goal added successfully!");

            goalForm.reset();

        });

    }
}


// ========================================
// Tasks Page
// ========================================

if (document.title.includes("My Tasks")) {

    const taskForm = document.querySelector("form");

    if (taskForm) {

        taskForm.addEventListener("submit", function(event) {

            event.preventDefault();

            alert("Task added successfully!");

            taskForm.reset();

        });

    }


    const completeButton =
        document.querySelector(".task-card button");

    if (completeButton) {

        completeButton.addEventListener("click", function() {

            alert("Task marked as completed!");

            const status =
                document.querySelector(".task-status");

            if (status) {

                status.textContent = "Completed";

            }

        });

    }
}


// ========================================
// Settings Page
// ========================================

if (document.title.includes("Settings")) {

    const saveButton =
        document.querySelector(".save-button");

    if (saveButton) {

        saveButton.addEventListener("click", function() {

            alert("Settings saved successfully!");

        });

    }
}


// ========================================
// Profile Page
// ========================================

if (document.title.includes("Profile")) {

    const editButton =
        document.querySelector(".edit-button");

    if (editButton) {

        editButton.addEventListener("click", function() {

            alert("Profile editing will be available soon.");

        });

    }
}


// ========================================
// Achievements Page
// ========================================

if (document.title.includes("Achievements")) {

    console.log("Achievements page loaded successfully.");

}


// ========================================
// Progress Page
// ========================================

if (document.title.includes("Progress")) {

    console.log("Progress page loaded successfully.");

}