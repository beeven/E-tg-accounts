var express = require("express"),
    router = exporess.Router(),
    db = require("./database");


/*
    Query
*/
router.get("/query/:criteria",function(req,res){
    var criteria = req.params.criteria;
    if(!criteria || criteria.length < 2) {
        return res.json({"result":"fail", error:"length of criteria should be greater than 1"});
    }

    // currently return all data, paging in web browser;
    db.query(criteria)
        .then(function(records){
            res.json({"result":"ok","records":records});
        },function(err){
            res.json({"result":"fail", "error":err});
        });
});

router.get("/browse/:pageSize/:currentPage",function(req,res){
    var pageSize = parseInt(req.params.pageSize),
        currentPage = parseInt(req.params.currentPage);
    if(currentPage == NaN || currentPage < 0) {
        currentPage = 0;
    }
    if(pageSize == NaN || pageSize < 10) {
        pageSize = 10;
    }

    db.browse(pageSize,currentPage)
        .then(function(records){
            res.json({"result":"ok", "records":records});
        },function(err){
            res.json({"result":"fail", "error":err});
        });
});


// Get account info
router.get("/:id",function(req,res){

});

// Create new regular account
router.post("/createAccount",function(req,res){
    var companyId = req.body.companyId,
        email = req.body.email,
        mobile = req.body.mobile;

    if(!companyId || !email || !mobile) {
        return res.json({"result":"fail",error: "companyId, email, mobile cannot be null"});
    }

    db.createAccount(email,companyId,mobile)
        .then(function(passwd){
            res.json({"password":passwd, result:"ok"});
        },function(err){
            res.json({"result":"fail", error:err});
        });
});


// Reset account password
router.post("/setPassword",function(req,res){
    var userId= req.body.userId;
        passwd = req.body.password; // password in md5

    if(!userId || !password) {
        return res.json({"result":"fail", error:"userId and password cannot be null"});
    }

    db.resetPassword(userId, password)
        .then(function(){
            res.json({"result":"ok"});
        },function(err){
            res.json({"result":"fail", error:err});
        });
});

// Remove account
router.delete("/:id",function(req,res){

});
