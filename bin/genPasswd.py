#!/usr/bin/env python3
#-*- coding: UTF-8 -*-

import hashlib,os,random
import pymongo
import pymssql

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


def generateAccount(companyId):
    pass
