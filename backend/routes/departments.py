from flask import Blueprint, request, jsonify, g,render_template,current_app
from bson import ObjectId
from datetime import datetime, timedelta, timezone
import logging , secrets , hashlib
from flask_mail import Message

from .decorators import token_required
from utils.helpers import convert_objectid_to_str , userIsAdmin , getUserOrganization,is_valid_email , userIsManager , convert_str_to_objectid
from extensions import db,mail
from utils.error_handler import error_response
from utils.logger import logger
import copy
from pymongo import UpdateOne




departments_bp = Blueprint('departments', __name__, url_prefix='/api')

users = db["users"]
departments = db["departments"]
memberships = db["memberships"]
reset_tokens = db["reset_tokens"]

USER_ROLE_ID = "68ca7071e9f90e5a45a2ea37"
ADMIN_ROLE_ID = ObjectId("68ca705ee9f90e5a45a2ea35")
MANAGER_ROLE_ID = ObjectId("68ca7068e9f90e5a45a2ea36")

@departments_bp.route('/list', methods=['GET'])
@token_required
def get_user_department_list():
    try:
        user_organization = getUserOrganization()
        from queries.departments import get_department_list_query
        if userIsAdmin():
            query = get_department_list_query(ObjectId(g.user_id),True,ObjectId(user_organization)) 
            departments_cursor = departments.aggregate(query)
        else:
            query = get_department_list_query(ObjectId(g.user_id),False,ObjectId(user_organization)) 
            departments_cursor = memberships.aggregate(query)

        departments_list = list(departments_cursor)
        departments_list = convert_objectid_to_str(departments_list)
        return jsonify({'state': True, 'data': departments_list})

    except Exception as e:
        logger.exception("Get Departmen List error")
        return error_response("Departman Listesi çekilirken hata meydana geldi.")

@departments_bp.route('/<department_id>', methods=['GET'])
@token_required
def get_department_detail(department_id):
    try:
        user_organization = getUserOrganization()

        department = departments.find_one({
            "_id": ObjectId(department_id),
            "organizationId": user_organization
        })

        if not department:
            return error_response("Hatalı erişim talebi")

        from queries.departments import get_department_details

        query = get_department_details(ObjectId(department_id),user_organization)  # Aggregate query burada olacak
        department_users = list(memberships.aggregate(query))
        department_users = convert_objectid_to_str(department_users)
        return jsonify({'state': True, 'data': department_users})

    except Exception as e:
        logger.exception("Get Departmen Detail error")
        return error_response("Departman Bilgileri çekilirken hata meydana geldi.")

@departments_bp.route('/create', methods=['POST'])  
@token_required
def create_department():
    try:
        user_organization = getUserOrganization()

        if not userIsAdmin():
            return error_response("Hatalı erişim talebi")

        data = request.get_json()
        name = data.get("departmentName")
        description = data.get("description")
        new_id = ObjectId()

        departments.insert_one({
            '_id': new_id,
            'name': name,
            'description': description,
            'ManagerId': '',
            'organizationId': user_organization
        })

        return jsonify({'state': True, 'Id': str(new_id)})
    except Exception as e:
        logger.exception("Create Department error")
        return error_response("Departman oluşturulurken hata meydana geldi.")
    

@departments_bp.route('/<department_id>', methods=['DELETE'])
@token_required
def delete_department(department_id):
    try:
        user_organization = getUserOrganization()

        if not userIsAdmin():
            return error_response("Yetkisiz işlem")


        department = departments.find_one({"_id": ObjectId(department_id), "organizationId": user_organization})

        if not department:
            return error_response("Departman bulunamadı")

        if user_organization == ObjectId(department_id):
            return error_response("Ana departman silinemez")

        memberships.delete_many({"departmentId": ObjectId(department_id)})
        departments.delete_one({"_id": ObjectId(department_id)})

        return jsonify({'state': True, 'msg': "Departman başarıyla silindi"})

    except Exception as e:
        logger.exception("Delete Department error")
        return error_response("Departman silinirken hata meydana geldi.")
    
@departments_bp.route('addableUser/<department_id>', methods=['GET'])
@token_required
def addableUser(department_id):
    try:
        user_organization = getUserOrganization()
        if not userIsAdmin():
            return error_response("Yetkisiz işlem")
        
        department = departments.find_one({"_id": ObjectId(department_id), "organizationId": user_organization})

        if not department:
            return error_response("Departman bulunamadı")
        
        from queries.departments import get_addable_user

        user_list = list(users.aggregate(get_addable_user(ObjectId(department_id),user_organization)))

        if not user_list:
            return jsonify({"state":True,"data":{"_id":"0","name":"Eklenebilecek Kullanıcı","surname":"Bulunamadı"}})
        
        user_list = convert_objectid_to_str(user_list)
        # user_list = [copy.deepcopy(u) | {"_id": str(u["_id"]) + f"_{i}"} for i in range(10) for u in user_list]
        return jsonify({"state":True,"data":user_list})

    except Exception as e:
        logger.exception("Get addableUser error")
        return error_response("Eklenebilir Kullanıcıları çekerken hata meydana geldi.")

@departments_bp.route('assignableUsers/<department_id>', methods=['GET'])
@token_required
def assignableUsers(department_id):    
    try:
        user_organization = getUserOrganization()
        if not userIsAdmin():
            return error_response("Yetkisiz işlem")
        
        department = departments.find_one({"_id": ObjectId(department_id), "organizationId": user_organization})

        if not department:
            return error_response("Departman bulunamadı")
        
        from queries.departments import get_assignable_user

        user_list = list(users.aggregate(get_assignable_user(ObjectId(department_id),user_organization)))

        if not user_list:
            return jsonify({"state":True,"data":{"_id":"0","name":"Eklenebilecek Kullanıcı","surname":"Bulunamadı"}})
        
        user_list = convert_objectid_to_str(user_list)
        # user_list = [copy.deepcopy(u) | {"_id": str(u["_id"]) + f"_{i}"} for i in range(10) for u in user_list]
        return jsonify({"state":True,"data":user_list})

    except Exception as e:
        logger.exception("Get addableUser error")
        return error_response("Eklenebilir Kullanıcıları çekerken hata meydana geldi.")

@departments_bp.route('invitation/<usermail>', methods=['GET'])
@token_required
def invitation(usermail):
    try:
        if is_valid_email(usermail):
            if not userIsAdmin():
                return error_response("Hatalı erişim talebi")
            user_registered = users.find_one({"email":usermail})

            if user_registered:
                return jsonify({"state":False,"msg":"Kullanıcı sistemimizde kayıtlı gözükmektedir."})
            
            user_organization = getUserOrganization()
            organization_name = departments.find_one({"_id":ObjectId(user_organization)})['name']

            token = secrets.token_urlsafe(32)
            link = f"http://{current_app.config['SERVER_IP']}/register?token={token}"
            html_content = render_template("invitation_email.html", link=link)
            msg = Message(
                subject=f"{organization_name} Seni FlowSync'e Davet Ediyor.",
                recipients=[usermail],
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
            with current_app.open_resource("static/email.png") as img_file:
                msg.attach(
                    filename="email.png",
                    content_type="image/png",
                    data=img_file.read(),
                    disposition="inline",
                    headers={"Content-ID": "<mail_logo>"}
                )
            mail.send(msg)

            token_hash = hashlib.sha256(token.encode()).hexdigest()
            now_utc = datetime.now(timezone.utc)
            expires_at = now_utc + timedelta(days=1)
            reset_tokens.insert_one({
                "userMail": usermail,
                "organizationId":user_organization,
                "tokenHash": token_hash,
                "createdAt": now_utc,
                "expiresAt": expires_at
            })
            
            return jsonify({"state":True,"msg":"Kullanıcıya bağlantı adresi gönderildi!"})
             
        else:
            error_response("Geçerli Bir Mail adresi giriniz.")
    except Exception as e:
        logger.exception("İnvite Mail Error")
        return error_response("Davet Maili gönderilirken hata meydana geldi.")

@departments_bp.route('addUsersToDepartment', methods=['POST'])
@token_required
def addUsersToDepartment():
    try:
        user_organization = getUserOrganization()

        if not userIsAdmin():
            return error_response("Hatalı erişim talebi")
        
        data = request.get_json()
        departmentId = ObjectId(data.get("departmentId"))
        user_list = list(data.get("users"))

        department = departments.find_one({
            "_id": departmentId,
            "organizationId": user_organization
        })

        if not department:
            return error_response("Hatalı erişim talebi")
        
        user_membership=[]
        for i in user_list:
            user_membership.append({"departmentId":departmentId,"roleId":ObjectId(USER_ROLE_ID),"userId":ObjectId(i),"state":True})
        
        memberships.insert_many(user_membership)

        from queries.departments import get_department_details

        query = get_department_details(departmentId,user_organization)  
        department_users = list(memberships.aggregate(query))
        department_users = convert_objectid_to_str(department_users)

        return jsonify({"state":True,"msg":"Kullanıcılar departmana atandı.","data":department_users})
        
        
    except Exception as e:
        logger.exception("Add Users To Department Error")
        return error_response("Kullancı Departmana eklenirken hata meydana geldi.")

@departments_bp.route('userChangeState', methods=['PATCH'])
@token_required
def userChangeState():
    try:
        user_organization = getUserOrganization()

        data = request.get_json()
        departmentId = ObjectId(data.get("departmentId"))
        userList = list(data.get("selectedRows"))
        userInList = False

        if not userIsAdmin() and not userIsManager(departmentId):
            return error_response("Hatalı erişim talebi",400)
        
        department = departments.find_one({
            "_id": departmentId,
            "organizationId": user_organization
        })

        if not department:
            return error_response("Hatalı erişim talebi",400)
        
        if g.user_id in userList:
            userList.remove(g.user_id)
            userInList = True
        
        user_ids = convert_str_to_objectid(userList)

        if user_organization == departmentId:
            users_data = list(users.find(
                {"_id": {"$in": user_ids}},
                {"_id": 1, "state": 1}
            ))

            ops = [
                UpdateOne(
                    {"_id": u["_id"]},
                    {"$set": {"state": not u["state"]}}
                )
                for u in users_data if "state" in u
            ]

            if ops:
                users.bulk_write(ops)

        else:
            memberships_data = list(memberships.find(
                {"userId": {"$in": user_ids}, "departmentId": departmentId},
                {"_id": 1, "state": 1}
            ))

            ops = [
                UpdateOne(
                    {"_id": m["_id"]},
                    {"$set": {"state": not m["state"]}}
                )
                for m in memberships_data if "state" in m
            ]

            if ops:
                memberships.bulk_write(ops)

        msg = "Siz hariç kullanıcıların durumları güncellenmiştir." if userInList else "Kullanıcıların durumları güncellenmiştir."
        return jsonify({"state": True, "msg": msg, "data": userList})


    except Exception as e:
        logger.exception("User State Change Error")
        return error_response("Kullancı Durumu Değiştirilirken hata meydana geldi.")
    
@departments_bp.route('userChangeRole', methods=['PATCH'])
@token_required
def userChangeRole():
    try:
        user_organization = getUserOrganization()

        data = request.get_json()
        departmentId = ObjectId(data.get("departmentId"))
        process = data.get("process")
        userList = list(data.get("selectedRows"))
        userInList = False

        if not userIsAdmin() and not userIsManager(departmentId):
            return error_response("Hatalı erişim talebi",400)
        
        department = departments.find_one({
            "_id": departmentId,
            "organizationId": user_organization
        })

        if not department:
            return error_response("Hatalı erişim talebi",400)
        
        if userIsManager(departmentId) and process == 4:# 4 is Admin Role
            return error_response("Hatalı erişim talebi",400)
        
        if process == 4 and user_organization != departmentId:
            return error_response("Admin sadece merkez departmanda yapılabilir.",400)
        
        userNewRole = ObjectId(USER_ROLE_ID) if process == 2 else MANAGER_ROLE_ID if process == 3 else ADMIN_ROLE_ID

        if g.user_id in userList and user_organization == departmentId:
            userList.remove(g.user_id)
            userInList = True

        memberships.update_many({"userId":{"$in": convert_str_to_objectid(userList)},"departmentId":departmentId},{"$set":{"roleId":userNewRole}})   

        msg = "Siz hariç kullanıcıların Yetkileri güncellenmiştir." if userInList else "Kullanıcıların Yetkileri güncellenmiştir."
        return jsonify({"state": True, "msg": msg, "data": userList})



    except Exception as e:
        logger.exception("User State Change Error")
        return error_response("Kullancı Yetkisi Değiştirilirken hata meydana geldi.")
    
@departments_bp.route('firedFromTheDepartment', methods=['DELETE'])
@token_required
def firedFromTheDepartment():
    try:
        user_organization = getUserOrganization()

        data = request.get_json()
        departmentId = ObjectId(data.get("departmentId"))

        userList = list(data.get("selectedRows"))

        if not userIsAdmin() and not userIsManager(departmentId):
            return error_response("Hatalı erişim talebi",400)
        
        department = departments.find_one({
            "_id": departmentId,
            "organizationId": user_organization
        })

        if not department:
            return error_response("Hatalı erişim talebi",400)
        
        memberships.delete_many({"userId":{"$in": convert_str_to_objectid(userList)},"departmentId":departmentId})
        departments.update_one({"ManagerId":{"$in": convert_str_to_objectid(userList)},"_id":departmentId},{"$set":{"ManagerId":""}})
        msg = "Kullanıcılar başarıyla departmandan atılmıştır." 
        return jsonify({"state": True, "msg": msg, "data": userList})
    except Exception as e:
        logger.exception("User State Change Error")
        return error_response("Kullancı Yetkisi Değiştirilirken hata meydana geldi.")
    
@departments_bp.route('setDepartmentManager', methods=['PATCH'])
@token_required
def setDepartmentManager():
    try:
        user_organization = getUserOrganization()

        data = request.get_json()
        departmentId = ObjectId(data.get("departmentId"))
        selectedUserId = data.get("selectedUsers")

        if not userIsAdmin():
            return error_response("Hatalı erişim talebi",400)
        department = departments.find_one({
            "_id": departmentId,
            "organizationId": user_organization
        })

        if not department:
            return error_response("Hatalı erişim talebi",400)
        
        user = users.find_one({"_id":ObjectId(selectedUserId),"organizationId":user_organization})

        if not user:
            return error_response("Bu kullanıcı sizin organizasyonunuza dahil değil!!",400)
        
        membership = memberships.find_one({"departmentId":departmentId,"userId":ObjectId(selectedUserId),"$or":[{"roleId":MANAGER_ROLE_ID},{"roleId":ADMIN_ROLE_ID}]})

        if not membership:
            return error_response("Bu kullanıcı atamaya uygun değil!!",400)
        
        departments.update_one({"_id":departmentId},{"$set":{"ManagerId":ObjectId(selectedUserId)}})
        
        managerName = user["name"]+" "+user["surname"]
        msg = "Seçilen kişi departmana atanmıştır." 
        return jsonify({"state": True, "msg": msg, "data": managerName})
    except Exception as e:
        logger.exception("Get addableUser error")
        return error_response("Eklenebilir Kullanıcıları çekerken hata meydana geldi.")