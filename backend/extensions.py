from flask_bcrypt import Bcrypt
from flask_mail import Mail
from flask_session import Session
from flask_wtf import CSRFProtect
from pymongo import MongoClient
import certifi
from flask import current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

bcrypt = Bcrypt()
mail = Mail()
sess = Session()
csrf = CSRFProtect()

mongo_client = None
db = None


def init_mongo(app):
    global mongo_client, db
    mongo_client = MongoClient(app.config['MONGO_URI'], tlsCAFile=certifi.where())
    db = mongo_client[app.config['MONGO_DBNAME']]