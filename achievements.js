document.addEventListener("DOMContentLoaded", function () {

    const achievementsContainer =
        document.getElementById("achievementsContainer");

    const totalAchievements =
        document.getElementById("totalAchievements");

    const completedGoals =
        document.getElementById("completedGoals");


    // Get goals from localStorage
    let goals = [];

    try {
        goals =
            JSON.parse(
                localStorage.getItem("goals")
            ) || [];
    } catch (error) {
        goals = [];
    }


    // Find completed goals
    const completed =
        goals.filter(function (goal) {

            return Number(goal.progress) >= 100;

        });


    // Update summary
    completedGoals.textContent =
        completed.length;

    totalAchievements.textContent =
        completed.length;


    // Display achievements
    if (completed.length === 0) {

        achievementsContainer.innerHTML = `
            <p class="empty-message">
                No achievements yet. Complete your goals to earn achievements!
            </p>
        `;

        return;
    }


    achievementsContainer.innerHTML = "";


    completed.forEach(function (goal) {

        const card =
            document.createElement("div");

        card.className =
            "achievement-card";


        card.innerHTML = `
            <div class="achievement-icon">
                🏆
            </div>

            <h3>
                ${goal.title}
            </h3>

            <p>
                Goal completed successfully!
            </p>

            <p>
                Progress: 100%
            </p>
        `;


        achievementsContainer.appendChild(card);

    });

});