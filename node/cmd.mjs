import ChildProcess from 'child_process'

const exports = {}

exports.cmd = async function (cmd) {
  return new Promise((resolve, reject) => {
    ChildProcess.exec(cmd, function (error, stdout, stderr) {
      if (error) {
        reject(error)
      } else {
        resolve(stdout)
      }
    })
  })
}

const main = async function () {
}
if (process.argv[1].endsWith('/cmd.mjs')) {
  main()
}

export default exports
