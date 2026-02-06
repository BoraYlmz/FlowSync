
from bson import ObjectId

ADMIN_ROLE_ID = ObjectId("68ca705ee9f90e5a45a2ea35")
MANAGER_ROLE_ID = ObjectId("68ca7068e9f90e5a45a2ea36")

def get_department_list_query(user_id, is_admin, organization_id):
    if is_admin:
        return [
            {"$match": {"organizationId": ObjectId(organization_id)}},
            {"$lookup": {
                "from": "users",
                "localField": "ManagerId",  # artık ObjectId veya ""
                "foreignField": "_id",
                "as": "manager"
            }},
            {"$unwind": {"path": "$manager", "preserveNullAndEmptyArrays": True}},
            {"$project": {
                "_id": 1,
                "name": 1,
                "description": 1,
                "managerName": {
                    "$cond": [
                        {"$or": [{"$eq": ["$ManagerId", None]}, {"$eq": ["$ManagerId", ""]}]},
                        "Belirtilmemiş",
                        {"$concat": ["$manager.name", " ", "$manager.surname"]}
                    ]
                }
            }}
        ]
    else:
        return [
            {"$match": {"userId": ObjectId(user_id)}},
            {"$lookup": {
                "from": "departments",
                "localField": "departmentId",
                "foreignField": "_id",
                "as": "dpt"
            }},
            {"$unwind": {"path": "$dpt", "preserveNullAndEmptyArrays": True}},
            {"$lookup": {
                "from": "users",
                "localField": "dpt.ManagerId",
                "foreignField": "_id",
                "as": "manager"
            }},
            {"$unwind": {"path": "$manager", "preserveNullAndEmptyArrays": True}},
            {"$project": {
                "_id": "$dpt._id",
                "name": "$dpt.name",
                "description": "$dpt.description",
                "managerName": {
                    "$cond": [
                        {"$or": [{"$eq": ["$dpt.ManagerId", None]}, {"$eq": ["$dpt.ManagerId", ""]}]},
                        "Belirtilmemiş",
                        {"$concat": ["$manager.name", " ", "$manager.surname"]}
                    ]
                }
            }}
        ]

def get_department_details(department_id:ObjectId,organization_id:ObjectId):
    query= [{"$match":{
                    "departmentId":department_id
                }},{
                    "$lookup":{
                        "from":"users",
                        "localField":"userId",
                        "foreignField":"_id",
                        "as":"users"
                    }
                },
                {"$unwind":{
                    "path":"$users",
                    "preserveNullAndEmptyArrays":True
                }},
                {"$lookup":{
                    "from":"access",
                    "localField":"roleId",
                    "foreignField":"_id",
                    "as":"role"
                }},
                {"$unwind":{
                    "path":"$role",
                    "preserveNullAndEmptyArrays":True
                }}]

    project_stage = {
                        "_id":0,
                        "userId":"$users._id",
                        "name":"$users.name",
                        "surname":"$users.surname",
                        "birthday":{
                        "$dateToString":{
                            "format":"%d.%m.%Y",
                            "date":"$users.birthday"}},
                        "role":"$role.name",
                        "email":"$users.email"
                    }
    if department_id == organization_id:
        project_stage["userState"] = "$users.state"
    else:
        project_stage["userState"] = "$state"

    query.append({"$project": project_stage})
    return query

def get_addable_user(department_id:ObjectId,organization_id:ObjectId):
    query= [{"$match": {
                "organizationId": organization_id,
                "state": True
                }
            },
            {"$lookup": {
                "from": "memberships",
                "localField": "_id",
                "foreignField": "userId",
                "as": "memberships"
                }
            },
            {"$match": {
                "memberships.departmentId": {
                    "$ne": department_id
                     }
                }
            },
            {"$project": {
                "_id": 1,
                "name": 1,
                "surname": 1
                }
            }]
    return query

def get_assignable_user(department_id:ObjectId,organization_id:ObjectId):
    query= [{"$match": {
                "organizationId": organization_id,
                "state": True
                }
            },
            {"$lookup": {
                "from": "memberships",
                "localField": "_id",
                "foreignField": "userId",
                "as": "memberships"
                }
            },
            {"$match": {
                "memberships":{
                    "$elemMatch":{
                        "departmentId":department_id,
                        "$or":[
                            {"roleId":MANAGER_ROLE_ID},
                            {"roleId":ADMIN_ROLE_ID}
                        ]
                    }
                }
            
            }
                
            },
            {"$project": {
                "_id": 1,
                "name": 1,
                "surname": 1
                }
            }]
    return query