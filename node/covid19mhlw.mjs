import fs from 'fs'
import fetch from 'node-fetch'
import cheerio from 'cheerio'
import util from './util.mjs'
import pdf2text from './pdf2text.mjs'
//import pdf2text from './pdf2text.js'


const path = "../data/mhlw_go_jp/opendata/";

const download = async function () {
  const list = [
    "https://www.mhlw.go.jp/content/pcr_positive_daily.csv",
    "https://www.mhlw.go.jp/content/pcr_tested_daily.csv",
    "https://www.mhlw.go.jp/content/cases_total.csv",
    "https://www.mhlw.go.jp/content/recovery_total.csv",
    "https://www.mhlw.go.jp/content/death_total.csv",
    "https://www.mhlw.go.jp/content/pcr_case_daily.csv",
    "https://www.mhlw.go.jp/content/current_situation.csv",
    "https://www.mhlw.go.jp/content/employment_subsidy_week.csv",
    "https://www.mhlw.go.jp/content/life_welfare_small_fund.csv",
  ];

  const basefn = "mhlw-2020-07-06";
  for (const l of list) {
    const url = l;
    const fn = l.substring(l.lastIndexOf('/') + 1);
    // const csv = await (await fetch(url)).text(); // 2020-07-14分 SJIS交じる
    const csv = await util.fetchText(url);
    console.log(csv, l)
  
    //fs.writeFileSync(path + fn + '.csv', util.addBOM(util.encodeCSV(csv)), 'utf-8')
    fs.writeFileSync(path + fn, csv, 'utf-8')
  }
};
const make = async () => {
  const list2_daily = [
    "https://www.mhlw.go.jp/content/pcr_positive_daily.csv",
    "https://www.mhlw.go.jp/content/pcr_tested_daily.csv",
    "https://www.mhlw.go.jp/content/pcr_case_daily.csv",
    "https://www.mhlw.go.jp/content/cases_total.csv",
    "https://www.mhlw.go.jp/content/recovery_total.csv",
    "https://www.mhlw.go.jp/content/death_total.csv",
  ];
  const data = {};
  const normalizeDate = d => {
    console.log(d);
    const num = d.match(/(\d+)\/(\d+)\/(\d+)/);
    if (!num || num.length < 4) {
      return null;
    }
    return `${num[1]}-${util.fix0(num[2], 2)}-${util.fix0(num[3], 2)}`;
  };
  for (const l of list2_daily) {
    const url = l;
    const fn = l.substring(l.lastIndexOf("/") + 1, l.lastIndexOf("."));
    console.log(fn);
    const csv = util.readCSV(path + fn);
    const json = util.csv2json(csv);
    console.log(path + fn);
    for (const d of json) {
      const dt = normalizeDate(d.日付);
      if (!dt) {
        continue;
      }
      d.日付 = dt;
      const a = data[dt];
      if (a) {
        Object.assign(a, d);
      } else {
        data[dt] = d;
      }
    }
  }
  const data2 = Object.values(data);
  console.log(data2);
  const csv = util.json2csv(data2);
  csv.sort((a, b) => a - b);
  console.log(csv[csv.length - 1]);
  util.writeCSV(path + "covid19", csv);

  /*

  const json = makeCurrentPatientsJSON(txt, csv, url, urlweb)
  const scsv = util.addBOM(util.encodeCSV(util.json2csv(json.area)))
  console.log(path + json.lastUpdate + '.csv')
  fs.writeFileSync(path + json.lastUpdate + '.csv', scsv, 'utf-8')
  fs.writeFileSync(path + fn + '.json', JSON.stringify(json), 'utf-8')

  fs.writeFileSync(path + '../covid19japan.csv', scsv, 'utf-8')
  fs.writeFileSync(path + '../covid19japan.json', JSON.stringify(json), 'utf-8')
  */
}

const main = async () => {
  await download()
  await make();
};

if (process.argv[1].endsWith('/covid19mhlw.mjs')) {
  main();
}
