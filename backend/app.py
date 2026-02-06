from flask import Flask, request, jsonify, session, make_response,g,render_template
from config import Config
from extensions import bcrypt, mail, sess, csrf,init_mongo,limiter
from flask_wtf.csrf import generate_csrf
from utils.error_handler import register_error_handlers
from flask_cors import CORS
from cryptography.fernet import Fernet



def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True,expose_headers=["X-CSRFToken"]) 
    app.config.from_object(Config)

    secret = app.config["FERNET_SECRET_KEY"]

    if not secret:
        raise RuntimeError("FERNET_SECRET_KEY is missing")
    app.fernet = Fernet(secret)

    bcrypt.init_app(app)
    mail.init_app(app)
    sess.init_app(app)
    csrf.init_app(app)

    @app.before_request
    def log_request():
        print("📥 Request geldi:", request.method, request.path)

    @app.before_request
    def disable_csrf_for_safe_methods():
        if request.method in ("GET", "HEAD", "OPTIONS"):
            setattr(g, "_csrf_exempt", True)

    init_mongo(app)
    limiter.init_app(app)

    from routes.auth import auth_bp
    from routes.departments import departments_bp
    from routes.companies import companies_bp
    from routes.meets import meets_bp
    from routes.dataControl import dataControl_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(departments_bp, url_prefix='/api/departments')
    app.register_blueprint(companies_bp, url_prefix='/api/companies')
    app.register_blueprint(meets_bp, url_prefix='/api/meets')
    app.register_blueprint(dataControl_bp, url_prefix='/api/control')
    


    register_error_handlers(app)
    

    @app.after_request
    def inject_csrf_token(response):
        response.set_cookie(
            'csrf_token',             # Cookie adı
            generate_csrf(),          # Değer
            secure=False,             # HTTPS kullanıyorsan True yap
            samesite='Lax',
            httponly=False            # JS’den okunabilmesi için False
        )
        return response
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host='0.0.0.0', port=5000,debug=True)

