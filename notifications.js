document.addEventListener("DOMContentLoaded", function () {

    const container =
        document.getElementById("notificationsContainer");

    let notifications = [];

    try {
        notifications =
            JSON.parse(
                localStorage.getItem("notifications")
            ) || [];
    } catch (error) {
        notifications = [];
    }


    // Create notifications from goals
    let goals = [];

    try {
        goals =
            JSON.parse(
                localStorage.getItem("goals")
            ) || [];
    } catch (error) {
        goals = [];
    }


    goals.forEach(function (goal) {

        const progress =
            Number(goal.progress) || 0;

        // Goal completed notification
        if (progress >= 100) {

            const exists =
                notifications.some(function (notification) {

                    return notification.goalId == goal.id &&
                           notification.type === "completed";

                });

            if (!exists) {

                notifications.push({

                    id: Date.now() + Math.random(),

                    goalId: goal.id,

                    type: "completed",

                    message:
                        `Congratulations! You completed your goal: ${goal.title}`

                });

            }
        }


        // Goal progress reminder
        else if (progress > 0) {

            const exists =
                notifications.some(function (notification) {

                    return notification.goalId == goal.id &&
                           notification.type === "progress";

                });

            if (!exists) {

                notifications.push({

                    id: Date.now() + Math.random(),

                    goalId: goal.id,

                    type: "progress",

                    message:
                        `Keep going! Your goal "${goal.title}" is ${progress}% complete.`

                });

            }

        }

    });


    // Save notifications
    localStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
    );


    // Display notifications
    if (notifications.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No notifications yet.
            </p>
        `;

        return;
    }


    container.innerHTML = "";


    notifications.forEach(function (notification) {

        const card =
            document.createElement("div");

        card.className =
            "notification-card";


        card.innerHTML = `
            <h3>🔔 GoalMate Notification</h3>

            <p>
                ${notification.message}
            </p>
        `;


        container.appendChild(card);

    });

});