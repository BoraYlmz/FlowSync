from bson import objectid



def get_general_user_info():
    return[{
                "$lookup":{
                    "from":"access",
                    "localField":"access_id",
                    "foreignField":"_id",
                    "as":"access"
                }},
                {"$unwind":{
                    'path': "$access", 
                    'preserveNullAndEmptyArrays': True
                }},
                {
                    "$addFields":{
                        "id":{'$toString':"$_id"}
                    }},
                {"$project":{
                    "_id":0,
                    "id":1,
                    "name":1,
                    "surname":1,
                    "email":1,
                    "birthday":{
                        "$dateToString":{
                            "format":"%d.%m.%Y",
                            "date":"$birthday"}},
                    "state":1,
                    "access":"$access.name"
                }}]