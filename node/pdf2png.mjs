import child_process from 'child_process'

const exports = {}

exports.pdf2png = async function(fn) {
	return new Promise((resolve, reject) => {
		const path = fn.substring(0, fn.lastIndexOf("/"));
		const cmd = "./pdf2png " + fn + " " + path;
		child_process.exec(cmd, function(error, stdout, stderr) {
			if (error) {
				reject(error);
			} else {
				resolve(stdout);
			}
		})
	})
};

export default exports
