/**
 * Created by shmn on 07/11/2015.
 */


var oracledb = require('oracledb');
var jwt = require('jwt-simple');
var md5 = require('md5');
var connAttrs = require('../config/db')();



var users = {

    testoracle: function (req, res) {

        console.log('connection '+ connAttrs.connectString);


        oracledb.getConnection(connAttrs, function (err, connection) {

            if (err) {
                // Error connecting to DB
                res.set('Content-Type', 'application/json');
                res.status(500).send(JSON.stringify({
                    status: 500,
                    message: "Error connecting to DB",
                    detailed_message: err.message
                }));
                return;
            }

            connection.execute("SELECT * FROM B_USERS", {}, {
                outFormat: oracledb.OBJECT // Return the result as Object
            }, function (err, result) {
                if (err) {
                    res.set('Content-Type', 'application/json');
                    res.status(500).send(JSON.stringify({
                        error:true,
                        status: 500,
                        message: "Error getting the user profile",
                        detailed_message: err.message
                    }));
                } else {
                    res.contentType('application/json').status(200);
                    res.send(JSON.stringify({error:false,data : result.rows}));
                }
                // Release the connection
                connection.release(
                    function (err) {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log("GET /test : Connection released");
                        }
                    });
            });

        });


    },

    // register new user ..


    login : function (req,res) {



        var password = req.body.password || '';
        var emel = req.body.emel || '';

        console.log(req.body);

        if (password == '' || emel == '') {


            res.status(401);
            res.json({
                "status": 401,
                "error" : true,
                "message": "Maaf,Lengkapkan Maklumat Yang Diperlukan"
            });
            return;
        }

        hashpassword = md5(password);

        // insert new user

        oracledb.getConnection(connAttrs, function (err, connection) {
            if (err) {
                // Error connecting to DB
                res.set('Content-Type', 'application/json').status(500).send(JSON.stringify({
                    status: 500,
                    error: true,
                    message: "Error connecting to DB",
                    detailed_message: err.message
                }));
                return;
            }
            connection.execute("SELECT userid,emel FROM B_USERS WHERE emel=:emel and password=:hashpassword"
                ,[emel,hashpassword], {
                    outFormat: oracledb.OBJECT // Return the result as Object

                },
                function (err, result) {
                    if (err || result.rows.length < 1) {
                        // Error
                        res.set('Content-Type', 'application/json');
                        res.status(400);
                        res.json({
                            "status": 400,
                            "error" : true,
                            "message": "Log Masuk Tidak Berjaya"
                        });
                    } else {

                        // Successfully created the resource and generate token and passing to users


                        var payload = {
                            userid : result.rows[0].USERID,
                            emel : result.rows[0].EMEL
                        }



                        res.status(201);
                        res.json({
                            "status" : 201,
                            "error": false,
                            "message" : "Log Masuk Berjaya",
                            "data" : genToken(payload)
                        });

                        return;
                    }
                    // Release the connection
                    connection.release(
                        function (err) {
                            if (err) {
                                console.error(err.message);
                            } else {
                                console.log("POST /login : Connection released");
                            }
                        });
                });
        });


    },


    adduser: function (req, res) {

        var name = req.body.name || '';
        var password = req.body.password || '';
        var emel = req.body.emel || '';




        if (name == '' || password == '' || emel == '') {


            res.status(401);
            res.json({
                "status": 401,
                "error" : true,
                "message": "Maaf,Lengkapkan Maklumat Yang Diperlukan"
            });
            return;
        }

        hashpassword = md5(password);

        // insert new user

        oracledb.getConnection(connAttrs, function (err, connection) {
            if (err) {
                // Error connecting to DB
                res.set('Content-Type', 'application/json').status(500).send(JSON.stringify({
                    status: 500,
                    error: true,
                    message: "Error connecting to DB",
                    detailed_message: err.message
                }));
                return;
            }
            connection.execute("INSERT INTO b_users VALUES (b_users_seq.nextval,:hashpassword,:name, :emel, :active) "
                               + "returning userid,emel into :ruserid, :remel"
                //,[hashpassword,name,emel,1], {
                  ,{
                    hashpassword: hashpassword,
                    name: name,
                    emel:emel,
                    active : 1,
                    ruserid: {
                        type: oracledb.NUMBER,
                        dir: oracledb.BIND_OUT
                    },
                    remel: {
                        type: oracledb.STRING,
                        dir: oracledb.BIND_OUT
                    }

                }, {
                    autoCommit: true,
                    outFormat: oracledb.OBJECT // Return the result as Object
                },
                function (err, result) {
                    if (err) {
                        // Error
                        res.set('Content-Type', 'application/json');
                        res.status(400).send(JSON.stringify({
                            status: 400,
                            message: err.message.indexOf("ORA-00001") > -1 ? "User already exists" : "Input Error",
                            detailed_message: err.message
                        }));
                    } else {

                        // Successfully created the resource and generate token and passing to users

                        var payload = {
                            userid : result.outBinds.ruserid[0],
                            emel : result.outBinds.remel[0],
                        };


                        res.status(201);
                        res.json({
                            "status" : 201,
                            "error": false,
                            "message" : "Pengguna Telah Berjaya Dicipta. Generated token",
                            "data" : genToken(payload)
                        });

                        return;
                    }
                    // Release the connection
                    connection.release(
                        function (err) {
                            if (err) {
                                console.error(err.message);
                            } else {
                                console.log("POST /users : Connection released");
                            }
                        });
                });
        });


    },

    // read user ..

    readuser: function (req, res) {

        var userid = req.validateduserid;

        oracledb.getConnection(connAttrs, function (err, connection) {
            if (err) {
                // Error connecting to DB
                res.set('Content-Type', 'application/json');
                res.status(500).send(JSON.stringify({
                    status: 500,
                    error : true,
                    message: "Error connecting to DB",
                    detailed_message: err.message
                }));
                return;
            }

            // h/she can only view own record, not somebody else record ..

            connection.execute("SELECT * FROM B_USERS WHERE userid = :userid", [userid], {
                outFormat: oracledb.OBJECT // Return the result as Object
            }, function (err, result) {



                if (err || result.rows.length < 1) {
                    res.set('Content-Type', 'application/json');
                    var status = err ? 500 : 404;
                    res.status(status).send(JSON.stringify({
                        error:true,
                        message: err ? "Error getting the user profile" : "User doesn't exist",
                        detailed_message: err ? err.message : ""
                    }));
                } else {
                    res.contentType('application/json').status(200).send(JSON.stringify(result.rows));
                }
                // Release the connection
                connection.release(
                    function (err) {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log("GET /users/" + req.params.userid + " : Connection released");
                        }
                    });
            });
        });

    },


    // read user ..

    updateuser: function (req, res) {


        var name = req.body.name || '';
        var currpassword = req.body.currpassword || '';
        var password = req.body.password || '';
        var emel = req.body.emel || '';
        var userid = req.validateduserid;

        console.log(req.body);

        if (name == '' || password == '' || emel == '' || currpassword =='') {


            res.status(401);
            res.json({
                "status": 401,
                "error" : true,
                "message": "Maaf,Lengkapkan Maklumat Yang Diperlukan"
            });
            return;
        }

        hashpassword = md5(password);

        // update existing user ..

        oracledb.getConnection(connAttrs, function (err, connection) {
            if (err) {
                // Error connecting to DB
                res.set('Content-Type', 'application/json').status(500).send(JSON.stringify({
                    status: 500,
                    error: true,
                    message: "Error connecting to DB",
                    detailed_message: err.message
                }));
                return;
            }
            connection.execute("UPDATE b_users SET password=:hashpassword,name=:name,emel=:emel where userid=:userid",
                [hashpassword,name,emel,userid], {
                    autoCommit: true,
                    outFormat: oracledb.OBJECT // Return the result as Object
                },
                function (err, result) {
                    if (err || result.rowsAffected === 0) {
                        // Error
                        res.set('Content-Type', 'application/json');
                        res.status(400).send(JSON.stringify({
                            status: 400,
                            message: err ? "Input Error" : "User doesn't exist",
                            detailed_message: err ? err.message : ""
                        }));
                    return;
                    }

                    else {


                        // Successfully created the resource and generate token and passing to users

                        var payload = {
                            userid : userid,
                            emel : emel,
                        };

                        // automatic generate token baru

                        res.set('Content-Type', 'application/json');
                        res.status(201);
                        res.json({
                            "status" : 201,
                            "error": false,
                            "token" : true,
                            "message" : "Maklumat Pengguna Telah Berjaya Dikemaskini",
                            "data" : genToken(payload)
                        });


                    }
                    // Release the connection
                    connection.release(
                        function (err) {
                            if (err) {
                                console.error(err.message);
                            } else {
                                console.log("POST /users : Connection released");
                            }
                        });
                });
        });






    },

    // delete user  .. change flag active to '0'

    deleteuser: function (req, res) {

    }



};

//private function


function genToken(user) {
    var expires = expiresIn(7); // 7 days
    var token = jwt.encode({
        exp: expires,
        user:user
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



module.exports = users;