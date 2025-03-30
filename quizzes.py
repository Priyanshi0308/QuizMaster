from datetime import datetime
from flask_restful import Resource, Api, reqparse, marshal_with, fields
from models import Quiz, Question, Score, db
from flask_security import auth_required, current_user

# Request parsers for Quiz and Question
quiz_parser = reqparse.RequestParser()
quiz_parser.add_argument('chapter_id', type=int, help="Chapter ID should be an integer", required=True)
quiz_parser.add_argument('date_of_quiz', type=str, help="Date of quiz should be a string")
quiz_parser.add_argument('time_duration', type=int, help="Time duration should be an integer", required=True)
quiz_parser.add_argument('remarks', type=str, help="Remarks should be a string")

question_parser = reqparse.RequestParser()
question_parser.add_argument('quiz_id', type=int, help="Quiz ID should be an integer", required=True)
question_parser.add_argument('question_statement', type=str, help="Question statement should be a string", required=True)
question_parser.add_argument('option1', type=str, help="Option 1 should be a string", required=True)
question_parser.add_argument('option2', type=str, help="Option 2 should be a string", required=True)
question_parser.add_argument('option3', type=str, help="Option 3 should be a string", required=True)
question_parser.add_argument('option4', type=str, help="Option 4 should be a string", required=True)
question_parser.add_argument('correct_option', type=int, help="Correct option should be an int", required=True)

# Request parser for quiz score submission
score_parser = reqparse.RequestParser()
score_parser.add_argument('total_scored', type=int, required=True, help="Total score is required")


# Marshalling fields for serializing the data
quiz_fields = {
    'id': fields.Integer,
    'chapter_id': fields.Integer,
    'date_of_quiz': fields.String,
    'time_duration': fields.Integer,
    'remarks': fields.String,
    'chapter_name': fields.String(attribute=lambda quiz: quiz.chapter.name if quiz.chapter else "N/A"),
    'subject_name': fields.String(attribute=lambda quiz: quiz.chapter.subject.name if quiz.chapter and quiz.chapter.subject else "N/A")
    }

question_fields = {
    'id': fields.Integer,
    'quiz_id': fields.Integer,
    'question_statement': fields.String,
    'option1': fields.String,
    'option2': fields.String,
    'option3': fields.String,
    'option4': fields.String,
    'correct_option': fields.Integer
}

# Fields for marshalling score data
score_fields = {
    'quiz_id': fields.Integer,
    'user_id': fields.Integer,
    'total_scored': fields.Integer,
    'time_stamp_of_attempt': fields.String
}

api = Api(prefix='/api')

# Resource for handling quizzes
class QuizResource(Resource):
    
    # GET request: Retrieve quizzes for a specific chapter
    @auth_required('token')
    @marshal_with(quiz_fields)
    def get(self, chapter_id=None):
        if chapter_id:
            quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
        else:
            quizzes = Quiz.query.all()
        return quizzes

    # POST request: Create a new quiz
    @auth_required('token')
    def post(self):
        args = quiz_parser.parse_args()
        quiz = Quiz(
            chapter_id=args['chapter_id'],
            date_of_quiz=args.get('date_of_quiz'),
            time_duration=args['time_duration'],
            remarks=args.get('remarks')
        )
        db.session.add(quiz)
        db.session.commit()
        return {"message": "Quiz created", "id": quiz.id}, 201

# Resource for handling a single quiz by ID
class QuizByIDResource(Resource):
    
    # GET request: Retrieve a quiz by ID
    @auth_required('token')
    @marshal_with(quiz_fields)
    def get(self, id):
        quiz = Quiz.query.get_or_404(id)
        return quiz
    
    # Update quiz details
    @auth_required('token')
    def put(self, id):
        quiz = Quiz.query.get_or_404(id)
        args = quiz_parser.parse_args()
        
        quiz.chapter_id = args['chapter_id']
        quiz.date_of_quiz = args.get('date_of_quiz')
        quiz.time_duration = args['time_duration']
        quiz.remarks = args.get('remarks')
        
        db.session.commit()
        return {"message": "Quiz updated successfully"}

    # DELETE request: Delete a quiz by ID
    @auth_required('token')
    def delete(self, id):
        quiz = Quiz.query.get_or_404(id)
        db.session.delete(quiz)
        db.session.commit()
        return {"message": "Quiz deleted"}

# Resource for handling questions
class QuestionResource(Resource):
    
    # POST request: Create a new question for a specific quiz
    @auth_required('token')
    def post(self, quiz_id):
        args = question_parser.parse_args()

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"error": "Quiz not found"}, 404
        
        print("Received Data:", args)

        question = Question(
            quiz_id=quiz_id,
            question_statement=args['question_statement'],
            option1=args['option1'],
            option2=args['option2'],
            option3=args['option3'],
            option4=args['option4'],
            correct_option=args['correct_option']
        )
        db.session.add(question)
        db.session.commit()
        return {"message": "Question created", "id": question.id}, 201

    # GET request: Retrieve all questions for a specific quiz
    @auth_required('token')
    @marshal_with(question_fields)
    def get(self, quiz_id):
        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        return questions

# Resource for handling a single question by ID
class QuestionByIDResource(Resource):
    
    # GET request: Retrieve a question by ID
    @auth_required('token')
    @marshal_with(question_fields)
    def get(self, id):
        question = Question.query.get_or_404(id)
        return question
    
    @auth_required('token')
    def put(self, id):
        question = Question.query.get_or_404(id)
        args = question_parser.parse_args()

        question.question_statement = args['question_statement']
        question.option1 = args['option1']
        question.option2 = args['option2']
        question.option3 = args['option3']
        question.option4 = args['option4']
        question.correct_option = args['correct_option']

        db.session.commit()
        return {"message": "Question updated successfully"}


    # DELETE request: Delete a question by ID
    @auth_required('token')
    def delete(self, id):
        question = Question.query.get_or_404(id)
        db.session.delete(question)
        db.session.commit()
        return {"message": "Question deleted"}

class ScoreResource(Resource):
    
    @auth_required('token')
    def post(self, quiz_id):
        """Submit or update quiz score for the logged-in student."""
        args = score_parser.parse_args()
        total_scored = args['total_scored']

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"error": "Quiz not found"}, 404

        existing_score = Score.query.filter_by(user_id=current_user.id, quiz_id=quiz_id).first()

        if existing_score:
            existing_score.total_scored = total_scored
            existing_score.time_stamp_of_attempt = datetime.utcnow()
        else:
            new_score = Score(
                quiz_id=quiz_id,
                user_id=current_user.id,
                time_stamp_of_attempt=datetime.utcnow(),
                total_scored=total_scored
            )
            db.session.add(new_score)

        db.session.commit()
        return {"message": "Score submitted successfully"}

class StudentScoresResource(Resource):

    @auth_required('token')
    @marshal_with(score_fields)
    def get(self):
        """Retrieve all quiz scores of the logged-in student."""
        scores = Score.query.filter_by(user_id=current_user.id).all()
        return scores, 200
    
# Add the resources to the API
api.add_resource(QuizResource, '/quizzes', '/quizzes/chapter/<int:chapter_id>')
api.add_resource(QuizByIDResource, '/quizzes/<int:id>')
api.add_resource(QuestionResource, '/quizzes/<int:quiz_id>/questions')
api.add_resource(QuestionByIDResource, '/questions/<int:id>')
api.add_resource(ScoreResource, '/quizzes/<int:quiz_id>/submit_score')
api.add_resource(StudentScoresResource, '/quizzes/my_scores')