const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT = 8021;

app.listen(PORT, (error) => {
	if (!error) console.log("Server is listening on port " + PORT);
	else console.log("Error occurred, server can't start", error);
});

app.get("/", async (req, res) => {
	res.status(200);
	res.send("Welcome to root URL of Server");
});