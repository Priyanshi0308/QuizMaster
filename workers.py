# from celery import Celery, Task
# from flask import Flask
# celery = Celery('applicationtasks')

# class ContextTask(celery.Task):
#     def _call_(self, args,*kwargs):
#         with app.app_context():
#             return self.run(args,*kwargs)

# # runs the task in application context, just running task in application context
# def celery_init_app(app: Flask) -> Celery:
#     class FlaskTask(Task):
#         def __call__(self, *args: object, **kwargs: object) -> object:
#             with app.app_context():
#                 return self.run(*args, **kwargs)

#     celery_app = Celery(app.name, task_cls=FlaskTask)
#     celery_app.config_from_object("celeryconfig")
#     celery_app.set_default()
#     app.extensions["celery"] = celery_app
#     return celery_app

from celery import Celery
from celeryconfig import LocalDevelopmentConfig
from celery.schedules import crontab

celery = Celery(__name__, broker=LocalDevelopmentConfig.CELERY_BROKER_URL)
celery.conf.update(
    broker_url=LocalDevelopmentConfig.CELERY_BROKER_URL,
    result_backend=LocalDevelopmentConfig.CELERY_RESULT_BACKEND,
    timezone="Asia/Kolkata",
    broker_connection_retry_on_startup=True,
    beat_schedule={
        "send-daily-alert": {
            "task": "tasks.daily_reminder",
            "schedule": crontab(hour=20, minute=50),
        },
        "send-monthly-alert": {
            "task": "tasks.monthly_report",
            "schedule": crontab(day_of_month='30', hour=20, minute=50),
        },
    }
)



class ContextTask(celery.Task):
    """Make Celery tasks work with Flask app context."""
    def call(self, *args, **kwargs):
        from main import app
        with app.app_context():
            return self.run(*args, **kwargs)

celery.Task = ContextTask