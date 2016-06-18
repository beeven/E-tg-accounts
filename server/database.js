/*
TODO: paging in redis
*/


var MongoClient = require("mongodb").MongoClient,
    ObjectID = require("mongodb").ObjectID,
    Promise = require("bluebird"),
    config = require("./config"),
    crypto = require("crypto"),
    companyInfoService = require("./company-info-service");

require("bluebird-co");

var pbkdf2 = Promise.promisify(require("crypto").pbkdf2);
var randomBytes = Promise.promisify(require("crypto").randomBytes);



class Database {
    construction(){
        this.db = null;
        this.users = null;
    }

    connect() {
        var that = this;
        return Promise.coroutine(function*(){
            var db = yield MongoClient.connect(config.database.url);
            that.db = db;
            that.users = db.collection("users");
            process.on('exit',()=>{
                that.db.close();
            });
            return this;
        })();
    }

    generatePassword(predefinedPassword) {

        return Promise.coroutine(function*(){
            var passwd = predefinedPassword;
            if(typeof(predefinedPassword) === 'undefined' || predefinedPassword == null) {
                passwd = yield randomBytes(4);
                passwd = passwd.toString("base64").toUpperCase().substr(0,6);
            }
            
            var salt = yield randomBytes(64);
            const md5sum = crypto.createHash('md5');

            var hashedPasswd = md5sum.update(passwd).digest();
            var hashed = yield pbkdf2(hashedPasswd, salt, 10000, 256, 'sha256');
            return {
                salt: salt,
                password: passwd,
                hash: Buffer.concat([salt,hashed])
            };
        })();
    }

    browse(pageSize, currentPage) {
        var that = this;
        return Promise.coroutine(function*(){
            var count = yield that.users.count();
            var records = yield that.users.aggregate([
                {$project:{ _id:0,userId:"$_id", email:1, comapnyId:1, companyName:1, mobile:1}}])
                .skip(currentPage*pageSize)
                .limit(pageSize)
                .toArray();
            return {
                total: count,
                pages: Math.ceil(count / pageSize),
                records: records
            };
        })();
    }

    query(criteria) {
        var that = this;
        var regexCriteria = new RegExp(criteria.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08')); // google clousure
        return Promise.coroutine(function*(){
            return yield that.users.aggregate([{$match:{
                $or:[
                    {"email":regexCriteria},
                    {"companyId": regexCriteria},
                    {"companyName": regexCriteria},
                    {"mobile": regexCriteria}
                ]}},
                {$project:{
                    "userId":"$_id",email:1, companyId:1, companyName:1, mobile:1,_id:0
                }}]
            ).toArray();
        })();
    }

    setPassword(userId, password) {
        userId = userId.toString();
        if(!/^[a-fA-f0-9]{24}$/.test(userId)) {
            return Promise.reject(new Error("invalid userId"));
        }
        var that = this;
        return Promise.coroutine(function*(){
            var passwordInfo = yield that.generatePassword(password);
            var result = yield that.users.updateOne(
                {_id: new ObjectID(userId)},
                {$set:{password: passwordInfo.hash}}
            );
            if(result.result.n == 1) {
                return true;
            } else {
                return yield Promise.reject(new Error("userId not found"));
            }
        })();
    }

    createAccount(email,companyId,mobile){
        var that = this;
        return Promise.coroutine(function*(){
            var count = yield that.users.count({"email":email});
            if(count != 0) {
                return yield Promise.reject(new Error("email exists"));
            }
            var info = yield companyInfoService.getCompanyInfo(companyId);
            var passwordInfo = yield that.generatePassword();

            var result = yield that.users.insertOne({
                email: email,
                password: passwordInfo.hash,
                mobile: mobile,
                displayName: email,
                companyId: companyId
            });

            if(result.insertedCount == 1) {
                return {
                    userId: result.insertedId.toString(),
                    email: email,
                    password: passwordInfo.password,
                    mobile: mobile,
                    companyId: companyId,
                    companyName: info.companyName
                }
            } else {
                return yield Promise.reject(new Error("email exists"));
            }
        })();
    }

    deleteAccount(userId){
        var that = this;
        userId = userId.toString();
        if(!/^[a-fA-f0-9]{24}$/.test(userId)) {
            return Promise.reject(new Error("invalid userId"));
        }
        return Promise.coroutine(function*(){
            var result = yield that.users.deleteOne({_id:new ObjectID(userId)});
            if(result.deletedCount == 1) {
                return yield Promise.resolve();
            } else {
                return yield Promise.reject(new Error("user not found"));
            }
        })();
    }

    createTemporaryAccount(companyId) {
        var that = this;
        if(!/^\w{10}$/.test(companyId)){
            return Promise.reject(new Error("invalid companyId"));
        }
        return Promise.coroutine(function*(){
            var info = yield companyInfoService.getCompanyInfo(companyId);
            var passwordInfo = yield that.generatePassword();
            var today = new Date();
            var expire = new Date(today.setDate(today.getDate()+1));
            var result = yield that.users.insertOne({
                "email":info.companyId,
                "companyName":info.companyName,
                "companyId":info.companyId,
                "password":passwordInfo.hash,
                "expire": expire
            });
            if(result.insertedCount == 1) {
                return yield Promise.resolve({
                    userId: result.insertedId.toString(),
                    email: info.companyId,
                    companyName: info.companyName,
                    companyId: info.companyId,
                    password: passwordInfo.password,
                    expire: expire
                });
            } else {
                return yield Promise.reject(new Error("create temporary error"));
            }
        })();
    }
}

module.exports = new Database();
