
var config = require("../config");
var MongoClient = require("mongodb").MongoClient;
var Promise = require("bluebird");
var pbkdf2 = Promise.promisify(require("crypto").pbkdf2);
var should = require("should");

describe("Database tests",function(){
    var database = require("../database");
    before(function(done){
        database.connect().then(function(){
            done();
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
                .should.be.finally.a.String().with.lengthOf(6);
        });

        it("should not create an account if email exists",() => {
            return database.createAccount("35239520@qq.com","4401986999","123455678901")
                .then(function(){return database.createAccount("35239520@qq.com","4401986999","123455678901");})
                .should.be.rejectedWith("email exists");
        });
    });

    describe("#setPassword",function(){
        beforeEach(function(done){
            return Promise.coroutine(function*(){
                var db = yield MongoClient.connect(config.database.url);
                var users = db.collection("users");
                yield users.deleteOne({"email":"35239520@qq.com"});
                yield users.insertOne({email:"35239520@qq.com",companyId:"4401986999"});
                done();
            })();
        });
        it("should set the passowrd to speicified account",() => {
            return (Promise.coroutine(function*(){
                yield database.setPassword("35239520@qq.com","1234");
                var db = yield MongoClient.connect(config.database.url);
                var account = yield db.collection("users").find({"email":"35239520@qq.com"}).limit(1).next();
                var salt = account.password.buffer.slice(0,64);
                var expected = account.password.buffer.slice(64);
                var actual = yield pbkdf2("1234",salt,10000,256,'sha256');
                if(expected.equals(actual)) {
                    return yield Promise.resolve();
                } else {
                    return yield Promise.reject(new Error("not match"));
                }
            })()).should.be.fulfilled();
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
            return database.browse(50,0).
                should.be.finally.an.Object()
                .which.has.properties(["total","pages","records"])
                .and.the.property("records").of.which.is.an.Array()
                .with.the.property("length").belowOrEqual(50);
        });
    });
});
