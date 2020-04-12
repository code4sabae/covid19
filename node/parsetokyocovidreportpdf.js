const child_process = require('child_process')

const parseTokyoCovidReportPDF = async function(fn) {
	return new Promise((resolve, reject) => {
		const cmd = 'python3 parse_tokyo_covid_report_pdf.py ' + fn
		child_process.exec(cmd, { cwd: 'parse-tokyo-covid-report-pdf' }, function(error, stdout, stderr) {
			if (error) {
				reject(error)
			} else {
				resolve(stdout)
			}
		})
	})
}

if (require.main === module) {
} else {
}

exports.parseTokyoCovidReportPDF = parseTokyoCovidReportPDF
