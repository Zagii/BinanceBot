var utils={
    delay: function (s)
    {
        return new Promise((resolve,reject)=>{
            setTimeout(function(){ 
                console.log("...waiting ",s,"sec ...");
                resolve();
            }, s*1000);
        });
    }
};
module.exports = utils;