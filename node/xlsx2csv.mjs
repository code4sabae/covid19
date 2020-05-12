const decodeExcelRow = function (s) {
  let n = 0
  for (let i = 0; i < s.length; i++) {
    const m = s.charCodeAt(i) - 'A'.charCodeAt(0) + 1
    n = n * 26 + m
  }
  return n
}
const encodeExcelRow = function (n) {
  let s = ''
  n--
  let flg = false
  for (;;) {
    const m = (flg ? n - 1 : n) % 26
    s = String.fromCharCode('A'.charCodeAt(0) + m) + s
    n = Math.floor(n / 26)
    if (!n) { break }
    flg = true
  }
  return s
}

/*
for (let i = 1; i < 5000; i++) {
  const s = encodeExcelRow(i)
  const m = decodeExcelRow(s)
  console.log(i, s, m, i === m)
}
process.exit(0)
*/

const xlsx2csv = function (sheet) {
  const res = []
  const rect = sheet['!ref'].match(/(\D+)(\d+):(\D+)(\d+)/)
  const colst = decodeExcelRow(rect[1])
  const rowst = parseInt(rect[2])
  const coled = decodeExcelRow(rect[3])
  const rowed = parseInt(rect[4])
  for (let i = 0; i < rowed - rowst + 1; i++) {
    const row = i + rowst - 1
    const line = []
    let dataflg = false
    for (let j = 0; j < coled - colst + 1; j++) {
      const col = encodeExcelRow(j + colst)
      const cell = sheet[col + row]
      if (cell) {
        const v = sheet[col + row].w // v
        line.push(v)
        dataflg = true
      } else {
        line.push('')
      }
    }
    if (dataflg) {
      res.push(line)
    }
  }
  return res
}

export default { xlsx2csv }
