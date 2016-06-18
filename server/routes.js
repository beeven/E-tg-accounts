var express = require("express"),
    router = express.Router();

var accounts = require("./accounts");


router.get("/query/:criteria",accounts.query);
router.get("/browse/:pageSize/:currentPage",accounts.browse);
// Create new regular account
router.post("/",accounts.createAccount);
router.post("/temporary",accounts.createTemporaryAccount);
// Reset account password
router.post("/setPassword",accounts.setPassword);

// Remove account
router.delete("/:userId",accounts.deleteAccount);


module.exports = router;
