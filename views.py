import datetime
from flask import render_template_string, render_template, Flask, request, jsonify, send_file
from flask_security import auth_required, current_user, roles_required
from flask_security import SQLAlchemySessionUserDatastore
from flask_security.utils import hash_password, verify_password
from models import Chapter, Quiz, Score, Subject, User, Question
from celery.result import AsyncResult

def create_views(app : Flask, user_datastore : SQLAlchemySessionUserDatastore, db, cache ):


    @app.route("/export_quiz/<int:user_id>", methods=["GET"])
    def export_quiz(user_id):
        """
        API endpoint to export quiz data for a user.
        """
        task = export_csv.delay(user_id)  # Trigger Celery task asynchronously
        return jsonify({"task_id": task.id, "message": "Quiz export started"}), 202


    @app.route("/quiz_status/<task_id>", methods=["GET"])
    def quiz_status(task_id):
        task_result = AsyncResult(task_id)

        if task_result.ready():
            if isinstance(task_result.result, str):
                return jsonify({"status": "completed", "file_path": task_result.result}), 200
            else:
                return jsonify({"status": "failed", "error": str(task_result.result)}), 500

        return jsonify({"status": "pending"}), 425        

    @app.route("/download_quiz/<task_id>", methods=["GET"])
    def download_quiz(task_id):
        """
        API endpoint to download the exported quiz CSV file.
        """
        task_result = AsyncResult(task_id)

        if task_result.ready():
            file_path = task_result.result
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({"error": "Task not completed yet"}), 425  # HTTP 425 = Too Early

    #################################################
    @app.route('/api/admin-summary', methods=['GET'])
    def get_admin_summary():
        users = User.query.all()
        subjects = Subject.query.all()
        chapters = {chapter.id: chapter for chapter in Chapter.query.all()}
        quizzes = Quiz.query.all()

        user_data = [
            {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "dob": user.dob,
                "qualification": user.qualification
            }
            for user in users
        ]

        subject_data = [
            {"id": subject.id, "name": subject.name} for subject in subjects
        ]

        chapter_data = {
            chapter.id: {"id": chapter.id, "name": chapter.name, "subject_id": chapter.subject_id}
            for chapter in chapters.values()
        }

        quiz_data = [
            {
                "id": quiz.id,
                "chapter_id": quiz.chapter_id
            }
            for quiz in quizzes
        ]

        return jsonify({
            "users": user_data,
            "subjects": subject_data,
            "chapters": chapter_data,
            "quizzes": quiz_data  # Added quizzes
        })

    @app.route('/api/stud-summary', methods=['GET'])
    @auth_required('token')
    def get_student_summary():
        student_id = current_user.id

        # Fetch scores of the student along with related quiz details
        scores = (
            db.session.query(
                Score.quiz_id,
                Score.total_scored,
                Quiz.date_of_quiz,
                Quiz.time_duration,
                Quiz.id.label("quiz_id"),
                Chapter.name.label("chapter_name"),
                Subject.name.label("subject_name"),
                db.func.count(Question.id).label("total_questions")
            )
            .join(Quiz, Quiz.id == Score.quiz_id)
            .join(Chapter, Chapter.id == Quiz.chapter_id)
            .join(Subject, Subject.id == Chapter.subject_id)
            .join(Question, Question.quiz_id == Quiz.id)
            .filter(Score.user_id == student_id)
            .group_by(Score.quiz_id)
            .all()
        )

        # Structure the response
        quiz_data = []
        for score in scores:
            total_questions = score.total_questions
            percentage = (score.total_scored / total_questions) * 100 if total_questions > 0 else 0

            quiz_data.append({
                "quiz_id": score.quiz_id,
                "subject_name": score.subject_name,
                "chapter_name": score.chapter_name,
                "date_of_quiz": score.date_of_quiz,
                "total_questions": total_questions,
                "total_scored": score.total_scored,
                "percentage": round(percentage, 2),
                "needs_improvement": percentage < 50,  # Flag for UI alert
            })

        return jsonify(quiz_data), 200


    @app.route('/search', methods=['GET'])
    def search():
        query = request.args.get('q', '').strip()

        if not query:
            return jsonify({"error": "Search query is missing"}), 400

        results = Subject.query.filter(Subject.name.ilike(f"%{query}%")).all()

        if not results:
            return jsonify({"message": "No subjects found"}), 404

        return jsonify([{"id": subject.id, "name": subject.name} for subject in results]), 200
    
    # cache demo
    @app.route('/cachedemo')
    @cache.cached(timeout = 1)
    def cacheDemo():
        return jsonify({"time" : datetime.datetime.now()})
    
    # homepage
    @app.route('/')
    def home():
        return render_template('index.html')

    # profile
    @app.route('/profile')
    @auth_required('token')
    def profile():
        return render_template_string(
            """
                <h1> this is homepage </h1>
                <p> Welcome, {{current_user.email}}</p>
                <p> Role :  {{current_user.roles[0].description}}</p>
                <p><a href="/logout">Logout</a></p>
            """
        )
    
    @app.route('/user-login', methods=['POST'])
    def login():
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')

            if not email or not password:
                return jsonify({'message' : 'email or password not provided'}), 400
            
            user = user_datastore.find_user(email = email)

            if not user:
                return jsonify({'message' : 'invalid user'}), 400
            
            if verify_password(password, user.password): #first is the given password by user and the next is hashed password
                return jsonify({'token' : user.get_auth_token(), 'user' : user.email, 'role' : user.roles[0].name}), 200
            else :
                return jsonify({'message' : 'invalid password'}), 400


    @app.route('/register', methods=['POST'])
    def register():
        data = request.get_json()

        # Extracting required fields
        email = data.get('email')
        password = data.get('password')
        username = data.get('username')
        qualification = data.get('qualification', '')
        dob = data.get('dob', '')

        # Input validation
        if not email or not password or not username:
            return jsonify({'message': 'Invalid input, missing required fields'}), 400

        # Check if user already exists
        if user_datastore.find_user(email=email):
            return jsonify({'message': 'User already exists'}), 400

        # Assigning role-based settings
        active_status = True  # Student is active immediately
        role_name = 'stud'
        success_message = 'Student successfully registered'

        # Create user
        user_datastore.create_user(
            email=email,
            password=hash_password(password),
            username=username,
            qualification=qualification,
            dob=dob,
            active=active_status,
            roles=['stud']  # Default role
        )

        # Save to DB
        db.session.commit()

        return jsonify({'message': success_message}), 201
    
    @app.route('/admin-dashboard')
    @roles_required('admin')
    def admin_dashboard():
        return render_template_string(
            """
                <h1>this is admin dashboard</h1>
                <p>This should only be accessable to admin</p>
            """
        )

    @app.route('/stud-dashboard')
    @roles_required('stud')
    def stud_dashboard():
        return render_template_string(
            """
                <h1>this is student dashboard</h1>
                <p>This should only be accessable to student</p>
            """
        )