#!/usr/bin/env python3
#-*- coding: UTF-8 -*-

import hashlib,os,random
import pymssql
from pymongo import MongoClient

def hashPassword(passwd):
    salt = os.urandom(64)
    md5sum = hashlib.md5()
    md5sum.update(passwd)
    hashkey = md5sum.hexdigest().encode() #string to binary
    dk = hashlib.pbkdf2_hmac('sha256',hashkey,salt,10000,256)
    return salt + dk

def generatePassword():
    selected = [random.randrange(36) for i in range(6)]
    chars = map(lambda x:chr(x+48) if x < 10 else chr(x+55), selected)
    return ''.join(chars)


def generateAccount(companyId, displayName, orgCo, ssc, mobile):
    passwd = generatePassword()
    accountInfo = {
        "companyId": companyId,
        "displayName": displayName,
        "orgCo":orgCo,
        "email":companyId,
        "mobile":mobile,
        "ssc":ssc,
        "authenticationMode":4,
        "password": hashPassword(passwd.encode())
    }
    return (accountInfo, passwd)

def getCompanyInfoes():
    conn = pymssql.connect("192.168.2.122","risk_readonly","risk_readonly","RiskH2001")
    cursor = conn.cursor(as_dict=True)
    cursor.execute("""select TRADE_CO, FULL_NAME, COP_GB_CODE, SOCIAL_CREDIT_CODE, CONTACT_MOBILE
                        from dbo.COMPANY_REL_VIEW
                        where CONTACT_MOBILE is not null""")
    for row in cursor:
        yield row
    conn.close()

def insertAccounts():
    count = 0
    client = MongoClient("mongo")
    db = client["test"]
    users = db["users"]
    accounts = db["accounts"]
    for row in getCompanyInfoes():
        accountInfo = generateAccount(row['TRADE_CO'],row['FULL_NAME'],row['COP_GB_CODE'],row['SOCIAL_CREDIT_CODE'], row['CONTACT_MOBILE'])
        users.replace_one({"email":row['TRADE_CO']},accountInfo[0],upsert=True)
        accounts.update_one({"email":row['TRADE_CO']},{"$set":{"password":accountInfo[1]}}, upsert=True)
        count += 1
        yield count
    client.close()

if __name__=="__main__":
    for i in insertAccounts():
        print(i, end='\r')
