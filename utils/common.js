/**
 * Created by shmn on 08/11/2015.
 */

var oracledb = require('oracledb');


var connAttrs = {
    "user": "buku555",
    "password": "buku555",
    "connectString": "localhost/XE"
}

var userid = 0;

var common = {

    test : function(emel) {
        return 'saya lah ni';
    },

    getuserid: function (emel) {




        oracledb.getConnection(connAttrs, function (err, connection) {


            // s/he can only view own record, not somebody else record ..

            connection.execute("SELECT userid FROM B_USERS WHERE emel = :emel", [emel], {
                outFormat: oracledb.OBJECT // Return the result as Object
            }, function (err, result) {

                if (err || result.rows.length < 1) {
                        console.log('error execute using emel ' + emel);
                        console.log(result.rows.length);
                } else {


                        userid = result.rows[0].USERID;


                }
                // Release the connection
                connection.release(
                    function (err) {
                        if (err) {
                            console.error(err.message);
                        } else {

                            console.log("common.getid() : Connection released");

                        }
                    });
            });
        });


       //console.log('userid : ' + JSON.stringify(userid));

        //sleep(1000, function() {
            return userid;
        //});



    }

};

function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}


module.exports = common;