const express = require("express");
const router = express.Router();


// route to ensure that the server is online

//		└──>curl -i -X GET http://localhost:3000/health

//		HTTP/1.1 200 OK
//		X-Powered-By: Express
//		Content-Type: application/json; charset=utf-8
//		Content-Length: 15
//		ETag: W/"f-VaSQ4oDUiZblZNAEkkN+sX+q3Sg"
//		Date: Tue, 23 Jun 2026 15:10:55 GMT
//		Connection: keep-alive
//		Keep-Alive: timeout=5

//		{"status":"ok"}

router.get("/", (req, res) => {
	res.json({ status: "ok" });
});

module.exports = router;
