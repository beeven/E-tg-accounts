var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    database = require("./database");



app.use(bodyParser.json())
app.use(express.static(__dirname+"/../web/accounts2/dist/"));

database.connect().then(function(){
    app.listen(8020);
},function(err){
    console.error("Cannot connect to databse:",err);
})

process.on('exit',function(code){
    database.dispose();
});
