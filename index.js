const express = require("express");
const cors = require("cors");
const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);

const PORT = 8021;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("uploads"));

app.listen(PORT, (error) => {
	if (!error) console.log("Server is listening on port " + PORT);
	else console.log("Error occurred, server can't start", error);
});

app.get("/", async (req, res) => {
	res.status(200);
	res.send("Welcome to root URL of Server");
});

app.get("/ocr-pdf", async (req, res) => {
	if (!fs.existsSync("./uploads")) {
		fs.mkdirSync("./uploads");
	}
	let link = (req.query.url || '').replace(/\s+/gi, '%20')

	const { stdout, stderr } = await exec(`wget -P ./uploads ${link}`);
	console.log('stdout:', stdout);
	console.log('stderr:', stderr);

	res.status(200);
	res.send("Done-" + new Date().getTime());
});