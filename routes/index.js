var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var auth = require('./auth.js');
var user = require('./users.js');
var info = require('./info.js');
var trx  = require('./trxs.js');


/*
 * Routes that can be accessed by any one
 */

router.get('/', info.info);

router.post('/login', user.login);
router.get('/login',info.error);
router.get('/about', info.info);
router.get('/version', info.version);
router.get('/testoracle',user.testoracle); //disable in production ..
router.post('/register', user.adduser); // rekod baru users , no auth!

/*
 * Routes that can be accessed only by authenticated users
 */

/*
#	Endpoint URL	Kaedah	Parameter	Keterangan
1	/users	POST	tba	rekod baru users
2	/users/:userid	GET	tba	baca rekod users
3	/users/:userid	PUT	tba	update rekod users
4	/users/:userid	DELETE	tba	padam rekod users
5	/trxs	POST	tba	transaksi baru
6	/trxs/:userid	GET	tba	baca transaksi/userid
7	/trxs/:userid	PUT	tba	update transaksi/userid
8	/trxs/:trxid/:userid	DELETE	tba	padam rekod transaksi
9	/about	GET	tba	kredit aplikasi
10	/version	GET	tba
*/

// endpoints users

//router.post('/api/v1/users', user.adduser); // rekod baru users , no auth!
router.get('/api/v1/users', user.readuser); // baca rekod users
router.put('/api/v1/users', user.updateuser); // kemaskini rekod users
//router.delete('/api/v1/users/:userid', user.delete);

// endpoints transactions

router.get('/api/v1/trxs',trx.readtxn);
router.post('/api/v1/trxs',trx.addtxn);
router.put('/api/v1/trxs/:trxid',trx.updatetxn);
router.delete('/api/v1/trxs/:trxid',trx.deletetxn);


//transaction, hasil vs belanja

module.exports = router;