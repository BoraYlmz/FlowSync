from flask import Blueprint, request, jsonify, g
from bson import ObjectId

from .decorators import token_required
from utils.helpers import convert_objectid_to_str,getUserOrganization,userIsAdmin,userIsManagerAnyDept,convert_str_to_objectid
from utils.error_handler import error_response
from extensions import db
from utils.logger import logger
import copy
from pymongo import UpdateOne


companies_bp = Blueprint('companies', __name__, url_prefix='/api')

users = db["users"]
companies = db["companies"]
departmentsDB = db["departments"]
companyContact = db["company_contact"]
department_company_access = db["department_company_access"]
memberships = db["memberships"]
reset_tokens = db["reset_tokens"]

USER_ROLE_ID = "68ca7071e9f90e5a45a2ea37"
ADMIN_ROLE_ID = ObjectId("68ca705ee9f90e5a45a2ea35")
MANAGER_ROLE_ID = ObjectId("68ca7068e9f90e5a45a2ea36")

@companies_bp.route('/list', methods=['GET'])
@token_required
def get_user_company_list():
    try:
        user_organization = getUserOrganization()
        from queries.companies import get_company_list_query
        if userIsAdmin():
            query = get_company_list_query(ObjectId(g.user_id),True,ObjectId(user_organization)) 
            company_cursor = companies.aggregate(query)
        else:
            query = get_company_list_query(ObjectId(g.user_id),False,ObjectId(user_organization)) 
            company_cursor = memberships.aggregate(query)

        company_list = list(company_cursor)
        company_list = convert_objectid_to_str(company_list)
        # company_list = [copy.deepcopy(u) | {"_id": str(u["_id"]) + f"_{i}"} for i in range(20) for u in company_list]
        return jsonify({'state': True, 'data': company_list})

    except Exception as e:
        logger.exception("Get Company List error")
        return error_response("Firma Listesi çekilirken hata meydana geldi.")

@companies_bp.route('/create', methods=['POST'])  
@token_required
def create_company():
    try:
        user_organization = getUserOrganization()

        if not userIsAdmin():
            return error_response("Hatalı erişim talebi")

        data = request.get_json()
        name = data.get("CompanyName")
        number = data.get("number")
        address = data.get("address")
        new_id = ObjectId()

        CONTROL = name.strip() if name else ""
        if not CONTROL: return error_response("Firma adı boş olamaz.") 

        companies.insert_one({
            '_id': new_id,
            'name': name,
            'number': number,
            'address': address,
            'organizationId': user_organization
        })

        return jsonify({'state': True, 'Id': str(new_id)})
    except Exception as e:
        logger.exception("Create Company error")
        return error_response("Firma oluşturulurken hata meydana geldi.")
    
@companies_bp.route('info/<company_id>', methods=['GET'])
@token_required
def getCompanyInfo(company_id):    
    try:
        user_organization = getUserOrganization()
        
        company = companies.find_one({"_id": ObjectId(company_id), "organizationId": user_organization})

        if not company:
            return error_response("Firma bulunamadı")
        
        company_info ={"CompanyName":company["name"],"CompanyNumber":company["number"],"CompanyAddress":company["address"]}
        return jsonify({"state":True,"data":company_info})

    except Exception as e:
        logger.exception("Get firm info error")
        return error_response("Firma bilgilerini çekerken hata meydana geldi.")
    
@companies_bp.route('update', methods=['PATCH'])
@token_required
def updateCompany():
    try:
        user_organization = getUserOrganization()

        data = request.get_json()
        companyId = ObjectId(data.get("companyId"))
        companyName = data.get("companyName")
        companyNumber = data.get("companyNumber")
        companyAddress = data.get("companyAddress")

        if not userIsAdmin():
            return error_response("Hatalı erişim talebi",400)
        
        CONTROL = companyName.strip() if companyName else ""
        if not CONTROL: return error_response("Firma adı boş olamaz.") 

        company = companies.find_one({
            "_id": companyId,
            "organizationId": user_organization
        })

        if not company:
            return error_response("Hatalı erişim talebi",400)
        
        companies.update_one({"_id":companyId},{"$set":{"name":companyName,"number":companyNumber,"address":companyAddress}})
        
        return jsonify({"state": True ,"msg":"Firma bilgileri başarılı şekilde güncellenmiştir."})
    except Exception as e:
        logger.exception("update company error")
        return error_response("Firma bilgileri güncellenirken hata meydana geldi.")

@companies_bp.route('contactList/<company_id>', methods=['GET'])
@token_required
def getCompanyContact(company_id):    
    try:
        user_organization = getUserOrganization()
        
        company = companies.find_one({"_id": ObjectId(company_id), "organizationId": user_organization})

        if not company:
            return error_response("Firma bulunamadı")
        
        contactList = companyContact.find({"companyId":ObjectId(company_id)})
        contactList = list(contactList)
        contactList = convert_objectid_to_str(contactList)
        # contactList = [copy.deepcopy(u) | {"_id": str(u["_id"]) + f"_{i}"} for i in range(20) for u in contactList]

        return jsonify({"state":True,"data":contactList})

    except Exception as e:
        logger.exception("Get firm contact error")
        return error_response("Firma iletişim bilgilerini çekerken hata meydana geldi.")
    
@companies_bp.route('/appendContact', methods=['POST'])  
@token_required
def appendContact():
    try:
        user_organization = getUserOrganization()

        if not userIsAdmin() and not userIsManagerAnyDept():
            return error_response("Hatalı erişim talebi",400)

        data = request.get_json()
        companyId = data.get("companyId")

        newUser = data.get("newUser")
        new_id = ObjectId()

        company = companies.find_one({"_id": ObjectId(companyId), "organizationId": user_organization})

        if not company:
            return error_response("Firma bulunamadı")

        if any(not (i or "").strip() for i in newUser.values()):
            return error_response("Kişi bilgileri boş olamaz!!")
        
        companyContact.insert_one({
            '_id': new_id,
            'name': newUser["name"],
            'mail': newUser["mail"],
            'number': newUser["number"],
            'role': newUser["role"],
            'companyId':ObjectId(companyId)
        })

        return jsonify({'state': True, 'Id': str(new_id)})
    except Exception as e:
        logger.exception("Append Company Contact error")
        return error_response("Firma iletişim bilgisi oluşturulurken hata meydana geldi.")

@companies_bp.route('deleteContact', methods=['DELETE'])
@token_required
def deleteContact():
    try:
        user_organization = getUserOrganization()

        data = request.get_json()
        companyId = ObjectId(data.get("companyId"))

        userList = list(data.get("selectedRows"))

        if not userIsAdmin() and not userIsManagerAnyDept():
            return error_response("Hatalı erişim talebi",400)
        
        company = companies.find_one({
            "_id": companyId,
            "organizationId": user_organization
        })

        if not company:
            return error_response("Hatalı erişim talebi",400)
        
        companyContact.delete_many({"_id":{"$in": convert_str_to_objectid(userList)},"companyId":companyId})
        msg = "Seçilen kişiler iletişim listesinden çıkarılmıştır." 
        return jsonify({"state": True, "msg": msg, "data": userList})
    except Exception as e:
        logger.exception("delete Contact Error")
        return error_response("Firma iletişim bilgileri silinirken hata meydana geldi.")

@companies_bp.route('updateContact', methods=['PATCH'])
@token_required
def updateContact():
    try:
        user_organization = getUserOrganization()

        data = request.get_json()
        companyId = ObjectId(data.get("companyId"))
        selectedUser = ObjectId(list(data.get("selectedUser"))[0])
        newData = data.get("newData")

        if not userIsAdmin() and not userIsManagerAnyDept():
            return error_response("Hatalı erişim talebi",400)
        
        company = companies.find_one({"_id": companyId, "organizationId": user_organization})
        user = companyContact.find_one({"_id": selectedUser, "companyId": companyId})

        if not company:
            return error_response("Firma bulunamadı veya hatalı erişim talebi")
        
        if not user:
            return error_response("Kişi bulunamadı veya hatalı erişim talebi")

        if any(not (i or "").strip() for i in newData.values()):
            return error_response("Kişi bilgileri boş olamaz!!")
        
        companyContact.update_one(
            {"_id":selectedUser},
            {"$set":{
                'name':newData["name"],
                'mail': newData["mail"],
                'number': newData["number"],
                'role': newData["role"],
            }})
        msg = "Seçilen kişinin iletişim bilgileri güncellenmiştir." 
        return jsonify({"state": True, "msg": msg})
    except Exception as e:
        logger.exception("update Contact Error")
        return error_response("Firma iletişim bilgileri güncellenirken hata meydana geldi.")
    
@companies_bp.route('departmentList/<company_id>', methods=['GET'])
@token_required
def getCompanyDepartmentList(company_id):    
    try:
        user_organization = getUserOrganization()
        
        company = companies.find_one({"_id": ObjectId(company_id), "organizationId": user_organization})

        if not company:
            return error_response("Firma bulunamadı")
        
        from queries.companies import get_company_department_list_query

        query = get_company_department_list_query(company_id)
        departmentList = department_company_access.aggregate(query)
        departmentList = list(departmentList)

        departmentList = convert_objectid_to_str(departmentList)
        # departmentList = [copy.deepcopy(u) | {"_id": str(u["_id"]) + f"_{i}"} for i in range(20) for u in departmentList]

        return jsonify({"state":True,"data":departmentList})

    except Exception as e:
        logger.exception("Get firm deparment list error")
        return error_response("Firmaya tanımlı departman bilgilerini çekerken hata meydana geldi.")
    

@companies_bp.route('addableDepartment/<company_id>', methods=['GET'])
@token_required
def getAddableDepartment(company_id):    
    try:
        user_organization = getUserOrganization()
        
        company = companies.find_one({"_id": ObjectId(company_id), "organizationId": user_organization})

        if not company:
            return error_response("Firma bulunamadı")
        
        from queries.companies import get_company_addable_department_list

        query = get_company_addable_department_list(company_id,user_organization)
        departmentList = departmentsDB.aggregate(query)
        departmentList = list(departmentList)

        departmentList = convert_objectid_to_str(departmentList)
        # departmentList = [copy.deepcopy(u) | {"_id": str(u["_id"]) + f"_{i}"} for i in range(20) for u in departmentList]

        return jsonify({"state":True,"data":departmentList})

    except Exception as e:
        logger.exception("Get firm addable department list error")
        return error_response("Firmaya tanımlanbilecek departman bilgilerini çekerken hata meydana geldi.")

@companies_bp.route('appendDepartment', methods=['POST'])
@token_required
def appendDepartment():
    try:
        user_organization = getUserOrganization()

        if not userIsAdmin():
            return error_response("Hatalı erişim talebi")
        
        data = request.get_json()
        companyId = ObjectId(data.get("companyId"))
        departmentList = list(data.get("departmentList"))

        company = companies.find_one({
            "_id": companyId,
            "organizationId": user_organization
        })

        if not company:
            return error_response("Hatalı erişim talebi")
        
        company_access=[]
        for i in departmentList:
            company_access.append({"companyId":companyId,"departmentId":ObjectId(i),"state":True})
        
        department_company_access.insert_many(company_access)

        from queries.companies import get_company_department_list_query

        query = get_company_department_list_query(companyId)  
        departmentList = list(department_company_access.aggregate(query))
        departmentList = list(departmentList)

        departmentList = convert_objectid_to_str(departmentList)
        return jsonify({"state":True,"msg":"Departmanalara firmaya erişim yetkisi verildi.","data":departmentList})
    except Exception as e:
        logger.exception("Append Company department access error")
        return error_response("Departmanlara firmaya erişim yetkisi verilirken hata meydana geldi.")

@companies_bp.route('deleteCompanyDepartment', methods=['DELETE'])
@token_required
def deleteCompanyDepartment():
    try:
        user_organization = getUserOrganization()

        data = request.get_json()
        companyId = ObjectId(data.get("companyId"))

        selectedDepartments = list(data.get("selectedRows"))

        if not userIsAdmin():
            return error_response("Hatalı erişim talebi",400)
        
        company = companies.find_one({
            "_id": companyId,
            "organizationId": user_organization
        })

        if not company:
            return error_response("Hatalı erişim talebi",400)
        
        department_company_access.delete_many({"_id":{"$in": convert_str_to_objectid(selectedDepartments)},"companyId":companyId})
        msg = "Seçilen departmanların firmaya ait kayıtları silinmiş ve listesinden çıkarılmıştır." 
        return jsonify({"state": True, "msg": msg,})
    except Exception as e:
        logger.exception("delete Company Department Error")
        return error_response("Seçilen Departmanların Firmaya ait bilgileri silinirken hata meydana geldi.")
    
@companies_bp.route('companyDepartmentCangeState', methods=['PATCH'])
@token_required
def companyDepartmentCangeState():
    try:
        user_organization = getUserOrganization()

        data = request.get_json()
        companyId = ObjectId(data.get("companyId"))
        departmentList = list(data.get("departmentList"))

        if not userIsAdmin():
            return error_response("Hatalı erişim talebi",400)
        
        company = companies.find_one({
            "_id": companyId,
            "organizationId": user_organization
        })

        if not company:
            return error_response("Hatalı erişim talebi",400)
        
        
        department_ids = convert_str_to_objectid(departmentList)

        memberships_data = list(department_company_access.find(
            {"departmentId": {"$in": department_ids}, "companyId": companyId},
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

        msg ="Departmanların firmaya erişim durumları değiştirilmiştir."
        return jsonify({"state": True, "msg": msg})


    except Exception as e:
        logger.exception("Company Department State Change Error")
        return error_response("Departmanların Firmaya erişim durumu değiştirilirken hata meydana geldi.")

@companies_bp.route('deleteCompany', methods=['DELETE'])
@token_required
def deleteCompany():
    try:
        user_organization = getUserOrganization()

        data = request.get_json()
        companyId = ObjectId(data.get("companyId"))

        if not userIsAdmin():
            return error_response("Hatalı erişim talebi",400)
        
        company = companies.find_one({
            "_id": companyId,
            "organizationId": user_organization
        })

        if not company:
            return error_response("Hatalı erişim talebi",400)
        
        department_company_access.delete_many({"companyId":companyId})
        companyContact.delete_many({"companyId":companyId})
        companies.delete_one({"_id":companyId})
        msg = "Seçilen Firmaya ait bütün kayıtlar silinmiştir." 
        return jsonify({"state": True, "msg": msg})
    except Exception as e:
        logger.exception("delete Company Department Error")
        return error_response("Seçilen Departmanların Firmaya ait bilgileri silinirken hata meydana geldi.")