const express = require('express')
const app = express()
const port = process.env.BACKEND_PORT || 3000
app.get('/health', (req, res) => {
	res.json({ "status": "ok", "message": "The backend is operational!"})
})
app.listen(port, () => {
    console.log(`the server has start on port ${port}`);
});