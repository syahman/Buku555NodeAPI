/**
 * Created by shmn on 07/11/2015.
 */


var oracledb = require('oracledb');
var moment = require('moment');
var connAttrs = require('../config/db')();


// trxdate shoud receive input from client and formatted to oracle data type timestamp before insert
// omitted for brevity, defaut to CURRENT_TIMESTAMP


var trxs = {

    readtxn: function (req, res) {



        var userid = req.validateduserid;

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

            connection.execute("SELECT * FROM B_TRXS WHERE userid=:userid ORDER by TRXDATE DESC", [userid], {
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
                    //res.contentType('application/json').status(200);
                    //res.send(JSON.stringify({error:false,data : result.rows}));
                    res.contentType('application/json').status(200).send(JSON.stringify(result.rows));
                }
                // Release the connection
                connection.release(
                    function (err) {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log("GET /read : Connection released");
                        }
                    });
            });

        });

    },

    addtxn: function (req, res) {

        //validation at client level 1st, but must provide basic validation/filters here

        var amount = req.body.amount || 0 ;
        var emel = req.validatedemel || '';
        var userid = req.validateduserid || '';
        var item = req.body.item || '';
        var trxtype = req.body.trxtype || '' ;
        var trxdate = req.body.trxdate || '' ;

        console.log('models-->');
        console.log(req);

        //var userid = require('../utils/common').getuserid(req.validatedemel);


        //console.log('Date : ' + trxdate);
        console.log('UserID With ' + req.validatedemel + ' : ' + req.validateduserid);



        if (amount == 0 || emel == '' || userid === 0 || item == '' || trxtype == '' ||  trxdate == '') {


            res.status(401);
            res.json({
                "status": 401,
                "error" : true,
                "message": "Maaf,Lengkapkan Maklumat Yang Diperlukan"
            });
            return;
        }



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
            connection.execute("INSERT INTO b_trxs VALUES (b_trxs_seq.nextval,:userid,:amount, to_date(:trxdate,'YYYY/DD/MM HH:MI AM'),:item,:active,:trxtype)",
                [userid,amount,trxdate,item,1,trxtype], {
                    autoCommit: true,
                    outFormat: oracledb.OBJECT // Return the result as Object
                },
                function (err, result) {
                    if (err) {
                        // Error
                        res.set('Content-Type', 'application/json');
                        res.status(400).send(JSON.stringify({
                            status: 400,
                            message: err.message.indexOf("ORA-00001") > -1 ? "Data already exists" : "Input Error",
                            detailed_message: err.message
                        }));
                    } else {

                           res.status(201);
                        res.json({
                            "status" : 201,
                            "error": false,
                            "message" : "Transaksi berjaya disimpan",

                        });


                    }
                    // Release the connection
                    connection.release(
                        function (err) {
                            if (err) {
                                console.error(err.message);
                            } else {
                                console.log("POST /trxs : Connection released");
                            }
                        });
                });
        });




    },

    updatetxn: function (req, res) {


        //validation at client level 1st, but must provide basic validation/filters here

        var amount = req.body.amount || 0 ;
        var emel = req.validatedemel || '';
        var userid = req.validateduserid || '';
        var item = req.body.item || '';
        var trxtype = req.body.trxtype || '' ;
        var trxdate = req.body.trxdate || '' ;


        //var userid = require('../utils/common').getuserid(req.validatedemel);


        //console.log('Date : ' + trxdate);
        console.log('UserID With ' + req.validatedemel + ' : ' + req.validateduserid);



        if (amount == 0 || emel == '' || userid === 0 || item == '' || trxtype == '' || trxdate == '') {


            res.status(401);
            res.json({
                "status": 401,
                "error" : true,
                "message": "Maaf,Lengkapkan Maklumat Yang Diperlukan"
            });
            return;
        }



        // update existing transaction ...

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
            connection.execute("UPDATE b_trxs set amount = :amount,trxdate = to_date(:trxdate,'YYYY/DD/MM HH:MI AM'), item = :item, trxtype = :trxtype where " +
                        "userid=:userid and trxid=:trxid",
                [amount,trxdate,item,trxtype,userid,req.params.trxid], {
                    autoCommit: true,
                    outFormat: oracledb.OBJECT // Return the result as Object
                },
                function (err, result) {
                    if (err) {
                        // Error
                        res.set('Content-Type', 'application/json');
                        res.status(400).send(JSON.stringify({
                            status: 400,
                            message: err.message.indexOf("ORA-00001") > -1 ? "System Error" : "Input Error",
                            detailed_message: err.message
                        }));
                    } else {

                        res.status(201);
                        res.json({
                            "status" : 201,
                            "error": false,
                            "message" : "Transaksi berjaya dikemaskini",

                        });


                    }
                    // Release the connection
                    connection.release(
                        function (err) {
                            if (err) {
                                console.error(err.message);
                            } else {
                                console.log("OUT /trxs/:trxid : Connection released");
                            }
                        });
                });
        });



    },

    deletetxn: function (req, res) {



        var userid = req.validateduserid;


        // update existing transaction ...

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
            connection.execute("DELETE FROM b_trxs where " +
                "userid=:userid and trxid=:trxid",
                [userid,req.params.trxid], {
                    autoCommit: true,
                    outFormat: oracledb.OBJECT // Return the result as Object
                },
                function (err, result) {
                    if (err) {
                        // Error
                        res.set('Content-Type', 'application/json');
                        res.status(400).send(JSON.stringify({
                            status: 400,
                            err: true,
                            message: err.message.indexOf("ORA-00001") > -1 ? "Error" : "Input Error",
                            detailed_message: err.message
                        }));
                    } else {

                        res.status(201);
                        res.json({
                            "status" : 201,
                            "error": false,
                            "message" : "Transaksi berjaya dipadam",

                        });


                    }
                    // Release the connection
                    connection.release(
                        function (err) {
                            if (err) {
                                console.error(err.message);
                            } else {
                                console.log("DELETE /trxs/:trxid : Connection released");
                            }
                        });
                });
        });



    }



};







module.exports = trxs;