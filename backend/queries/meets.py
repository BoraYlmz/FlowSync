from bson import ObjectId

def getUserFrmList(userId):
    return [
    {
        "$match": {
        "userId": ObjectId(userId)
        }
    },
    {
        "$lookup": {
        "from": "department_company_access",
        "localField": "departmentId",
        "foreignField": "departmentId",
        "as": "access"
        }
    },
    {
        "$unwind": "$access"
    },
    {
        "$lookup": {
        "from": "companies",
        "localField": "access.companyId",
        "foreignField": "_id",
        "as": "company"
        }
    },
    {
        "$unwind": "$company"
    },

    {
        "$group": {
        "_id": "$company._id",
        "name": { "$first": "$company.name" }
        }
    }
    ]
    
def getDepartmentUserListQuery(dpt_id):
    return [
    {
        "$match": {
            "departmentId": ObjectId(dpt_id),
            "state":True
        }
    },
    {
        "$lookup": {
        "from": "users",
        "localField": "userId",
        "foreignField": "_id",
        "as": "usr"
        }
    },
    {
        "$unwind": "$usr"
    },
    {
        "$project": {
        "_id": "$usr._id",
        "name": { "$concat": ["$usr.name"," " ,"$usr.surname"] }
        }
    }
    ]
    
def getUserMeets(userId):
    return [
        {
            "$match": {
                "internalParticipants": { "$in": [ObjectId(userId)] }
            }
        },
        {
            "$lookup": {
                "from": "companies",
                "localField": "frmId",
                "foreignField": "_id",
                "as": "company"
            }
        },
        {
            "$unwind": "$company"
        },
        {
            "$addFields": {
                "externalParticipantsCount": {
                    "$size": { "$ifNull": ["$externalParticipants", []] }
                },
                "internalParticipantsCount": {
                    "$size": { "$ifNull": ["$internalParticipants", []] }
                }
            }
        },    
        {
            "$sort": { "meetDate": -1 }
        },
        {
            "$project": {
            "_id": 1,
            "meetHeader": 1,
            "frmName": "$company.name",

            "meetDate": {
                "$dateToString": {
                    "format": "%d.%m.%Y %H:%M",
                    "date": "$meetDate",
                    "timezone": "Europe/Istanbul"
                }
            },

            "externalParticipantsCount": 1,
            "internalParticipantsCount": 1
            }
        }
    ]

def getAllMeets(userId,dptList):
    dptIds = [d["_id"] for d in dptList]
    return [
        {
            "$match": {
               "$or": [
                    { "internalParticipants": { "$in": [ObjectId(userId)] } },
                    { "departmentId": { "$in": dptIds } }
                ]
                
            }
        },
        {
            "$lookup": {
                "from": "companies",
                "localField": "frmId",
                "foreignField": "_id",
                "as": "company"
            }
        },
        {
            "$unwind": "$company"
        },
        {
            "$addFields": {
                "externalParticipantsCount": {
                    "$size": { "$ifNull": ["$externalParticipants", []] }
                },
                "internalParticipantsCount": {
                    "$size": { "$ifNull": ["$internalParticipants", []] }
                }
            }
        },    
        {
            "$sort": { "meetDate": -1 }
        },
        {
            "$project": {
            "_id": 1,
            "meetHeader": 1,
            "frmName": "$company.name",

            "meetDate": {
                "$dateToString": {
                    "format": "%d.%m.%Y %H:%M",
                    "date": "$meetDate",
                    "timezone": "Europe/Istanbul"
                }
            },

            "externalParticipantsCount": 1,
            "internalParticipantsCount": 1
            }
        }
    ]

def get_department_list_query_for_meets(user_id, is_admin, is_manager, organization_id):
    if is_admin:
        return [
            {"$match": {"organizationId": ObjectId(organization_id)}},
            {"$project": {
                "_id": 1,
            }}
        ]
    else:
        if is_manager:
            return [
                {"$match": {"userId": ObjectId(user_id)}},
                {"$lookup": {
                    "from": "departments",
                    "localField": "departmentId",
                    "foreignField": "_id",
                    "as": "dpt"
                }},
                {"$unwind": {"path": "$dpt", "preserveNullAndEmptyArrays": True}},
                {"$match":{"dpt.ManagerId": ObjectId(user_id)}},
                {"$project": {
                    "_id": "$dpt._id",
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
                {"$project": {
                    "_id": "$dpt._id",
                }}
            ]
def getUserWorkspaceListQuery(frm_id,userId):
    return[
        {
            "$match":{
                "companyId":frm_id,
                "state":True
            }
        },
        {
            "$lookup": {
                "from": "memberships",
                "localField": "departmentId",
                "foreignField": "departmentId",
                "as": "membership"
            }
        },
        {
            "$unwind": "$membership"
        },
        {
            "$match":{
                "membership.userId":userId,
                "membership.state":True
            }
        },
        {
            "$lookup": {
                "from": "departments",
                "localField": "membership.departmentId",
                "foreignField": "_id",
                "as": "dpt"
            }
        },
        {
            "$unwind": "$dpt"
        },
        {
            "$project": {
                "_id": "$dpt._id",
                "name": "$dpt.name"
            }
        }
    ]