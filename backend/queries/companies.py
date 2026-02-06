from bson import ObjectId

ADMIN_ROLE_ID = ObjectId("68ca705ee9f90e5a45a2ea35")
MANAGER_ROLE_ID = ObjectId("68ca7068e9f90e5a45a2ea36")

def get_company_list_query(user_id, is_admin, organization_id):
    if is_admin:
        return [
            {"$match": {"organizationId": ObjectId(organization_id)}},
            {"$project": {
                "_id": 1,
                "companyName": "$name",
                "companyAddress": "$address",
                "companyNumber":"$number",
            }}
        ]
    else:
        return [
           {
                "$match": 
                { 
                    "userId": user_id 
                }
            },
            {
                "$lookup": {
                    "from": "departments",
                    "localField": "departmentId", 
                    "foreignField": "_id", 
                    "as": "departmentDetails"
                }
            },
            {
                "$unwind": "$departmentDetails"
            },
            {
                "$lookup": {
                    "from": "department_company_access",
                    "localField": "departmentDetails._id",
                    "foreignField": "departmentId",
                    "as": "departmentCompanyAccess"
                }
            },
            {
                "$unwind": "$departmentCompanyAccess"
            },
            {
                "$lookup": {
                    "from": "companies",
                    "localField": "departmentCompanyAccess.companyId",
                    "foreignField": "_id",
                    "as": "companyDetails"
                }
            },
            {
                "$unwind": "$companyDetails"
            },
            {
                "$group": {
                    "_id": "$companyDetails._id",
                    "companyName": { "$first": "$companyDetails.name" },
                    "companyAddress": { "$first": "$companyDetails.address" },
                    "companyNumber": { "$first": "$companyDetails.number" }
                }
            },
            {
                "$project": {
                "_id": 1,
                "companyName": 1,
                "companyAddress": 1,
                "companyNumber": 1
                }
            }
        ]
    
def get_company_department_list_query(company_id):
    return[
        {
            "$match":{
                "companyId":ObjectId(company_id)
            }
        },
        {
            "$lookup":{
                "from":"departments",
                "localField":"departmentId",
                "foreignField":"_id",
                "as":"deptInf"
            }
        },
        {
            "$unwind":"$deptInf"
        },
        {
            "$project":{
                "_id":1,
                "deptName":"$deptInf.name",
                "state":1
            }
        }]

def get_company_addable_department_list(company_id,organization_id):
    return[
        {
            "$match":{
                "organizationId":ObjectId(organization_id)
            }
        },
        {
            "$lookup":{
                "from":"department_company_access",
                "localField":"_id",
                "foreignField":"departmentId",
                "as":"access"
            }
        },
        {
            "$match":{
                "access.companyId":{"$ne":ObjectId(company_id)}
            }
        },
        {"$project":{
            "_id":1,
            "name":1
        }
        }

    ]