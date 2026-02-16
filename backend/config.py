import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Ensure instance folder
    INSTANCE_PATH = os.path.join(basedir, "instance")
    os.makedirs(INSTANCE_PATH, exist_ok=True)

    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(INSTANCE_PATH, "database.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
