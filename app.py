from flask import Flask, request, jsonify, send_from_directory, session
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
from pathlib import Path
from datetime import datetime

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "goal_app.db"

app.secret_key = "personal-goal-platform-secret-key-2026"


# =========================
# DATABASE
# =========================

def get_db():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db():
    connection = get_db()

    connection.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            member_since TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            priority TEXT,
            deadline TEXT,
            status TEXT DEFAULT 'Not Started',
            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            goal TEXT,
            deadline TEXT,
            priority TEXT,
            status TEXT DEFAULT 'Pending',
            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            email_notifications INTEGER DEFAULT 1,
            goal_reminders INTEGER DEFAULT 1,
            task_reminders INTEGER DEFAULT 1,
            language TEXT DEFAULT 'English',
            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        );
    """)

    connection.commit()
    connection.close()


# =========================
# HTML FILES
# =========================

@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/<path:filename>")
def serve_file(filename):
    file_path = BASE_DIR / filename

    if file_path.exists() and file_path.is_file():
        return send_from_directory(BASE_DIR, filename)

    return jsonify({
        "error": "File not found"
    }), 404


# =========================
# TEST
# =========================

@app.route("/api/test")
def test_api():
    return jsonify({
        "success": True,
        "message": "Personal Goal Achievement Platform backend is working!"
    })


@app.route("/api/database-status")
def database_status():
    connection = get_db()
    connection.execute("SELECT 1")
    connection.close()

    return jsonify({
        "success": True,
        "database": "SQLite",
        "status": "Connected"
    })


# =========================
# REGISTER
# =========================

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Name, email and password are required."
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters."
        }), 400

    connection = get_db()

    existing_user = connection.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if existing_user:
        connection.close()

        return jsonify({
            "success": False,
            "message": "An account with this email already exists."
        }), 409

    password_hash = generate_password_hash(password)
    member_since = datetime.now().strftime("%Y-%m-%d")

    cursor = connection.execute(
        """
        INSERT INTO users
        (name, email, password, member_since)
        VALUES (?, ?, ?, ?)
        """,
        (name, email, password_hash, member_since)
    )

    user_id = cursor.lastrowid

    connection.execute(
        """
        INSERT INTO settings
        (
            user_id,
            email_notifications,
            goal_reminders,
            task_reminders,
            language
        )
        VALUES (?, 1, 1, 1, 'English')
        """,
        (user_id,)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Account created successfully!"
    }), 201


# =========================
# LOGIN
# =========================

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    connection = get_db()

    user = connection.execute(
        """
        SELECT
            id,
            name,
            email,
            password,
            member_since
        FROM users
        WHERE email = ?
        """,
        (email,)
    ).fetchone()

    connection.close()

    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    if not check_password_hash(user["password"], password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    session["user_id"] = user["id"]

    return jsonify({
        "success": True,
        "message": "Login successful!",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "memberSince": user["member_since"]
        }
    })


# =========================
# CURRENT USER
# =========================

@app.route("/api/me")
def current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not logged in."
        }), 401

    connection = get_db()

    user = connection.execute(
        """
        SELECT
            id,
            name,
            email,
            member_since
        FROM users
        WHERE id = ?
        """,
        (user_id,)
    ).fetchone()

    connection.close()

    if not user:
        session.clear()

        return jsonify({
            "success": False,
            "message": "User not found."
        }), 404

    return jsonify({
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "memberSince": user["member_since"]
        }
    })


# =========================
# LOGOUT
# =========================

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully."
    })


# =========================
# SETTINGS - GET
# =========================

@app.route("/api/settings", methods=["GET"])
def get_settings():
    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Not logged in"
        }), 401

    user_id = session["user_id"]

    connection = get_db()

    settings = connection.execute(
        "SELECT * FROM settings WHERE user_id = ?",
        (user_id,)
    ).fetchone()

    connection.close()

    if settings:
        return jsonify({
            "success": True,
            "settings": dict(settings)
        })

    return jsonify({
        "success": True,
        "settings": {
            "email_notifications": 1,
            "goal_reminders": 1,
            "task_reminders": 1,
            "language": "English"
        }
    })


# =========================
# SETTINGS - POST
# =========================

@app.route("/api/settings", methods=["POST"])
def save_settings():
    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Not logged in"
        }), 401

    user_id = session["user_id"]

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    email_notifications = data.get("email_notifications", 1)
    goal_reminders = data.get("goal_reminders", 1)
    task_reminders = data.get("task_reminders", 1)
    language = data.get("language", "English")

    connection = get_db()

    existing = connection.execute(
        "SELECT id FROM settings WHERE user_id = ?",
        (user_id,)
    ).fetchone()

    if existing:
        connection.execute(
            """
            UPDATE settings
            SET email_notifications = ?,
                goal_reminders = ?,
                task_reminders = ?,
                language = ?
            WHERE user_id = ?
            """,
            (
                email_notifications,
                goal_reminders,
                task_reminders,
                language,
                user_id
            )
        )

    else:
        connection.execute(
            """
            INSERT INTO settings
            (
                user_id,
                email_notifications,
                goal_reminders,
                task_reminders,
                language
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                user_id,
                email_notifications,
                goal_reminders,
                task_reminders,
                language
            )
        )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Settings saved successfully"
    })


# =========================
# GOALS - GET
# =========================

@app.route("/api/goals", methods=["GET"])
def get_goals():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    connection = get_db()

    goals = connection.execute(
        """
        SELECT
            id,
            title,
            description,
            priority,
            deadline,
            status
        FROM goals
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (user_id,)
    ).fetchall()

    connection.close()

    goal_list = []

    for goal in goals:
        goal_list.append({
            "id": goal["id"],
            "title": goal["title"],
            "description": goal["description"],
            "priority": goal["priority"],
            "deadline": goal["deadline"],
            "status": goal["status"]
        })

    return jsonify({
        "success": True,
        "goals": goal_list
    })


# =========================
# GOALS - POST
# =========================

@app.route("/api/goals", methods=["POST"])
def add_goal():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    priority = data.get("priority", "").strip()
    deadline = data.get("deadline", "").strip()

    if not title:
        return jsonify({
            "success": False,
            "message": "Goal title is required."
        }), 400

    connection = get_db()

    cursor = connection.execute(
        """
        INSERT INTO goals
        (
            user_id,
            title,
            description,
            priority,
            deadline,
            status
        )
        VALUES (?, ?, ?, ?, ?, 'Not Started')
        """,
        (
            user_id,
            title,
            description,
            priority,
            deadline
        )
    )

    goal_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Goal added successfully!",
        "goal": {
            "id": goal_id,
            "title": title,
            "description": description,
            "priority": priority,
            "deadline": deadline,
            "status": "Not Started"
        }
    }), 201


# =========================
# GOALS - DELETE
# =========================

@app.route("/api/goals/<int:goal_id>", methods=["DELETE"])
def delete_goal(goal_id):
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    connection = get_db()

    goal = connection.execute(
        """
        SELECT id
        FROM goals
        WHERE id = ?
        AND user_id = ?
        """,
        (
            goal_id,
            user_id
        )
    ).fetchone()

    if not goal:
        connection.close()

        return jsonify({
            "success": False,
            "message": "Goal not found."
        }), 404

    connection.execute(
        """
        DELETE FROM goals
        WHERE id = ?
        AND user_id = ?
        """,
        (
            goal_id,
            user_id
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Goal deleted successfully."
    })


# =========================
# TASKS - GET
# =========================

@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    connection = get_db()

    tasks = connection.execute(
        """
        SELECT
            id,
            name,
            goal,
            deadline,
            priority,
            status
        FROM tasks
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (user_id,)
    ).fetchall()

    connection.close()

    task_list = []

    for task in tasks:
        task_list.append({
            "id": task["id"],
            "name": task["name"],
            "goal": task["goal"],
            "deadline": task["deadline"],
            "priority": task["priority"],
            "status": task["status"]
        })

    return jsonify({
        "success": True,
        "tasks": task_list
    })


# =========================
# TASKS - POST
# =========================

@app.route("/api/tasks", methods=["POST"])
def add_task():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    name = data.get("name", "").strip()
    goal = data.get("goal", "").strip()
    deadline = data.get("deadline", "").strip()
    priority = data.get("priority", "").strip()

    if not name:
        return jsonify({
            "success": False,
            "message": "Task name is required."
        }), 400

    connection = get_db()

    cursor = connection.execute(
        """
        INSERT INTO tasks
        (
            user_id,
            name,
            goal,
            deadline,
            priority,
            status
        )
        VALUES (?, ?, ?, ?, ?, 'Pending')
        """,
        (
            user_id,
            name,
            goal,
            deadline,
            priority
        )
    )

    task_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Task added successfully!",
        "task": {
            "id": task_id,
            "name": name,
            "goal": goal,
            "deadline": deadline,
            "priority": priority,
            "status": "Pending"
        }
    }), 201


# =========================
# TASKS - UPDATE
# =========================

@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    status = data.get("status", "").strip()

    if not status:
        return jsonify({
            "success": False,
            "message": "Task status is required."
        }), 400

    connection = get_db()

    task = connection.execute(
        """
        SELECT id
        FROM tasks
        WHERE id = ?
        AND user_id = ?
        """,
        (
            task_id,
            user_id
        )
    ).fetchone()

    if not task:
        connection.close()

        return jsonify({
            "success": False,
            "message": "Task not found."
        }), 404

    connection.execute(
        """
        UPDATE tasks
        SET status = ?
        WHERE id = ?
        AND user_id = ?
        """,
        (
            status,
            task_id,
            user_id
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Task updated successfully."
    })


# =========================
# TASKS - DELETE
# =========================

@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    connection = get_db()

    task = connection.execute(
        """
        SELECT id
        FROM tasks
        WHERE id = ?
        AND user_id = ?
        """,
        (
            task_id,
            user_id
        )
    ).fetchone()

    if not task:
        connection.close()

        return jsonify({
            "success": False,
            "message": "Task not found."
        }), 404

    connection.execute(
        """
        DELETE FROM tasks
        WHERE id = ?
        AND user_id = ?
        """,
        (
            task_id,
            user_id
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Task deleted successfully."
    })


# =========================
# START SERVER
# =========================

if __name__ == "__main__":
    init_db()

    print("==============================================")
    print(" Personal Goal Achievement Platform")
    print(" Flask Backend Starting...")
    print("==============================================")
    print("Database:", DATABASE)
    print("Server: http://127.0.0.1:5000")
    print("==============================================")

    app.run(debug=True)