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

const fileName = (url) => {
	let arr = url.split('/')
	let fileName = ''
	if (arr.length > 0) {
		fileName = arr[arr.length - 1]
	}
	return fileName
}

const delFile = async (file) => {
	let res = false
	if (fs.existsSync(file)) {
		res = await new Promise((resolve, reject) => {
			fs.unlink(file, function () {
				resolve(true);
			});
		});
	}
	return res
}

app.get("/ocr-pdf", async (req, res) => {
	if (!fs.existsSync("./uploads")) {
		fs.mkdirSync("./uploads");
	}
	req.query.url = req.query.url || ''
	let link = req.query.url.replace(/\s+/gi, '%20')

	let file = fileName(req.query.url)

	if (file && file.includes('.')) {

		try {
			// await delFile('./uploads/' + file)
			// await delFile('./uploads/' + file.replace(/\.pdf/gi, '-output.pdf'))
			const outputFile = `ocr-${new Date().getTime()}.pdf`
			const { stdout, stderr } = await exec(`wget -P ./uploads/${outputFile} ${link}`);
			/* console.log('stdout:', stdout);
			console.log('stderr:', stderr); */

			await exec(`ocrmypdf ./uploads/${outputFile} ./uploads/${outputFile}}`);

			res.status(200).json({ isSuccessful: true, file: outputFile })
		} catch (error) {
			console.log(error)
			res.status(200).json({ isSuccessful: false, file: '' })
		}

	} else {
		res.status(200).json({ isSuccessful: false, file: '' })
	}
});