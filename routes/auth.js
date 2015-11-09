var jwt = require('jwt-simple');
var oracldb = require('oracledb');


var auth = {

    login: function (req, res) {
        var username = req.body.username || '';
        var password = req.body.password || '';
        if (username == '' || password == '') {


            res.status(401);
            res.json({
                "status": 401,
                "error" : true,
                "message": "Sila Isi ID Pengguna/Kata Laluan"
            });
            return;
        }

// Fire a query to your DB and check if the credentials are valid

        var dbUserObj = auth.validate(username, password);

        if (!dbUserObj) { // If authentication fails, we send a 401 back
            res.status(401);
            res.json({
                "status": 401,
                "error" : true,
                "message": "Invalid credentials"
            });
            return;
        }

        if (dbUserObj) {

// If authentication is success, we will generate a token
// and dispatch it to the client

            res.json(genToken(dbUserObj)); // client shoud save this token elsewhere .. localstorage

        }

    },

    validate: function (username, password) {


        //read oracledb here ..

        var dbUserObj = { // spoofing a userobject from the DB.
            name: 'arvind',
            role: 'admin',
            username: 'arvind@myapp.com'
        };

        return dbUserObj;
    },

    validateUser: function (username) {
// spoofing the DB response for simplicity

        var dbUserObj = { // spoofing a userobject from the DB.
            name: 'arvindx',
            role: 'admin',
            username: 'arvind@myapp.com'
        };
        return dbUserObj;
    },
}



// private method
function genToken(user) {
    var expires = expiresIn(30); // 7 days
    var token = jwt.encode({
        exp: expires
    }, require('../config/secret')());
    return {
        token: token,
        expires: expires, // client should check token expire date
        user: user
    };
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}
module.exports = auth;
