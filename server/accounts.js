var express = require("express"),
    router = express.Router(),
    db = require("./database");

exports.query = function(req, res) {
    var criteria = req.params.criteria;
    if(!criteria || criteria.length < 2) {
        return res.json({"result":"fail", error:"length of criteria should be greater than 1"});
    }

    // currently return all data, paging in web browser;
    db.query(criteria)
        .then(function(records){
            res.json({"result":"ok","data":records});
        },function(err){
            res.json({"result":"fail", "error":err.toString()});
        });
}

exports.browse = function(req,res) {
    var pageSize = parseInt(req.params.pageSize),
        currentPage = parseInt(req.params.currentPage);
    if(currentPage == NaN || currentPage < 0) {
        currentPage = 0;
    }
    if(pageSize == NaN || pageSize < 0) {
        pageSize = 10;
    }

    db.browse(pageSize,currentPage)
        .then(function(result){
            res.json({"result":"ok", data: result});
        },function(err){
            res.json({"result":"fail", "error":err.toString()});
        });
}

exports.createAccount = function(req,res){
    var companyId = req.body.companyId,
        email = req.body.email,
        mobile = req.body.mobile;

    if(!companyId || !email || !mobile) {
        return res.json({"result":"fail",error: "companyId, email, mobile cannot be null"});
    }

    db.createAccount(email,companyId,mobile)
        .then(function(account){
            res.json({result:"ok", data: account});
        },function(err){
            res.json({"result":"fail", error:err.toString()});
        });
}

exports.createTemporaryAccount  = function(req,res){
    var companyId = req.body.companyId;
    if(!/\w{10}/.test(companyId)) {
        return res.json({"result":"fail", error:"Invalid companyId"});
    }
    db.createTemporaryAccount(companyId).then(function(account){
        return res.json({"result":"ok", data: account});
    },function(err){
        console.error("createTemporaryAccount error",err);
        return res.json({"result":"fail", error: err.toString()});
    });
}

exports.setPassword = function(req,res){
    var userId= req.body.userId;
        passwd = req.body.password; // password in md5
    if(!userId || !password) {
        return res.json({"result":"fail", error:"userId and password cannot be null"});
    }
    db.resetPassword(userId, password)
        .then(function(){
            res.json({"result":"ok"});
        },function(err){
            res.json({"result":"fail", error:err.toString()});
        });
}

exports.deleteAccount = function(req, res) {
    var userId = req.params.userId;
    if(!/\w{24}/.test(userId)) {
        return res.json({"result":"fail", error:"userId is not valid"});
    }
    db.deleteAccount(userId).then(function(){
        return res.json({"result":"ok"});
    },function(err){
        return res.json({"result":"fail", error:err.toString()});
    });

}
