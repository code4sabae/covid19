// to setup
// brew install poppler
//  or
// yum install poppler; yum install poppler-utils

const fs = require('fs')
const fetch = require('node-fetch')
const child_process = require('child_process')

const normalizeText = function(s) {
	s = s.replace(/⻘/g, '青')
	s = s.replace(/⻑/g, '長')
	return s
}

const pdf2text = async function(fn) {
	return new Promise((resolve, reject) => {
		const cmd = 'pdftotext -layout -raw -nopgbrk ' + fn + ' -'
		child_process.exec(cmd, function(error, stdout, stderr) {
			if (error) {
				reject(error)
			} else {
				resolve(normalizeText(stdout))
			}
		})
	})
}

const fetchPDFtoTXT = async function(url) {
	const pdf = await (await fetch(url)).arrayBuffer()
	const t = new Date().getTime()
	const fn = 'temp/' + t
	fs.writeFileSync(fn, new Buffer.from(pdf), 'binary')
	const res = await pdf2text(fn)
	fs.unlinkSync(fn)
	return res
}

const main = async function() {
	//const url = 'https://www.mhlw.go.jp/content/10900000/000607587.pdf'
	const url = 'https://www.mhlw.go.jp/content/10900000/000608160.pdf'
  const data = await fetchPDFtoTXT(url)
  console.log(data)
}
if (require.main === module) {
	try {
		fs.mkdirSync('temp')
	} catch (e) {
	}
  main()
} else {
}

exports.pdf2text = pdf2text
exports.fetchPDFtoTXT = fetchPDFtoTXT
