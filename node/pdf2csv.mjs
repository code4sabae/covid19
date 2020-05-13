import child_process from 'child_process'

const exports = {}

exports.pdf2csv = async function(fn) {
	return new Promise((resolve, reject) => {
		const cmd = 'python3 pdf2csv.py ' + fn
		child_process.exec(cmd, function(error, stdout, stderr) {
			if (error) {
				reject(error)
			} else {
				resolve(stdout)
			}
		})
	})
}

const main = async function() {
}
if (process.argv[1].endsWith('/pdfcsv.mjs')) {
  main()
}

export default exports
