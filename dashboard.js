document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // LOAD GOALS
    // ==========================================

    let goals = [];

    function addGoal(goal) {

        if (!goal || typeof goal !== "object") {
            return;
        }

        const title =
            goal.title ||
            goal.goalName ||
            goal.goalTitle ||
            goal.name;

        if (!title) {
            return;
        }

        goals.push(goal);
    }


    // First load the main "goals" key
    const mainGoals = localStorage.getItem("goals");

    if (mainGoals) {

        try {

            const data = JSON.parse(mainGoals);

            if (Array.isArray(data)) {

                data.forEach(function (goal) {
                    addGoal(goal);
                });

            } else {

                addGoal(data);

            }

        } catch (error) {

            console.log("Could not read goals:", error);

        }

    }


    // ==========================================
    // CHECK OTHER GOAL STORAGE KEYS
    // ==========================================

    const otherGoalKeys = [
        "goal",
        "goalData",
        "userGoals",
        "myGoals",
        "savedGoals",
        "goalList"
    ];


    otherGoalKeys.forEach(function (key) {

        const value = localStorage.getItem(key);

        if (!value) {
            return;
        }

        try {

            const data = JSON.parse(value);

            if (Array.isArray(data)) {

                data.forEach(function (goal) {
                    addGoal(goal);
                });

            } else {

                addGoal(data);

            }

        } catch (error) {

            // Ignore invalid data

        }

    });


    // ==========================================
    // SEARCH ALL LOCAL STORAGE FOR GOALS
    // ==========================================

    for (let i = 0; i < localStorage.length; i++) {

        const key = localStorage.key(i);

        if (!key) {
            continue;
        }

        if (
            key === "tasks" ||
            key === "task" ||
            key === "taskData" ||
            key === "userTasks" ||
            key === "myTasks" ||
            key === "savedTasks"
        ) {
            continue;
        }

        const value = localStorage.getItem(key);

        if (!value) {
            continue;
        }

        try {

            const data = JSON.parse(value);

            if (Array.isArray(data)) {

                data.forEach(function (item) {

                    if (
                        item &&
                        typeof item === "object" &&
                        (
                            item.title ||
                            item.goalName ||
                            item.goalTitle
                        )
                    ) {
                        addGoal(item);
                    }

                });

            } else {

                if (
                    data &&
                    typeof data === "object" &&
                    (
                        data.title ||
                        data.goalName ||
                        data.goalTitle
                    )
                ) {
                    addGoal(data);
                }

            }

        } catch (error) {

            // Ignore non-JSON values

        }

    }


    // ==========================================
    // REMOVE ONLY EXACT DUPLICATES
    // ==========================================

    const uniqueGoals = [];
    const seenGoals = new Set();

    goals.forEach(function (goal) {

        const title =
            goal.title ||
            goal.goalName ||
            goal.goalTitle ||
            goal.name ||
            "";

        const id =
            goal.id ||
            goal.goalId ||
            "";

        const targetDate =
            goal.targetDate ||
            goal.target_date ||
            goal.date ||
            "";

        const uniqueKey =
            id
                ? "ID:" + String(id)
                : "DATA:" +
                  String(title).toLowerCase() +
                  "|" +
                  String(targetDate);


        if (!seenGoals.has(uniqueKey)) {

            seenGoals.add(uniqueKey);

            uniqueGoals.push(goal);

        }

    });

    goals = uniqueGoals;


    // ==========================================
    // LOAD TASKS
    // ==========================================

    let tasks = [];

    const taskKeys = [
        "tasks",
        "task",
        "taskData",
        "userTasks",
        "myTasks",
        "savedTasks"
    ];


    taskKeys.forEach(function (key) {

        const value = localStorage.getItem(key);

        if (!value) {
            return;
        }

        try {

            const data = JSON.parse(value);

            if (Array.isArray(data)) {

                data.forEach(function (task) {

                    if (
                        task &&
                        typeof task === "object"
                    ) {
                        tasks.push(task);
                    }

                });

            } else if (
                data &&
                typeof data === "object"
            ) {

                tasks.push(data);

            }

        } catch (error) {

            // Ignore invalid task data

        }

    });


    // ==========================================
    // REMOVE DUPLICATE TASKS
    // ==========================================

    const uniqueTasks = [];
    const seenTasks = new Set();

    tasks.forEach(function (task) {

        const id =
            task.id ||
            task.taskId ||
            "";

        const name =
            task.name ||
            task.taskName ||
            task.taskTitle ||
            task.title ||
            "";

        const dueDate =
            task.dueDate ||
            task.taskDate ||
            task.date ||
            "";

        const uniqueKey =
            id
                ? "ID:" + String(id)
                : "DATA:" +
                  String(name).toLowerCase() +
                  "|" +
                  String(dueDate);


        if (!seenTasks.has(uniqueKey)) {

            seenTasks.add(uniqueKey);

            uniqueTasks.push(task);

        }

    });

    tasks = uniqueTasks;


    // ==========================================
    // TASK COUNTS
    // ==========================================

    const totalTasks =
        document.getElementById("totalTasks");

    const completedTasks =
        document.getElementById("completedTasks");

    const todayTaskCount =
        document.getElementById("todayTaskCount");


    if (totalTasks) {

        totalTasks.textContent =
            tasks.length;

    }


    const completedCount =
        tasks.filter(function (task) {

            return (
                task.completed === true ||
                task.completed === "true"
            );

        }).length;


    if (completedTasks) {

        completedTasks.textContent =
            completedCount;

    }


    // ==========================================
    // TODAY DATE
    // ==========================================

    const now = new Date();

    const today =
        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            now.getDate()
        ).padStart(2, "0");


    // ==========================================
    // NORMALIZE DATE
    // ==========================================

    function normalizeDate(value) {

        if (!value) {
            return "";
        }

        const date =
            String(value).trim();


        // YYYY-MM-DD

        if (
            /^\d{4}-\d{2}-\d{2}$/.test(date)
        ) {

            return date;

        }


        // DD-MM-YYYY

        if (
            /^\d{2}-\d{2}-\d{4}$/.test(date)
        ) {

            const parts =
                date.split("-");

            return (
                parts[2] +
                "-" +
                parts[1] +
                "-" +
                parts[0]
            );

        }


        // DD/MM/YYYY

        if (
            /^\d{2}\/\d{2}\/\d{4}$/.test(date)
        ) {

            const parts =
                date.split("/");

            return (
                parts[2] +
                "-" +
                parts[1] +
                "-" +
                parts[0]
            );

        }


        // Other valid date formats

        const parsed =
            new Date(date);

        if (!isNaN(parsed.getTime())) {

            return (
                parsed.getFullYear() +
                "-" +
                String(
                    parsed.getMonth() + 1
                ).padStart(2, "0") +
                "-" +
                String(
                    parsed.getDate()
                ).padStart(2, "0")
            );

        }


        return "";

    }


    // ==========================================
    // TODAY'S TASKS
    // ==========================================

    const todayTasks =
        tasks.filter(function (task) {

            const taskDate =
                task.dueDate ||
                task.taskDate ||
                task.date ||
                "";

            return (
                normalizeDate(taskDate) === today
            );

        });


    if (todayTaskCount) {

        todayTaskCount.textContent =
            todayTasks.length;

    }


    // ==========================================
    // DISPLAY TODAY'S TASKS
    // ==========================================

    const todayTasksContainer =
        document.getElementById("todayTasks");


    if (todayTasksContainer) {

        if (todayTasks.length === 0) {

            todayTasksContainer.innerHTML =
                "<p>No tasks for today.</p>";

        } else {

            todayTasksContainer.innerHTML =
                "";


            todayTasks.forEach(function (task) {

                const taskItem =
                    document.createElement("div");


                taskItem.style.marginBottom =
                    "15px";

                taskItem.style.padding =
                    "12px";

                taskItem.style.borderRadius =
                    "8px";


                const taskName =
                    task.name ||
                    task.taskName ||
                    task.taskTitle ||
                    task.title ||
                    "Task";


                const description =
                    task.description ||
                    task.taskDescription ||
                    "";


                const taskId =
                    task.id ||
                    task.taskId ||
                    "";


                const completed =
                    task.completed === true ||
                    task.completed === "true";


                taskItem.innerHTML = `

                    <h3>${taskName}</h3>

                    <p>${description}</p>

                    <button
                        onclick="completeTask('${taskId}')"
                        ${completed ? "disabled" : ""}
                    >
                        ${
                            completed
                                ? "Completed"
                                : "Mark as Completed"
                        }
                    </button>

                `;


                todayTasksContainer.appendChild(
                    taskItem
                );

            });

        }

    }


    // ==========================================
    // DISPLAY ALL GOALS
    // ==========================================

    const goalsContainer =
        document.getElementById("goalsContainer");


    if (goalsContainer) {

        if (goals.length === 0) {

            goalsContainer.innerHTML =
                "<p>Your goals will appear here.</p>";

        } else {

            goalsContainer.innerHTML =
                "";


            goals.forEach(function (goal) {

                const title =
                    goal.title ||
                    goal.goalName ||
                    goal.goalTitle ||
                    goal.name ||
                    "My Goal";


                const description =
                    goal.description ||
                    goal.goalDescription ||
                    "No description";


                const category =
                    goal.category ||
                    goal.goalCategory ||
                    "General";


                const priority =
                    goal.priority ||
                    goal.goalPriority ||
                    "Medium";


                const targetDate =
                    goal.targetDate ||
                    goal.target_date ||
                    goal.date ||
                    "Not set";


                let progress =
                    goal.progress ??
                    goal.goalProgress ??
                    goal.progressPercentage ??
                    0;


                progress =
                    Number(progress);


                if (isNaN(progress)) {
                    progress = 0;
                }


                if (progress < 0) {
                    progress = 0;
                }


                if (progress > 100) {
                    progress = 100;
                }


                const goalCard =
                    document.createElement("div");


                goalCard.className =
                    "goal-card";


                goalCard.innerHTML = `

                    <h3>
                        ${title}
                    </h3>

                    <p>
                        ${description}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${category}
                    </p>

                    <p>
                        <strong>Priority:</strong>
                        ${priority}
                    </p>

                    <p>
                        <strong>Target Date:</strong>
                        ${targetDate}
                    </p>

                    <p>
                        <strong>Progress:</strong>
                        ${progress}%
                    </p>

                    <button
                        onclick="updateGoalProgress('${goal.id}')"
                    >
                        Update Progress
                    </button>

                    <button
                        onclick="editGoal('${goal.id}')"
                    >
                        Edit Goal
                    </button>

                    <button
                        onclick="deleteGoal('${goal.id}')"
                    >
                        Delete Goal
                    </button>

                    <div class="progress-bar">

                        <div
                            class="progress"
                            style="width:${progress}%"
                        ></div>

                    </div>

                `;


                goalsContainer.appendChild(
                    goalCard
                );

            });

        }

    }

});


// ==========================================
// COMPLETE TASK
// ==========================================

function completeTask(taskId) {

    let tasks = [];

    try {

        tasks =
            JSON.parse(
                localStorage.getItem("tasks")
            ) || [];

    } catch (error) {

        tasks = [];

    }


    tasks.forEach(function (task) {

        if (
            String(task.id) ===
            String(taskId)
        ) {

            task.completed = true;

        }

    });


    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );


    location.reload();

}


// ==========================================
// UPDATE GOAL PROGRESS
// ==========================================

function updateGoalProgress(goalId) {

    let goals = [];

    try {

        goals =
            JSON.parse(
                localStorage.getItem("goals")
            ) || [];

    } catch (error) {

        goals = [];

    }


    const newProgress =
        prompt("Enter progress (0-100):");


    if (newProgress === null) {
        return;
    }


    const progress =
        Number(newProgress);


    if (
        isNaN(progress) ||
        progress < 0 ||
        progress > 100
    ) {

        alert(
            "Please enter a number between 0 and 100."
        );

        return;

    }


    goals.forEach(function (goal) {

        if (
            String(goal.id) ===
            String(goalId)
        ) {

            goal.progress =
                progress;

        }

    });


    localStorage.setItem(
        "goals",
        JSON.stringify(goals)
    );


    location.reload();

}


// ==========================================
// EDIT GOAL
// ==========================================

function editGoal(goalId) {

    let goals = [];

    try {

        goals =
            JSON.parse(
                localStorage.getItem("goals")
            ) || [];

    } catch (error) {

        goals = [];

    }


    const goal =
        goals.find(function (item) {

            return String(item.id) ===
                   String(goalId);

        });


    if (!goal) {

        alert("Goal not found.");

        return;

    }


    // Edit Goal Title

    const newTitle =
        prompt(
            "Enter goal title:",
            goal.title ||
            goal.goalName ||
            goal.goalTitle ||
            goal.name ||
            ""
        );


    if (newTitle === null) {
        return;
    }


    if (!newTitle.trim()) {

        alert("Goal title cannot be empty.");

        return;

    }


    // Edit Description

    const newDescription =
        prompt(
            "Enter description:",
            goal.description ||
            goal.goalDescription ||
            ""
        );


    if (newDescription === null) {
        return;
    }


    // Edit Category

    const newCategory =
        prompt(
            "Enter category:",
            goal.category ||
            goal.goalCategory ||
            ""
        );


    if (newCategory === null) {
        return;
    }


    // Edit Priority

    const newPriority =
        prompt(
            "Enter priority (Low / Medium / High):",
            goal.priority ||
            goal.goalPriority ||
            "Medium"
        );


    if (newPriority === null) {
        return;
    }


    // Edit Target Date

    const newTargetDate =
        prompt(
            "Enter target date (YYYY-MM-DD):",
            goal.targetDate ||
            goal.target_date ||
            goal.date ||
            ""
        );


    if (newTargetDate === null) {
        return;
    }


    // Save updated values

    goal.title =
        newTitle.trim();

    goal.description =
        newDescription.trim();

    goal.category =
        newCategory.trim();

    goal.priority =
        newPriority.trim();

    goal.targetDate =
        newTargetDate.trim();


    localStorage.setItem(
        "goals",
        JSON.stringify(goals)
    );


    alert("Goal updated successfully!");

    location.reload();

}


// ==========================================
// DELETE GOAL
// ==========================================

function deleteGoal(goalId) {

    let goals = [];

    try {

        goals =
            JSON.parse(
                localStorage.getItem("goals")
            ) || [];

    } catch (error) {

        goals = [];

    }


    const goal =
        goals.find(function (item) {

            return String(item.id) ===
                   String(goalId);

        });


    if (!goal) {

        alert("Goal not found.");

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${goal.title}"?`
        );


    if (!confirmed) {
        return;
    }


    goals =
        goals.filter(function (item) {

            return String(item.id) !==
                   String(goalId);

        });


    localStorage.setItem(
        "goals",
        JSON.stringify(goals)
    );


    location.reload();

}