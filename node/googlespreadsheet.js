const fs = require('fs')
const fetch = require('node-fetch')
const csvutil = require('./csvutil.js')

const fetchCSVfromGoogleSpreadSheet = async function(key) {
	const csvurl = `https://docs.google.com/spreadsheets/d/e/${key}/pub?gid=0&single=true&output=csv`
  const csv = await (await fetch(csvurl)).text()
  //console.log(csv)
	const data = csvutil.convertCSVtoArray(csv)
	//data.shift()
	return csvutil.csv2json(data)
}

const main = async function() {
  const key = '2PACX-1vSFMNp5HcRNOF5MrAujEUWR1dIoX2mncMEWTbPlVAaJqKWiq831-6gnCyI7n_G8YfPqNQXrfwyVjyHL'
  const data = await fetchCSVfromGoogleSpreadSheet(key)
  console.log(data)
}
if (require.main === module) {
  main()
} else {
}

exports.fetchCSVfromGoogleSpreadSheet = fetchCSVfromGoogleSpreadSheet
