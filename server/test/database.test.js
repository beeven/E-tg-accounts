
var config = require("../config");
var MongoClient = require("mongodb").MongoClient;
var Promise = require("bluebird");
var pbkdf2 = Promise.promisify(require("crypto").pbkdf2);
var should = require("should");
var nock = require("nock");
var url = require("url");
var crypto = require("crypto");

describe("Database tests",function(){
    var scope;
    var database;
    before(function(done){
        var u = url.parse(config.companyInfoServiceUrl);
        var pathname = u.pathname;
        u.pathname = null; u.path = null;
        scope = nock(url.format(u))
            .persist()
            .get(new RegExp(pathname.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08')+"\\w{10}"))
            .reply(200,function(uri, requestBody){
                return {
                    TRADE_CO:uri.replace(pathname,''),
                    FULL_NAME: "Hai Tong",
                    COP_GB_CODE: "123456789"
                }
            });
        database = require("../database");
        database.connect().then(function(){
            done();
        });
    });
    after(function(){
        nock.restore();
    });

    describe("#companyInfoService",function(){
        var companyInfoService = require("../company-info-service");
        it("should pass this test",function(){
            return companyInfoService.getCompanyInfo("4401986999")
                        .should.be.finally.an.Object()
                        .which.have.properties(["companyId","companyName","orgCo"])
                        .and.the.property("companyId").eql("4401986999");
        });
    });


    describe("#createAccount",function(){
        beforeEach(function(done){
            return Promise.coroutine(function*(){
                var db = yield MongoClient.connect(config.database.url);
                yield db.collection("users").deleteOne({"email":"35239520@qq.com"});
                done();
            })();
        });

        it("should create an account if email does not exists",() => {
            return database.createAccount("35239520@qq.com","4401986999","12345678901")
                .should.be.finally.an.Object()
                .with.properties(["userId","password","companyName","companyId","mobile","email"])
                .and.the.property("password").has.lengthOf(6);
        });

        it("should not create an account if email exists",() => {
            return database.createAccount("35239520@qq.com","4401986999","123455678901")
                .then(function(){return database.createAccount("35239520@qq.com","4401986999","123455678901");})
                .should.be.rejectedWith("email exists");
        });
    });

    describe("#createTemporaryAccount",function(){
        it("should create an account with given companyId",function(){
            return database.createTemporaryAccount("1234567890")
                .should.be.finally.an.Object()
                .with.properties(["userId","companyId","companyName","expire","password"])
                .and.the.property("expire").is.a.Date();
        });
    });

    describe("#setPassword",function(){
        var userId = null;
        beforeEach(function(done){
            return Promise.coroutine(function*(){
                var db = yield MongoClient.connect(config.database.url);
                var users = db.collection("users");
                yield users.deleteOne({"email":"35239520@qq.com"});
                var result = yield users.insertOne({email:"35239520@qq.com",companyId:"4401986999"});
                userId = result.insertedId;
                done();
            })();
        });
        it("should set the passowrd to speicified account",() => {
            return (Promise.coroutine(function*(){
                yield database.setPassword(userId,"1234");
                var db = yield MongoClient.connect(config.database.url);
                var account = yield db.collection("users").find({_id: userId}).limit(1).next();
                var salt = account.password.buffer.slice(0,64);
                var expected = account.password.buffer.slice(64);
                var hash = crypto.createHash('md5');
                var hashed = hash.update("1234").digest();
                var actual = yield pbkdf2(hashed,salt,10000,256,'sha256');

                if(expected.equals(actual)) {
                    return yield Promise.resolve();
                } else {
                    return yield Promise.reject(new Error("not match"));
                }
            })()).should.be.fulfilled();
        });
        it("should throw error if userId is not a valid objectID",function(){
            database.setPassword("1234","5678")
                .should.be.rejectedWith("invalid userId");
        });
    });

    describe("#query",function(){
        beforeEach(function(done){
            return Promise.coroutine(function*(){
                var db = yield MongoClient.connect(config.database.url);
                var users = db.collection("users");
                yield users.deleteMany({"email":"35239520@qq.com"});
                yield users.insertOne({email:"35239520@qq.com",companyId:"4401986999"});
                done();
            })();
        });
        it("should find qualified accounts",() => {
            return database.query("35239520")
                .should.be.finally.an.Array()
                .and.matchAny({"email":"35239520@qq.com"});
        });
    });

    describe("#browse",function(){
        it("should return total count and pages and an array of records",()=>{
            return database.browse(10,0).
                should.be.finally.an.Object()
                .which.has.properties(["total","pages","records"])
                .and.the.property("records").of.which.is.an.Array()
                .which.matchEach((elem)=>{
                    elem.should.have.properties(["userId","email"])
                })
                .with.the.property("length").belowOrEqual(10);
        });

    });

    describe("#deleteAccount",function(){
        var userId = null;
        beforeEach(function(done){
            return Promise.coroutine(function*(){
                var db = yield MongoClient.connect(config.database.url);
                var users = db.collection("users");
                yield users.deleteOne({"email":"35239520@qq.com"});
                var result = yield users.insertOne({email:"35239520@qq.com",companyId:"4401986999"});
                userId = result.insertedId;
                done();
            })();
        });
        it("should delete an account if acount exists",function(){
            return database.deleteAccount(userId).should.be.fulfilled();
        });
        it("should throw error if account does not exists",function(){
            return database.deleteAccount(userId).then(function(){
                return database.deleteAccount(userId)
            }).should.be.rejectedWith("user not found");
        });
        it("should throw error if userId is not valid",function(){
            return database.deleteAccount("1234").should.be.rejectedWith("invalid userId");
        });
    });

});
