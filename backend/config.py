import os
from datetime import timedelta
from dotenv import load_dotenv
from pathlib import Path


# load_dotenv(dotenv_path=Path(__file__).parent / "development.env")
load_dotenv(override=True)

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    FERNET_SECRET_KEY = os.getenv('FERNET_SECRET_KEY')

    SESSION_TYPE = 'filesystem'
    PERMANENT_SESSION_LIFETIME = timedelta(days=1)
    
    MONGO_URI = os.getenv("MONGO_URI")
    MONGO_DBNAME = os.getenv('MONGO_DBNAME')
    
    MAIL_SERVER = os.getenv('MAIL_SERVER')
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('SMTP')
    MAIL_PASSWORD = os.getenv('MAILPASS')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL')
    
    CORS_SUPPORTS_CREDENTIALS = True
    JSONIFY_PRETTYPRINT_REGULAR = True
    
    SERVER_IP = os.getenv("SERVER_ORIGIN")
   