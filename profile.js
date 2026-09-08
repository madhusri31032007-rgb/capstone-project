document.addEventListener("DOMContentLoaded", function () {

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");


    // Get registered user details
    let user = null;

    try {
        user =
            JSON.parse(
                localStorage.getItem("registeredUser")
            );
    } catch (error) {
        user = null;
    }


    // Display user details
    if (user) {

        profileName.textContent =
            user.name || "User";

        profileEmail.textContent =
            user.email || "Not available";

    } else {

        profileName.textContent =
            "No user found";

        profileEmail.textContent =
            "No email found";
    }

});


// Logout function
function logout() {

    localStorage.removeItem("loggedInUser");

    alert("You have been logged out.");

    window.location.href =
        "login.html";
}