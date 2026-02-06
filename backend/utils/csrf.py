from flask import session, request
from flask_wtf.csrf import validate_csrf, CSRFError
from utils.error_handler import error_response
import secrets

def set_csrf_token():
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(16)

def verify_csrf():
    token_header = request.headers.get('X-CSRFToken') or request.headers.get('X-CSRF-Token')
    try:
        validate_csrf(token_header)
    except CSRFError:
        return error_response("CSRF doğrulaması başarısız", 400)
    return None
