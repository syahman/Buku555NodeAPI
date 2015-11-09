var jwt = require('jwt-simple');
var validateUser = require('../routes/auth').validateUser;

module.exports = function (req, res, next) {
// When performing a cross domain request, you will recieve
// a preflighted request first. This is to check if our the app
// is safe. 

    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];
    if (token || key) {
        try {
            var decoded = jwt.decode(token, require('../config/secret.js')());

            if (decoded.exp <= Date.now()) {
                res.status(400);
                res.json({
                    "status": 400,
                    "error" : true,
                    "message": "Token Expired"
                });
                return;
            }
// Authorize the user to see if s/he can access our resources
            var dbUser = validateUser(key); // The key would be the logged in user's username
            if (dbUser) {
                if ((req.url.indexOf('admin') >= 0 && dbUser.role == 'admin') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/v1/') >= 0)) {



                    //console.log('userid in middlewares ' + getuserid);
                    //req.validateduserid = getuserid[USERID];
                    req.validatedemel = decoded.user.emel;
                    req.validateduserid = decoded.user.userid;

                    next(); // To move to next middleware
                } else {
                    res.status(403);
                    res.json({
                        "status": 403,
                        "error" : true,
                        "message": "Not Authorized"
                    });
                    return;
                }
            } else {
// No user with this name exists, respond back with a 401
                res.status(401);
                res.json({
                    "status": 401,
                    "error" : true,
                    "message": "Invalid User"
                });
                return;
            }
        } catch (err) {
            res.status(500);
            res.json({
                "status": 500,
                "error" : true,
                "message": "Oops something went wrong : " + err,

            });
        }
    } else {
        res.status(401);
        res.json({
            "status": 401,
            "error" : true,
            "message": "Invalid Token or Key"
        });
        return;
    }
};
