// ======================================================
// GOALMATE
// CREATE + DISPLAY + UPDATE PROGRESS + EDIT + DELETE
// ======================================================


// ======================================================
// STORAGE KEY
// ======================================================

const STORAGE_KEY = "goalMateGoals";


// ======================================================
// GET GOALS
// ======================================================

function getGoals() {

    return JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];

}


// ======================================================
// SAVE GOALS
// ======================================================

function saveGoals(goals) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(goals)
    );

}


// ======================================================
// CREATE GOAL
// ======================================================

const goalForm = document.querySelector(".goal-form");

if (goalForm) {

    goalForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const nameElement =
            document.getElementById("goal-name");

        const categoryElement =
            document.getElementById("category");

        const descriptionElement =
            document.getElementById("description");

        const dateElement =
            document.getElementById("date");

        const priorityElement =
            document.getElementById("priority");


        if (
            !nameElement ||
            !categoryElement ||
            !descriptionElement ||
            !dateElement ||
            !priorityElement
        ) {

            alert("Form fields are missing.");

            return;
        }


        const name =
            nameElement.value.trim();

        const category =
            categoryElement.value;

        const description =
            descriptionElement.value.trim();

        const targetDate =
            dateElement.value;

        const priority =
            priorityElement.value;


        if (
            name === "" ||
            category === "" ||
            description === "" ||
            targetDate === "" ||
            priority === ""
        ) {

            alert("Please fill all fields.");

            return;
        }


        const newGoal = {

            id: Date.now(),

            name: name,

            category: category,

            description: description,

            targetDate: targetDate,

            priority: priority,

            progress: 0,

            status: "In Progress"

        };


        const goals = getGoals();


        goals.push(newGoal);


        saveGoals(goals);


        alert("Goal created successfully! 🎯");


        window.location.href =
            "dashboard.html";

    });

}


// ======================================================
// DASHBOARD
// ======================================================

const goalList =
    document.getElementById("goal-list");


if (goalList) {

    renderGoals();

}


// ======================================================
// RENDER GOALS
// ======================================================

function renderGoals() {

    const goals = getGoals();


    const totalGoals =
        document.getElementById("total-goals");

    const progressGoals =
        document.getElementById("progress-goals");

    const completedGoals =
        document.getElementById("completed-goals");

    const emptyState =
        document.getElementById("empty-state");

    const list =
        document.getElementById("goal-list");


    if (!list) {
        return;
    }


    // Statistics

    if (totalGoals) {

        totalGoals.textContent =
            goals.length;

    }


    const completed =
        goals.filter(function (goal) {

            return Number(goal.progress) === 100;

        }).length;


    const inProgress =
        goals.length - completed;


    if (progressGoals) {

        progressGoals.textContent =
            inProgress;

    }


    if (completedGoals) {

        completedGoals.textContent =
            completed;

    }


    // Empty

    if (goals.length === 0) {

        list.innerHTML = "";

        if (emptyState) {

            emptyState.style.display =
                "block";

        }

        return;
    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    // Clear old cards

    list.innerHTML = "";


    // Create cards

    goals.forEach(function (goal) {

        const card =
            document.createElement("div");


        card.className =
            "goal-card";


        const progress =
            Number(goal.progress) || 0;


        const status =
            progress === 100
                ? "Completed"
                : "In Progress";


        card.innerHTML = `

            <div class="goal-top">

                <span class="goal-icon">
                    🎯
                </span>

                <span class="status">
                    ${status}
                </span>

            </div>


            <h2>
                ${escapeHTML(goal.name)}
            </h2>


            <p class="description">
                ${escapeHTML(goal.description)}
            </p>


            <div class="goal-details">

                <div>
                    <span>Category:</span>
                    ${escapeHTML(goal.category)}
                </div>

                <div>
                    <span>Priority:</span>
                    ${escapeHTML(goal.priority)}
                </div>

                <div>
                    <span>Target Date:</span>
                    ${escapeHTML(goal.targetDate)}
                </div>

            </div>


            <div class="progress-info">

                <span>
                    Progress
                </span>

                <span>
                    ${progress}%
                </span>

            </div>


            <div class="progress-bar">

                <div
                    class="progress-fill"
                    style="width: ${progress}%"
                ></div>

            </div>


            <div class="goal-actions">

                <button
                    class="update-btn"
                    data-action="progress"
                    data-id="${goal.id}"
                >
                    📊 Update Progress
                </button>


                <button
                    class="edit-btn"
                    data-action="edit"
                    data-id="${goal.id}"
                >
                    ✏️ Edit Goal
                </button>


                <button
                    class="delete-btn"
                    data-action="delete"
                    data-id="${goal.id}"
                >
                    🗑️ Delete Goal
                </button>

            </div>

        `;


        list.appendChild(card);

    });

}


// ======================================================
// BUTTON CLICK HANDLER
// ======================================================

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest("button[data-action]");


        if (!button) {
            return;
        }


        const action =
            button.dataset.action;


        const id =
            Number(button.dataset.id);


        if (action === "progress") {

            updateProgress(id);

        }


        if (action === "edit") {

            editGoal(id);

        }


        if (action === "delete") {

            deleteGoal(id);

        }

    }
);


// ======================================================
// UPDATE PROGRESS
// ======================================================

function updateProgress(goalId) {

    const goals = getGoals();


    const goal =
        goals.find(function (item) {

            return item.id === goalId;

        });


    if (!goal) {

        alert("Goal not found.");

        return;
    }


    const input =
        prompt(
            "Enter progress percentage (0 - 100):",
            goal.progress || 0
        );


    if (input === null) {

        return;
    }


    const progress =
        Number(input);


    if (
        !Number.isFinite(progress) ||
        progress < 0 ||
        progress > 100
    ) {

        alert(
            "Please enter a number between 0 and 100."
        );

        return;
    }


    goal.progress =
        progress;


    goal.status =
        progress === 100
            ? "Completed"
            : "In Progress";


    saveGoals(goals);


    renderGoals();


    alert(
        "Progress updated successfully! 🎉"
    );

}


// ======================================================
// EDIT GOAL
// ======================================================

function editGoal(goalId) {

    const goals = getGoals();


    const goal =
        goals.find(function (item) {

            return item.id === goalId;

        });


    if (!goal) {

        alert("Goal not found.");

        return;
    }


    const name =
        prompt(
            "Goal name:",
            goal.name
        );


    if (name === null || name.trim() === "") {

        return;
    }


    const description =
        prompt(
            "Description:",
            goal.description
        );


    if (description === null) {

        return;
    }


    const category =
        prompt(
            "Category:",
            goal.category
        );


    if (category === null) {

        return;
    }


    const targetDate =
        prompt(
            "Target date:",
            goal.targetDate
        );


    if (targetDate === null) {

        return;
    }


    const priority =
        prompt(
            "Priority:",
            goal.priority
        );


    if (priority === null) {

        return;
    }


    goal.name =
        name.trim();

    goal.description =
        description.trim();

    goal.category =
        category.trim();

    goal.targetDate =
        targetDate.trim();

    goal.priority =
        priority.trim();


    saveGoals(goals);


    renderGoals();


    alert(
        "Goal updated successfully! ✨"
    );

}


// ======================================================
// DELETE GOAL
// ======================================================

function deleteGoal(goalId) {

    const goals = getGoals();


    const goal =
        goals.find(function (item) {

            return item.id === goalId;

        });


    if (!goal) {

        alert("Goal not found.");

        return;
    }


    const confirmDelete =
        confirm(
            `Delete "${goal.name}"?`
        );


    if (!confirmDelete) {

        return;
    }


    const updatedGoals =
        goals.filter(function (item) {

            return item.id !== goalId;

        });


    saveGoals(updatedGoals);


    renderGoals();


    alert(
        "Goal deleted successfully."
    );

}


// ======================================================
// SIMPLE HTML ESCAPE
// ======================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
// ========================================
// GOAL FILTER
// ========================================

document.addEventListener("click", function (event) {

    const button =
        event.target.closest(".filter-btn");

    if (!button) {
        return;
    }

    const filter =
        button.dataset.filter;


    const goals =
        getGoals();


    const cards =
        document.querySelectorAll(".goal-card");


    cards.forEach(function (card, index) {

        const goal =
            goals[index];


        if (!goal) {
            return;
        }


        const progress =
            Number(goal.progress) || 0;


        if (filter === "all") {

            card.style.display = "";

        }

        else if (filter === "progress") {

            card.style.display =
                progress < 100
                    ? ""
                    : "none";

        }

        else if (filter === "completed") {

            card.style.display =
                progress === 100
                    ? ""
                    : "none";

        }

    });


    // Active button

    document
        .querySelectorAll(".filter-btn")
        .forEach(function (btn) {

            btn.classList.remove("active");

        });


    button.classList.add("active");

});