document.addEventListener("DOMContentLoaded", function () {

    const taskForm = document.getElementById("taskForm");
    const taskMessage = document.getElementById("taskMessage");

    taskForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const taskName =
            document.getElementById("taskName").value.trim();

        const taskDescription =
            document.getElementById("taskDescription").value.trim();

        const taskDueDate =
            document.getElementById("taskDueDate").value;


        if (taskName === "") {

            taskMessage.textContent =
                "Please enter a task name.";

            taskMessage.style.color = "red";

            return;
        }


        if (taskDueDate === "") {

            taskMessage.textContent =
                "Please select a due date.";

            taskMessage.style.color = "red";

            return;
        }


        // Get existing tasks
        let tasks =
            JSON.parse(localStorage.getItem("tasks")) || [];


        // Create new task
        const newTask = {

            id: Date.now(),

            name: taskName,

            description: taskDescription,

            dueDate: taskDueDate,

            completed: false

        };


        // Add task
        tasks.push(newTask);


        // Save task
        localStorage.setItem(
            "tasks",
            JSON.stringify(tasks)
        );


        // Show success message
        taskMessage.textContent =
            "Task created successfully!";

        taskMessage.style.color = "green";


        // Go to dashboard
        setTimeout(function () {

            window.location.href =
                "dashboard.html";

        }, 1000);

    });

});