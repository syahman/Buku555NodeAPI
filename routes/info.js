/**
 * Created by shmn on 07/11/2015.
 */

var info = {
    info: function (req, res) {

        res.status(200);
        res.json({
            "error": false,
            "version" : "1.0.0",
            "api" : "REST API Aplikasi Buku555",
            "desc": "ExpressJS++ORACLE API For Hybrid Mobile Apps Training Module",
            "author" : "SYAHMAN MOHAMAD",
            "email" : "dev.shmn@gmail.com"

        });
        return;
    },
    version:function (req, res) {
        res.status(200);
        res.json({
            "error": false,
            "version" : "1.0.0"
        });
        return;
    },
    error:function (req, res) {
        res.status(404);
        res.json({
            "error": true,
            "message" : "Please use POST method for this route"
        });
        return;
    }


};


module.exports = info;