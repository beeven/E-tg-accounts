var request = require("request");
var config = require("./config");
var Promise = require("bluebird");

var serviceUrl = config.companyInfoServiceUrl;

exports.getCompanyInfo = function(companyId) {

/*
  return Promise.resolve({
    companyId: companyId,
    companyName: "海通临时帐号",
    orgCo: "123456789"
  });
*/

    return new Promise((resolve,reject)=>{
        request.get(serviceUrl+companyId,function(err,response,body){
            if(err || response.statusCode != 200) {
                console.error("Get company info error",err);
                return reject(new Error("获取企业信息错误"));
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
