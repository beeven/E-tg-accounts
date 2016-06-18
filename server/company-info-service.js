var request = require("request");
var config = require("./config");
var Promise = require("bluebird");

var serviceUrl = config.companyInfoServiceUrl;

exports.getCompanyInfo = function(companyId) {
    return new Promise((resolve,reject)=>{
        request.get(serviceUrl+companyId,function(err,response,body){
            if(err || response.statusCode != 200) {
                console.error("Get company info error",err);
                return reject(new Error("Get company info error"));
            }
                var result = JSON.parse(body);
                resolve({
                    companyId: result.TRADE_CO,
                    companyName: result.FULL_NAME,
                    orgCo: result.COP_GB_CODE
                });

            // catch(err) {
            //     reject(new Error("Parse body error:",err));
            // }
        });
    });

}
