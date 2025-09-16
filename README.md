**Project Overview**

QuizMaster is a Flask-based web application designed to manage quizzes, track student performance, and generate automated reports. It combines secure user authentication, efficient data handling, and task automation, providing a smooth, data-driven quiz experience.

This project showcases skills in backend development, database design, API creation, caching, and automated analytics workflows, making it relevant for data science and analytics applications.

**Key Features**

**Admin Features:**

Create, edit, and manage subjects, chapters, and quizzes

Monitor user activity and performance metrics

**User Features:**

Register, log in, and attempt quizzes

Track historical scores and performance trends

Receive automated reminders for upcoming quizzes

**Data & Analytics Features:**

Stores quiz attempts and scores for analysis

Generates monthly performance reports

Optimized queries and Redis caching for faster data retrieval

Celery-based background tasks for scheduled analytics and notifications

Technology Stack

Backend: Flask, Flask-SQLAlchemy, Flask-Security, Flask-RESTful

Database: SQLite

Caching & Task Automation: Redis, Celery

Frontend: Vue.js

Styling: Bootstrap

Database Schema Highlights

User – user details and roles

Role – defines Admin/User permissions

Subject & Chapter – hierarchical content organization

Quiz & Question – quiz content

Score – stores user quiz performance

**Selected API Endpoints**

POST /login – user/admin authentication

POST /register – user signup

GET /subjects – fetch subjects

POST /subjects – add subject (Admin only)

GET /quizzes – list quizzes

POST /quizzes – create quiz (Admin only)

POST /quizzes/<id>/attempt – submit quiz responses

GET /scores – retrieve quiz scores

**Setup & Installation**

git clone <repo-url>

cd QuizMaster

python -m venv venv

source venv/bin/activate  # Linux/macOS

venv\Scripts\activate     # Windows

pip install -r requirements.txt

python app.py


Access the app at http://localhost:5000.

Demo Video

https://drive.google.com/file/d/16IEnGQjsn3z1htdVo_mrGvuakkWnG83g/view
