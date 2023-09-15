const express = require("express");
const cors = require("cors");
const util = require('util');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
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

/* app.get("/", async (req, res) => {
	res.status(200);
	res.send("Welcome to root URL of Server");
}); */

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

// http://localhost:8021/ocr-pdf?rotate=1&background=1&deskew=1&clean=1&url=https://transfer.sh/DFGmlvglle/Public%20WaterMassMailing-1.pdf
app.get("/ocr-pdf", async (req, res) => {
	if (!fs.existsSync("./uploads")) {
		fs.mkdirSync("./uploads");
	}
	req.query.url = req.query.url || ''
	let link = req.query.url.replace(/\s+/gi, '%20')
	let params = []

	if (Number(req.query?.rotate) === 1) params.push('--rotate-pages')
	if (Number(req.query?.background) === 1) params.push('--remove-background')
	if (Number(req.query?.deskew) === 1) params.push('--deskew')
	if (Number(req.query?.clean) === 1) params.push('--clean --clean-final')

	let file = fileName(req.query.url)

	if (file && file.includes('.')) {

		console.log('LINK: ', link)

		try {
			const outputFile = `ocr-${new Date().getTime()}-${uuidv4()}.pdf`
			const { stdout, stderr } = await exec(`wget -O ./uploads/${outputFile} ${link}`);
			/* console.log('stdout:', stdout);
			console.log('stderr:', stderr); */

			await exec(`ocrmypdf --optimize 3 ${params.join(' ')}  --skip-text --sidecar './uploads/${outputFile.replace(/\.pdf$/gi, '.txt')}' './uploads/${outputFile}' './uploads/${outputFile}'`);

			res.status(200).json({ isSuccessful: true, file: outputFile })
		} catch (error) {
			console.log(error)
			res.status(200).json({ isSuccessful: false, file: '' })
		}

	} else {
		res.status(200).json({ isSuccessful: false, file: '' })
	}
});