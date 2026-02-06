from flask import Blueprint, request, jsonify, g
from bson import ObjectId
import logging

from .decorators import token_required
from utils.helpers import convert_objectid_to_str , getUserOrganization
from extensions import db
from utils.error_handler import error_response
from utils.logger import logger


dataControl_bp = Blueprint('control', __name__, url_prefix='/api')

departments = db["departments"]
users = db["users"]

@dataControl_bp.route('/isDepartmentAnOrganization/<department_id>', methods=['GET'])
@token_required
def isDepartmentAnOrganization(department_id):
    try:
        userOrganization = getUserOrganization()
        dpt = departments.find_one({"_id":ObjectId(department_id),"organizationId":userOrganization})
        if dpt:
            if dpt["_id"] == userOrganization:
                return jsonify({"state":True,"mode":True})
            else:
                return jsonify({"state":True,"mode":False})
        else:
            error_response("Yetkiniz dahilinde böyle bir departman bulunamadı.")
    except Exception as e:
        logger.exception("Department Validate error")
        return error_response("Beklenmedik Hata Meydana geldi", 500)