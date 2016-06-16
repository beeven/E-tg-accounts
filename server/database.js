/*
TODO: paging in redis
*/


var MongoClient = require("mongodb").MongoClient,
    ObjectID = require("mongodb").ObjectID,
    Promise = require("bluebird"),
    config = require("./config");

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
            return this;
        })();
    }

    dispose() {
        if(this.db != null) {
            this.db.close();
            this.db = null;
            this.users = null;
        }
    }

    browse(pageSize, currentPage) {
        var that = this;
        return Promise.coroutine(function*(){
            var count = yield that.users.count();
            var records = yield that.users.find({},{ _id:1, email:1, comapnyId:1, companyName:1, mobile:1})
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
            return yield that.users.find({
                $or:[
                    {"email":regexCriteria},
                    {"companyId": regexCriteria},
                    {"companyName": regexCriteria},
                    {"mobile": regexCriteria}
                ]},
                {_id:1, email:1, companyId:1, companyName:1, mobile:1}
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
            var salt = yield randomBytes(64);
            var passwd = yield pbkdf2(password,salt,10000,256,'sha256');
            var hashed = Buffer.concat([salt,passwd]);
            var result = yield that.users.updateOne(
                {_id: new ObjectID(userId)},
                {$set:{password: hashed}}
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
            var passwd = yield randomBytes(4);
            passwd = passwd.toString("base64").toUpperCase().substr(0,6);
            var salt = yield randomBytes(64);
            var password = yield pbkdf2(passwd, salt, 10000, 256, 'sha256');

            var result = yield that.users.insertOne({
                email: email,
                password: Buffer.concat([salt, password]),
                mobile: mobile,
                displayName: email,
                companyId: companyId
            });

            if(result.insertedCount == 1) {
                return passwd;
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
}

module.exports = new Database();
