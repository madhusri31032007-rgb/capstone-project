document.addEventListener("DOMContentLoaded", function () {

    const taskInput = document.querySelector("#taskInput");
    const addTaskBtn = document.querySelector("#addTaskBtn");
    const taskList = document.querySelector("#taskList");

    // Get saved tasks
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];


    // -----------------------------
    // Save tasks
    // -----------------------------
    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }


    // -----------------------------
    // Display tasks
    // -----------------------------
    function renderTasks() {

        if (!taskList) return;

        taskList.innerHTML = "";

        if (tasks.length === 0) {
            taskList.innerHTML = `
                <p>No tasks for today.</p>
            `;
            return;
        }


        tasks.forEach(function (task, index) {

            const taskCard = document.createElement("div");

            taskCard.className = "task-card";


            taskCard.innerHTML = `
                <label class="task-item">

                    <input
                        type="checkbox"
                        class="task-checkbox"
                        data-index="${index}"
                        ${task.completed ? "checked" : ""}
                    >

                    <span class="${task.completed ? "completed-task" : ""}">
                        ${task.title}
                    </span>

                </label>

                <button
                    class="delete-task"
                    data-index="${index}"
                >
                    Delete
                </button>
            `;


            taskList.appendChild(taskCard);
        });
    }


    // -----------------------------
    // Add task
    // -----------------------------
    function addTask() {

        if (!taskInput) return;

        const title = taskInput.value.trim();

        if (title === "") {
            alert("Please enter a task.");
            return;
        }


        const newTask = {
            id: Date.now(),
            title: title,
            completed: false
        };


        tasks.push(newTask);

        saveTasks();

        taskInput.value = "";

        renderTasks();
    }


    // -----------------------------
    // Add button
    // -----------------------------
    if (addTaskBtn) {

        addTaskBtn.addEventListener("click", function () {
            addTask();
        });

    }


    // -----------------------------
    // Enter key
    // -----------------------------
    if (taskInput) {

        taskInput.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {
                addTask();
            }

        });

    }


    // -----------------------------
    // Checkbox + Delete
    // -----------------------------
    if (taskList) {

        taskList.addEventListener("click", function (event) {

            // Checkbox
            if (event.target.classList.contains("task-checkbox")) {

                const index = Number(
                    event.target.dataset.index
                );

                tasks[index].completed =
                    event.target.checked;

                saveTasks();

                renderTasks();
            }


            // Delete
            if (event.target.classList.contains("delete-task")) {

                const index = Number(
                    event.target.dataset.index
                );

                tasks.splice(index, 1);

                saveTasks();

                renderTasks();
            }

        });

    }


    // Initial display
    renderTasks();

});