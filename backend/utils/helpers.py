from bson import ObjectId
from routes.decorators import token_required
from extensions import db
from flask import g
import re

email_regex = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'

users = db["users"]
memberships = db["memberships"]

ADMIN_ROLE_ID = ObjectId("68ca705ee9f90e5a45a2ea35")
MANAGER_ROLE_ID = ObjectId("68ca7068e9f90e5a45a2ea36")

def convert_objectid_to_str(docs):
    for doc in docs:
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                doc[key] = str(value)
            elif isinstance(value, list) and value and isinstance(value[0], ObjectId):
                doc[key] = [str(item) for item in value]
    return docs

def convert_str_to_objectid(id_list):
    return [ObjectId(i) for i in id_list if ObjectId.is_valid(i)]

@token_required
def userIsAdmin():
    is_admin = memberships.find_one({
        "userId": ObjectId(g.user_id),
        "roleId": ADMIN_ROLE_ID
    })
    if is_admin:
        return True
    else:
        return False
    
@token_required
def userIsManager(dept_id):
    is_manager = memberships.find_one({
        "userId": ObjectId(g.user_id),
        "roleId": MANAGER_ROLE_ID,
        "departmentId":ObjectId(dept_id)
    })
    if is_manager:
        return True
    else:
        return False

@token_required
def getUserOrganization():
    user = users.find_one({"_id": ObjectId(g.user_id)})
    user_organization = user['organizationId']

    return ObjectId(user_organization)

@token_required
def userIsManagerAnyDept():
    is_manager = memberships.find_one({
        "userId": ObjectId(g.user_id),
        "roleId": MANAGER_ROLE_ID
    })
    if is_manager:
        return True
    else:
        return False


def is_valid_email(email: str) -> bool:
    return re.match(email_regex, email) is not None
 

