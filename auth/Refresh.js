var jwt = require('jsonwebtoken');
const Token = require('../models/Token.model');
var config = require('../config').config();

var Refresh = async function (req, res, next) {
    try {
        if (req.headers['x-access-token']) {
            console.log("Entre a refresh")
            // Destructuring refreshToken from cookie
            const oldToken = req.headers['x-access-token']
            var dbToken = await Token.findOne({token:oldToken})
            // Verifying refresh token
            if(dbToken){
                jwt.verify(dbToken.refreshToken, process.env.SECRET, 
                async function (err, decoded) {
                    if (err) {
                        res.locals.token = false
                        return {auth: false, message: 'Failed to authenticate token.'};
                    }
                    else {
                        // Correct token we send a new access token
                        var newToken = jwt.sign({
                            token: dbToken.refreshToken
                        }, process.env.SECRET, {
                            expiresIn: '10m' // expires in 10 minutes
                        });
                        res.locals.token = newToken
                        
                    }
                })
                if(!res.locals.token){
                    return {auth: false, message: 'Failed to authenticate token.'};
                }
                dbToken.token =  res.locals.token
                var saves = await dbToken.save()
                return {auth:true}
            }else{
                return {auth: false, message: 'Failed to authenticate token.'};
            }
        } else {
            return {auth: false, message: 'Failed to authenticate token.'};
        }
    }catch(e){
        return {auth: false, message: 'Failed to authenticate token.'};
    }
}

module.exports = Refresh;