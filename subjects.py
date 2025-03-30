from sqlite3 import IntegrityError
from flask_restful import Resource, Api, reqparse, marshal_with, fields
from models import Subject, Chapter, db
from flask_security import auth_required

# Request parsers for Subject and Chapter
subject_parser = reqparse.RequestParser()
subject_parser.add_argument('name', type=str, help="Subject name should be string", required=True)
subject_parser.add_argument('description', type=str, help="Subject description should be string")

chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', type=str, help="Chapter name should be string", required=True)
chapter_parser.add_argument('description', type=str, help="Chapter description should be string")

# Marshalling fields for serializing the data
subject_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'chapters': fields.List(fields.Nested({
        'id': fields.Integer,
        'name': fields.String,
        'description': fields.String
    }))
}

chapter_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'subject_id': fields.Integer
}

api = Api(prefix='/api')

# Resource for handling subjects
class SubjectResource(Resource):

    # GET request: Retrieve all subjects
    @auth_required('token')
    @marshal_with(subject_fields)
    def get(self):
        all_subjects = Subject.query.all()
        return all_subjects

    # POST request: Create a new subject
    @auth_required('token')
    def post(self):
        args = subject_parser.parse_args()
        subject = Subject(name=args['name'], description=args.get('description'))
        db.session.add(subject)
        db.session.commit()
        return {"message": "Subject created", "id": subject.id}, 201

# Resource for handling a single subject by ID
class SubjectByIDResource(Resource):

    # GET request: Retrieve a subject by ID
    @auth_required('token')
    @marshal_with(subject_fields)
    def get(self, id):
        subject = Subject.query.get_or_404(id)
        return subject

    # PUT request: Update an existing subject
    @auth_required('token')
    def put(self, id):
        subject = Subject.query.get_or_404(id)
        args = subject_parser.parse_args()
        subject.name = args['name']
        subject.description = args.get('description')
        db.session.commit()
        return {"message": "Subject updated"}

    # DELETE request: Delete a subject by ID
    @auth_required('token')
    def delete(self, id):
        subject = Subject.query.get_or_404(id)

        try:
            # Delete all associated chapters first
            chapters = Chapter.query.filter_by(subject_id=id).all()
            for chapter in chapters:
                db.session.delete(chapter)

            # Now delete the subject
            db.session.delete(subject)
            db.session.commit()

            return {"message": "Subject and associated chapters deleted"}
        except IntegrityError:
            db.session.rollback()
            return {"error": "Failed to delete subject due to database constraints"}, 500
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

# Resource for handling chapters under a subject
class ChapterResource(Resource):

    # POST request: Create a new chapter for a specific subject
    @auth_required('token')
    def post(self, subject_id):
        subject = Subject.query.get_or_404(subject_id)
        args = chapter_parser.parse_args()
        chapter = Chapter(name=args['name'], description=args.get('description'), subject_id=subject.id)
        db.session.add(chapter)
        db.session.commit()
        return {"message": "Chapter created", "id": chapter.id}, 201

    # GET request: Retrieve all chapters for a specific subject
    @auth_required('token')
    @marshal_with(chapter_fields)
    def get(self, subject_id):
        subject = Subject.query.get_or_404(subject_id)
        chapters = Chapter.query.filter_by(subject_id=subject.id).all()
        return chapters

# Resource for handling a single chapter by ID
class ChapterByIDResource(Resource):

    # GET request: Retrieve a chapter by ID
    @auth_required('token')
    @marshal_with(chapter_fields)
    def get(self, id):
        chapter = Chapter.query.get_or_404(id)
        return chapter

    # PUT request: Update a chapter by ID
    @auth_required('token')
    def put(self, id):
        chapter = Chapter.query.get_or_404(id)
        args = chapter_parser.parse_args()
        chapter.name = args['name']
        chapter.description = args.get('description')
        db.session.commit()
        return {"message": "Chapter updated"}

    # DELETE request: Delete a chapter by ID
    @auth_required('token')
    def delete(self, id):
        chapter = Chapter.query.get_or_404(id)
        db.session.delete(chapter)
        db.session.commit()
        return {"message": "Chapter deleted"}

# Add the resources to the API
api.add_resource(SubjectResource, '/subjects')
api.add_resource(SubjectByIDResource, '/subjects/<int:id>')
api.add_resource(ChapterResource, '/subjects/<int:subject_id>/chapters')
api.add_resource(ChapterByIDResource, '/chapters/<int:id>')
