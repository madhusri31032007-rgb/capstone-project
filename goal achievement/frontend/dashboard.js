document.addEventListener("DOMContentLoaded", function () {

    const taskContainer = document.getElementById("todayTasks");

    if (!taskContainer) {
        console.log("todayTasks element not found");
        return;
    }

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    taskContainer.innerHTML = "";

    if (tasks.length === 0) {
        taskContainer.innerHTML = "<p>No tasks for today.</p>";
        return;
    }

    tasks.forEach(function (task) {

        const taskItem = document.createElement("div");

        taskItem.innerHTML = `
            <label>
                <input type="checkbox" ${task.completed ? "checked" : ""}>
                ${task.title || task.text || task.name || "Task"}
            </label>
        `;

        taskContainer.appendChild(taskItem);
    });

});