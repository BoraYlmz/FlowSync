from flask import Blueprint, request, jsonify, g,render_template,current_app
from bson import ObjectId
from datetime import datetime, timedelta, timezone

from .decorators import token_required
from utils.helpers import convert_objectid_to_str,getUserOrganization,userIsAdmin,userIsManagerAnyDept,convert_str_to_objectid
from utils.error_handler import error_response
from extensions import db
from utils.logger import logger
import copy

from cryptography.fernet import Fernet

meets_bp = Blueprint('meets', __name__, url_prefix='/api')

users = db["users"]
companies = db["companies"]
departmentsDB = db["departments"]
meetsDB = db["meets"]
companyContact = db["company_contact"]
department_company_access = db["department_company_access"]
memberships = db["memberships"]
reset_tokens = db["reset_tokens"]


@meets_bp.route('/list', methods=['GET'])
@token_required
def get_user_meet_list():
    try:
        from queries.meets import getUserMeets
        
        query = getUserMeets(ObjectId(g.user_id)) 
        cursor = meetsDB.aggregate(query)
        
        meet_list = list(cursor)
        meet_list = convert_objectid_to_str(meet_list)

        # meet_list = [copy.deepcopy(u) | {"_id": str(u["_id"]) + f"_{i}"} for i in range(15) for u in meet_list]
        return jsonify({'state': True, 'data': meet_list, "editState":True})

    except Exception as e:
        logger.exception("Get Meet List error")
        return error_response("Toplantı Listesi çekilirken hata meydana geldi.")
    
@meets_bp.route('/allist', methods=['GET'])
@token_required
def get_all_meet_list():
    try:
        user_organization = getUserOrganization()
        dptList=[]
        from queries.meets import get_department_list_query_for_meets
        if userIsAdmin():
            query = get_department_list_query_for_meets(ObjectId(g.user_id),True,False,user_organization)
            cursor = departmentsDB.aggregate(query)
            dptList=list(cursor)
        else:
            if userIsManagerAnyDept():
                query = get_department_list_query_for_meets(ObjectId(g.user_id),False,True,user_organization)
                cursor = department_company_access.aggregate(query)
                dptList=list(cursor)
            else:
                query = get_department_list_query_for_meets(ObjectId(g.user_id),False,False,user_organization)
                cursor = department_company_access.aggregate(query)
                dptList=list(cursor)

        from queries.meets import getAllMeets
        
        query = getAllMeets(ObjectId(g.user_id),dptList) 
        cursor = meetsDB.aggregate(query)
        
        meet_list = list(cursor)
        meet_list = convert_objectid_to_str(meet_list)

        # meet_list = [copy.deepcopy(u) | {"_id": str(u["_id"]) + f"_{i}"} for i in range(15) for u in meet_list]
        return jsonify({'state': True, 'data': meet_list})

    except Exception as e:
        logger.exception("Get Meet List error")
        return error_response("Toplantı Listesi çekilirken hata meydana geldi.")
    
@meets_bp.route('/<meet_id>', methods=['GET'])
@token_required
def get_meet_detail(meet_id):
    try:
        user_organization = getUserOrganization()
        cursor = meetsDB.aggregate([{"$match":{"_id":ObjectId(meet_id)}}])
        meet=list(cursor)
        cursor = departmentsDB.aggregate([{"$match":{"_id":ObjectId(meet[0]["deparmentId"]),"organizationId":user_organization}}])
        departments= list(cursor)
        if not departments:
            return error_response("Hatalı görüntüleme talebi.")
        
        meet[0]["content"] = current_app.fernet.decrypt(meet[0]["content"].encode()).decode()
        if ObjectId(meet[0]["meetOwner"]) == ObjectId(g.user_id):
            meet[0]["isEditable"] = True
        else:
            meet[0]["isEditable"] = False
        meet = convert_objectid_to_str(meet)
        
        return jsonify({'state': True, 'data': meet[0]})

    except Exception as e:
        logger.exception("Get Meet error")
        return error_response("Toplantı çekilirken hata meydana geldi.")

@meets_bp.route('/userFrmList', methods=['GET'])
@token_required
def userFrmList():
    try:    
        from queries.meets import getUserFrmList

        query = getUserFrmList(ObjectId(g.user_id)) 
        cursor = memberships.aggregate(query)

        company_list = list(cursor)
        company_list = convert_objectid_to_str(company_list)
        # company_list = [copy.deepcopy(u) | {"_id": str(u["_id"]) + f"_{i}"} for i in range(20) for u in company_list]
        return jsonify({'state': True, 'data': company_list})

    except Exception as e:
        logger.exception("Get Company List error")
        return error_response("Firma Listesi çekilirken hata meydana geldi.")
    
@meets_bp.route('getFrmPerson/<company_id>', methods=['GET'])
@token_required
def getFrmPerson(company_id):    
    try:
        user_organization = getUserOrganization()
        
        company = companies.find_one({"_id": ObjectId(company_id), "organizationId": user_organization})

        if not company:
            return error_response("Firma bulunamadı")
        

        frmPersonList = companyContact.aggregate([{"$match":{"companyId":ObjectId(company_id)}},{"$project":{"_id":1,"name":1}}])
        frmPersonList = list(frmPersonList)

        frmPersonList = convert_objectid_to_str(frmPersonList)
        # frmPersonList = [copy.deepcopy(u) | {"_id": str(u["_id"]) + f"_{i}"} for i in range(20) for u in frmPersonList]

        return jsonify({"state":True,"data":frmPersonList})

    except Exception as e:
        logger.exception("Get firm person list error")
        return error_response("Firmaya ait kişi listesi çekerken hata meydana geldi.")
    
@meets_bp.route('/getDepartmentUserList/<dpt_id>', methods=['GET'])
@token_required
def getDepartmentUserList(dpt_id):
    try:    
        user_organization = getUserOrganization()

        department = departmentsDB.find_one({"_id": ObjectId(dpt_id), "organizationId": user_organization})

        if not department:
            return error_response("Departman bulunamadı")
        
        from queries.meets import getDepartmentUserListQuery

        query = getDepartmentUserListQuery(ObjectId(dpt_id)) 
        cursor = memberships.aggregate(query)

        userList = list(cursor)
        userList = convert_objectid_to_str(userList)
        # company_list = [copy.deepcopy(u) | {"_id": str(u["_id"]) + f"_{i}"} for i in range(20) for u in company_list]
        return jsonify({'state': True, 'data': userList})

    except Exception as e:
        logger.exception("Get Organization User List error")
        return error_response("Organizasyon kullanıcıları çekilirken hata meydana geldi.")
    
@meets_bp.route('/getUserDepartmentList/<frm_id>', methods=['GET'])
@token_required
def getUserDepartmentList(frm_id):
    try:    
        user_organization = getUserOrganization()

        company = companies.find_one({"_id": ObjectId(frm_id), "organizationId": user_organization})

        if not company:
            return error_response("Firma bulunamadı")
        
        from queries.meets import getUserWorkspaceListQuery

        query = getUserWorkspaceListQuery(ObjectId(frm_id),ObjectId(g.user_id)) 
        cursor = department_company_access.aggregate(query)

        departmentList = list(cursor)
        departmentList = convert_objectid_to_str(departmentList)
        # company_list = [copy.deepcopy(u) | {"_id": str(u["_id"]) + f"_{i}"} for i in range(20) for u in company_list]
        return jsonify({'state': True, 'data': departmentList})

    except Exception as e:
        logger.exception("Get Organization User List error")
        return error_response("Organizasyon kullanıcıları çekilirken hata meydana geldi.")

@meets_bp.route('/create', methods=['POST'])  
@token_required
def create_meet():
    try:
        data = request.get_json()
        frmId = data.get("frmId")
        frmPersonIds = list(data.get("frmPersonIds"))
        departmentId = data.get("departmentId")
        departmentUserList = list(data.get("departmentUserList"))
        meetHeader = data.get("meetHeader")
        meetDate = data.get("meetDate")
        content = data.get("content")
        new_id = ObjectId()
        

        meetDate = datetime.fromisoformat(meetDate.replace("Z", "+00:00"))
        meetDate = meetDate.astimezone(timezone(timedelta(hours=3)))
        
        frmPersonIds=convert_str_to_objectid(frmPersonIds)
        departmentUserList=convert_str_to_objectid(departmentUserList)
        if ObjectId(g.user_id) not in departmentUserList:
            departmentUserList.append(ObjectId(g.user_id))
        

        meetsDB.insert_one({
            '_id': new_id,
            'meetOwner':ObjectId(g.user_id),
            'meetHeader': meetHeader,
            'meetDate': meetDate,
            'frmId': ObjectId(frmId),
            'deparmentId':ObjectId(departmentId),
            'externalParticipants': frmPersonIds,
            'internalParticipants': departmentUserList,
            'content':current_app.fernet.encrypt(content.encode()).decode()
        })

        return jsonify({'state': True, 'Id': str(new_id)})
    except Exception as e:
        logger.exception("Create Meet error")
        return error_response("Toplantı oluşturulurken hata meydana geldi.")

