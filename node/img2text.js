// for Mac
// sudo port install tesseract
// for others
// https://github.com/tesseract-ocr/tesseract/wiki

const fs = require('fs')
const child_process = require('child_process')

exports.img2text = async function(img, stayimg) {
  return new Promise((resolve, reject) => {
    const fntxt = 'temp/' + new Date().getTime()
    const fnimg = fntxt + ".png"
    img.write(fnimg)
    const cmd = 'tesseract -l eng ' + fnimg + " " + fntxt
    child_process.exec(cmd, function(error, stdout, stderr) {
      if (!stayimg)
        fs.unlinkSync(fnimg)
      if (error) {
        reject(error)
        return
      } else {
        const res = fs.readFileSync(fntxt + ".txt", 'utf-8')
        fs.unlinkSync(fntxt + ".txt")
        resolve(res.trim())
      }
    })
  })
}
