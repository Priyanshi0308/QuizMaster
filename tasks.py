from jinja2 import Template  # Use Jinja2 for HTML rendering
from celery import shared_task
from flask import current_app as app
from models import Quiz, Score, Chapter, User, UserRoles, Role
import os
from datetime import datetime, timedelta
from extensions import db
import flask_excel as excel
import time
from flask import send_file
from mail_service import send_mail
import csv

# @celery_app.on_after_configure.connect
# def setup_periodic_tasks(sender, **kwargs):
#     # Daily reminder at 6 PM 
#     sender.add_periodic_task(
#         crontab(hour=18, minute=00),
#         daily_reminder.s(),
#     )

#     # Monthly report on the 1st day of the month at 9 AM
#     sender.add_periodic_task(
#         crontab(day_of_month=1, hour=9, minute=0),
#         monthly_report.s(),
#     )

#Daily reminder Task 
@shared_task(ignore_result=True)
def daily_reminder():
    users = User.query.join(UserRoles).join(Role).filter(Role.name == "stud").all()
    today = datetime.today().date()

    for user in users:
        # last_login = user.last_login if user.last_login else (today - timedelta(days=5))  
        new_quiz = Quiz.query.filter(Quiz.date_of_quiz == today).first()
        
        if new_quiz:
            subject = "Daily Reminder: Attempt Your Pending Quizzes!"
            message = f"Hi {user.username},\n\nDon't forget to attempt the latest quizzes."
            send_mail(
                to="pk@example.com",
                sub=subject,
                message=message,  # Plain text email
            )

    return "Daily reminders sent."

#Monthly Reports
@shared_task(ignore_result=True)
def monthly_report():
    users = User.query.join(UserRoles).join(Role).filter(Role.name == "stud").all()

    for user in users:
        scores = Score.query.filter(Score.user_id == user.id).all()
        total_quizzes = len(scores)
        avg_score = sum([s.total_scored for s in scores]) / total_quizzes if total_quizzes else 0

        html_template = Template("""
            <h2>Monthly Quiz Report</h2>
            <p>Hello {{ name }},</p>
            <p>Here is your performance report:</p>
            <ul>
                <li>Total Quizzes Attempted: {{ total_quizzes }}</li>
                <li>Average Score: {{ avg_score }}</li>
            </ul>
        """)

        message = html_template.render(name=user.username, total_quizzes=total_quizzes, avg_score=avg_score)
        send_mail(user.email, "Your Monthly Quiz Report", message)
        
    return "Monthly reports sent."


# #user triggered
# @shared_task(ignore_result=False)
# def export_csv(user_id):
#     """
#     Celery task to export quiz data to a uniquely named CSV file for a given user.
#     """
#     time.sleep(5)  # Simulating processing delay

#     # Query database for quizzes associated with the user
#     quiz_data = Quiz.query.join(Score).filter(Score.user_id == user_id).with_entities(
#         Quiz.id, Quiz.chapter_id, Quiz.date_of_quiz, Quiz.time_duration, Score.score, Quiz.remarks
#     ).yield_per(10)

#     if not quiz_data:
#         return "No quizzes found for the user."

#     # Generate a unique filename using user_id and timestamp
#     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")  # Format: YYYYMMDD_HHMMSS
#     filename = f"quiz_export_user_{user_id}_{timestamp}.csv"
#     filepath = os.path.join('downloads', filename)

#     # Ensure downloads directory exists
#     os.makedirs('./downloads', exist_ok=True)

#     # Write data to CSV
#     with open(filepath, 'w', newline='', encoding='utf-8') as file:
#         writer = csv.writer(file)
#         writer.writerow(["Quiz ID", "Chapter ID", "Date of Quiz", "Time Duration (min)", "Score", "Remarks"])
#         writer.writerows(quiz_data)

#     return filepath  # Return the full file path