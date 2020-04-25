// to setup
// brew install poppler
//  or
// yum install poppler; yum install poppler-utils

import fs from 'fs'
import fetch from 'node-fetch'
import child_process from 'child_process'

const exports = {}

const normalizeText = function(s) {
	s = s.replace(/⻘/g, '青')
	s = s.replace(/⻑/g, '長')
	return s
}

exports.pdf2text = async function(fn) {
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

exports.fetchPDFtoTXT = async function(url) {
	const pdf = await (await fetch(url)).arrayBuffer()
	const t = new Date().getTime()
	const fn = 'temp/' + t
	fs.writeFileSync(fn, new Buffer.from(pdf), 'binary')
	const res = await this.pdf2text(fn)
	fs.unlinkSync(fn)
	return res
}

const main = async function() {
	//const url = 'https://www.mhlw.go.jp/content/10900000/000607587.pdf'
	//const url = 'https://www.mhlw.go.jp/content/10900000/000608160.pdf'
	//const data = await fetchPDFtoTXT(url)
	const fn = '../data/mhlwgojp/hospital/000625121.pdf'
	const data = await exports.pdf2text(fn)
  console.log(data)
}
if (process.argv[1].endsWith('/pdf2text.mjs')) {
	const fn = process.argv[2]
	exports.pdf2text(fn)
}

export default exports
