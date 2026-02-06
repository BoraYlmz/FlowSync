from flask import jsonify
from flask_wtf.csrf import CSRFError
from werkzeug.exceptions import HTTPException
import logging

def error_response(message="Bir hata oluştu", status=400, data=None):
    response = {
        'state': False,
        'msg': message
    }
    if data:
        response['data'] = data
    return jsonify(response), status

def register_error_handlers(app):
    # CSRF hatası
    @app.errorhandler(CSRFError)
    def handle_csrf_error(e):
        return error_response("CSRF doğrulaması başarısız. Lütfen oturumu yenileyin.", 400)

    # 404 Not Found
    @app.errorhandler(404)
    def handle_404(e):
        return error_response("İstek yapılan adres bulunamadı.", 404)

    # 401 Unauthorized
    @app.errorhandler(401)
    def handle_401(e):
        return error_response("Yetkisiz erişim!", 401)

    # 500 Internal Server Error
    @app.errorhandler(500)
    def handle_500(e):
        logging.exception("Sunucu hatası:")
        return error_response("Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.", 500)

    # Diğer tüm HTTPException'lar
    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        return error_response(e.description, e.code)