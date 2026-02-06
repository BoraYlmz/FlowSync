from flask import Blueprint, request, jsonify, make_response, g , current_app ,render_template
from bson.objectid import ObjectId
from datetime import datetime, timedelta, timezone
from extensions import bcrypt, mail,limiter  # mail uzantısı
from utils.error_handler import error_response
from utils.logger import logger
from utils.csrf import verify_csrf, set_csrf_token

from extensions import db,csrf,mail,bcrypt

import hashlib, secrets, re,jwt
from flask_mail import Message
from .decorators import token_required 


auth_bp = Blueprint("auth", __name__)
users = db["users"]
reset_tokens = db["reset_tokens"]
memberships = db["memberships"]

USER_ROLE_ID = "68ca7071e9f90e5a45a2ea37"

@auth_bp.before_app_request
def before_request_csrf():

    if request.method in ["POST", "PUT", "DELETE"]:
        # login endpoint’ini hariç tut
        if request.endpoint == "auth.login":
            return None
        return verify_csrf()
    
@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        remember = data.get('remember', False)

        query = users.find_one({"email": email, "state": True})
        if query and bcrypt.check_password_hash(query["password"], password):
            expiry = datetime.now(timezone.utc) + (timedelta(days=30) if remember else timedelta(days=1))
            token = jwt.encode({'user_id': str(query['_id']), 'exp': expiry}, 
                                current_app.config['SECRET_KEY'], algorithm='HS256')
            resp = make_response(jsonify({'state': True}))
            resp.set_cookie('token', token,
                            httponly=True,
                            secure=False,
                            samesite='Strict',
                            max_age=(30 * 24 * 60 * 60) if remember else None)
            return resp
        return error_response("Mail veya şifre hatalı lütfen tekrar deneyiniz!", 401)
    except Exception as e:
        logger.exception("Login error")
        return error_response("Sistemde oluşan hata sebebiyle giriş işlemi sağlanamamaktadır. Lütfen daha sonra tekrar deneyiniz!", 500)
    
@auth_bp.route("/reset-password", methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        token = data.get("token")
        password = data.get("password")
        if not token:
            return error_response("Token tarafımıza ulaşmadığından doğrulama işlemi yapılamamaktadır. Şifre sıfırlama işlemi şuan sağlayamıyoruz.", 400)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        reset_token_doc = reset_tokens.find_one({"tokenHash": token_hash})
        if reset_token_doc:
            user_id = reset_token_doc['userId']
            hashedpass = bcrypt.generate_password_hash(password).decode('utf-8')
            users.update_one({"_id": user_id}, {"$set": {"password": hashedpass}})
            reset_tokens.delete_one({"tokenHash": token_hash})
            return jsonify({'status': True, 'msg': "Şifre Değiştirme Başarılı"})
        return error_response("Token geçersiz veya süresi dolmuş olabilir! Şifre sıfırlama işlemini şuan gerçekleştiremiyoruz.")
    except Exception as e:
        logger.exception("Reset Password error")
        return error_response("Şifre Sıfırlama işlemi başarısız! Şifre sıfırlama işlemi şuan sağlayamıyoruz.", 500)
    
@auth_bp.route("/validate-token", methods=['POST'])
def validate_reset_token():
    try:
        data = request.get_json()
        token = data.get("token")
        if not token:
            return error_response("Token tarafımıza ulaşmadığından doğrulama işlemi yapılamamaktadır. Gerçekleştirmek istediğiniz işlemi şuan sağlayamıyoruz.", 400)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        status = reset_tokens.find_one({"tokenHash": token_hash})
        if status:
            return jsonify({'status': True})
        return error_response("Token geçersiz veya süresi dolmuş olabilir! Gerçekleştirmek istediğiniz işlemi şuan sağlayamıyoruz.")
    except Exception as e:
        logger.exception("Token Validate error")
        return error_response("Token geçersiz veya süresi dolmuş olabilir!  Gerçekleştirmek istediğiniz işlemi şuan sağlayamıyoruz.", 500)


@auth_bp.route("/forgot-password/<email>", methods=['GET'])
@limiter.limit("5 per minute")
def forgot_password(email):
    try:
        valid = re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email)
        if valid:
            token = secrets.token_urlsafe(32)
            reset_link = f"http://{current_app.config['SERVER_IP']}/reset-password?token={token}"
            html_content = render_template("forgot_password_email.html", reset_link=reset_link)
            msg = Message(
                subject="FlowSync Şifre Sıfırlama Talebi",
                recipients=[email],
            )
            msg.html = html_content
            with current_app.open_resource("static/logo192.png") as img_file:
                msg.attach(
                    filename="logo192.png",
                    content_type="image/png",
                    data=img_file.read(),
                    disposition="inline",
                    headers={"Content-ID": "<logo>"}
                )
            with current_app.open_resource("static/pass_reset_icon.png") as img_file:
                msg.attach(
                    filename="pass_reset_icon.png",
                    content_type="image/png",
                    data=img_file.read(),
                    disposition="inline",
                    headers={"Content-ID": "<icon>"}
                )
            mail.send(msg)

            token_hash = hashlib.sha256(token.encode()).hexdigest()
            now_utc = datetime.now(timezone.utc)
            user_doc = users.find_one({'email': email})
            if user_doc:
                user_id = user_doc['_id']
                expires_at = now_utc + timedelta(hours=1)
                reset_tokens.insert_one({
                    "userId": user_id,
                    "tokenHash": token_hash,
                    "createdAt": now_utc,
                    "expiresAt": expires_at
                })
        return jsonify({'state': True})
    except Exception as e:
        logger.exception("Register error")
        return error_response("Sistemde oluşan bir hatadan dolayı mail gönderilmedi. Lütfen daha sonra tekrar deneyiniz!", 500)

@auth_bp.route("/register", methods=['POST'])
def register():
    try:
        data = request.get_json()
        token = data.get("token")
        firstName = data.get("firstName")
        lastName = data.get("lastName")
        usrbirthDate = datetime.strptime(data.get("usrbirthDate"), "%d/%m/%Y")
        password = data.get("password")
        if not token:
            return error_response("Token geçersiz veya süresi dolmuş olabilir! Kayıt işlemini şuan gerçekleştiremiyoruz.", 400)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        token_doc = reset_tokens.find_one({"tokenHash": token_hash})
        if not token_doc:
            return error_response("Token geçersiz veya süresi dolmuş olabilir! Kayıt işlemini şuan gerçekleştiremiyoruz.")
        mail=token_doc['userMail']
        organization = token_doc['organizationId']
        hashedpass = bcrypt.generate_password_hash(password).decode('utf-8')
        userId = ObjectId()
        users.insert_one({"_id":userId,"name":firstName,"surname":lastName,"email":mail,"birthday":usrbirthDate,"password":hashedpass,"state":True,"organizationId":ObjectId(organization)})
        memberships.insert_one({"departmentId":organization,"roleId":ObjectId(USER_ROLE_ID),"userId":userId,"state":True})
        reset_tokens.delete_one({"tokenHash": token_hash})
        return jsonify({"state":True,"msg":"Kayıt başarılı giriş için yönlendiriliyorsunuz!"})
    except Exception as e:
        logger.exception("Register error")
        return error_response("Hata Sebebiyle Kayıt Tamamlanamadı! Lütfen Daha sonra tekrar deneyiniz!", 500)

@auth_bp.route('/protected')
@token_required
def protected():
    return jsonify({'message': f'Welcome {g.user_id}'})

@auth_bp.route('/logout')
def logout():
    resp = make_response(jsonify({'msg': 'Logged out'}))
    resp.set_cookie('token', '', expires=0)
    return resp