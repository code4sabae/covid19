import fs from 'fs'
import fetch from 'node-fetch'
import cheerio from 'cheerio'
import util from './util.mjs'
import pdf2text from './pdf2text.mjs'
//import pdf2text from './pdf2text.js'

// https://www.mhlw.go.jp/stf/covid-19/open-data.html

const path = "../data/mhlw_go_jp/opendata/";

const download = async function () {
  const list = [ // 2021-07-28から変更
    "https://covid19.mhlw.go.jp/public/opendata/newly_confirmed_cases_daily.csv", // 新規陽性者数の推移（日別） - Date,Prefecture,Newly confirmed cases 2020-01-26/
    "https://covid19.mhlw.go.jp/public/opendata/requiring_inpatient_care_etc_daily.csv", // 入院治療等を要する者等推移 - Date,Prefecture,Requiring inpatient care,Discharged from hospital or released from treatment,To be confirmed 2020-05-09/
    "https://covid19.mhlw.go.jp/public/opendata/deaths_cumulative_daily.csv", // 死亡者数（累積）- Date,Prefecture,Deaths(Cumulative) (ALL/Hokkaido) 2020-05-09/
    "https://covid19.mhlw.go.jp/public/opendata/severe_cases_daily.csv", // 重症者数の推移 - Date,Prefecture,Severe cases 2020-05-09/
    // 変更なし
    "https://www.mhlw.go.jp/content/pcr_tested_daily.csv", // PCR検査実施人数
    "https://www.mhlw.go.jp/content/pcr_case_daily.csv", // PCR検査の実施件数
    "https://www.mhlw.go.jp/content/employment_subsidy_week.csv", // 雇用調整助成金
    "https://www.mhlw.go.jp/content/life_welfare_small_fund.csv", // 緊急小口資金等の特例貸付
  ];
  /*
  // old
  const list = [
    "https://www.mhlw.go.jp/content/pcr_positive_daily.csv",　// 日付,PCR 検査陽性者数(単日) 2021-07-27まで
    "https://www.mhlw.go.jp/content/pcr_tested_daily.csv", // 日付,PCR 検査実施件数(単日) 2021-08-02まで
    "https://www.mhlw.go.jp/content/cases_total.csv", // "日付	",入院治療を要する者
    "https://www.mhlw.go.jp/content/recovery_total.csv", // 日付,退院、療養解除となった者 2021-07-27まで
    "https://www.mhlw.go.jp/content/death_total.csv", // 日付,死亡者数
    "https://www.mhlw.go.jp/content/pcr_case_daily.csv", // 日付,国立感染症研究所,検疫所,地方衛生研究所・保健所,民間検査会社（主に行政検査）,大学等,医療機関,民間検査会社（主に自費検査） 2021-08-01まで
    "https://www.mhlw.go.jp/content/current_situation.csv", // ,PCR検査\n実施人数 ※3,陽性者数,入院治療等を要する者の数,うち重症者の数,退院又は療養解除と\nなった者の数,死亡者数,確認中 ※4
    "https://www.mhlw.go.jp/content/employment_subsidy_week.csv",　// 日付,支給申請件数,累計支給申請件数,支給決定件数,累計支給決定件数,支給決定額,累計支給決定額 2021-07-30まで
    "https://www.mhlw.go.jp/content/life_welfare_small_fund.csv", // 日付,支給申請件数,累計支給申請件数,支給決定件数,累計支給決定件数,支給決定額,累計支給決定額 7/24まで
  ];
  */

  //const basefn = "mhlw-2020-07-06";
  for (const l of list) {
    const url = l;
    const fn = l.substring(l.lastIndexOf('/') + 1);
    // const csv = await (await fetch(url)).text(); // 2020-07-14分 SJIS交じる
    const csv = await util.fetchText(url);
    console.log(csv.length, l)
  
    //fs.writeFileSync(path + fn + '.csv', util.addBOM(util.encodeCSV(csv)), 'utf-8')
    fs.writeFileSync(path + fn, csv, 'utf-8')
  }
};
const merge = async () => {
  // "日付","PCR 検査陽性者数","退院、療養解除となった者","入院治療を要する者","PCR 検査実施件数","死亡者数","国立感染症研究所","検疫所","地方衛生研究所・保健所","民間検査会社","大学等","医療機関"
  const list2_daily = [
    "https://covid19.mhlw.go.jp/public/opendata/newly_confirmed_cases_daily.csv", // 新規陽性者数の推移（日別） - Date,Prefecture,Newly confirmed cases 2020-01-26/
    "https://covid19.mhlw.go.jp/public/opendata/requiring_inpatient_care_etc_daily.csv", // 入院治療等を要する者等推移 - Date,Prefecture,Requiring inpatient care,Discharged from hospital or released from treatment,To be confirmed 2020-05-09/
    "https://covid19.mhlw.go.jp/public/opendata/deaths_cumulative_daily.csv", // 死亡者数（累積）- Date,Prefecture,Deaths(Cumulative) (ALL/Hokkaido) 2020-05-09/
    "https://covid19.mhlw.go.jp/public/opendata/severe_cases_daily.csv", // 重症者数の推移 - Date,Prefecture,Severe cases 2020-05-09/

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
      if (d.Prefecture) {
        if (d.Prefecture != "ALL") {
          continue;
        }
        delete d.Prefecture;
      }
      if (d.Date) {
        d.日付 = d.Date;
        delete d.Date;
      }
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
    //console.log(data)
    //break;
  }
  const data2 = Object.values(data);
  console.log(data2[0]);
  data2.sort((a, b) => a.日付.localeCompare(b.日付));
  const csv = util.json2csv(data2);
  console.log(csv[csv.length - 1]);
  util.writeCSV(path + "covid19_all", csv);

  /*

  const json = makeCurrentPatientsJSON(txt, csv, url, urlweb)
  const scsv = util.addBOM(util.encodeCSV(util.json2csv(json.area)))
  console.log(path + json.lastUpdate + '.csv')
  fs.writeFileSync(path + json.lastUpdate + '.csv', scsv, 'utf-8')
  fs.writeFileSync(path + fn + '.json', JSON.stringify(json), 'utf-8')

  fs.writeFileSync(path + '../covid19japan.csv', scsv, 'utf-8')
  fs.writeFileSync(path + '../covid19japan.json', JSON.stringify(json), 'utf-8')
  */
};
const make = async () => {
  // https://covid19.mhlw.go.jp/extensions/public/index.html
  const names = {
    "PCR 検査陽性者数": "Newly confirmed cases",
    "入院治療を要する者": "Requiring inpatient care",
    "退院、療養解除となった者": "Discharged from hospital or released from treatment",
    "死亡者数": "Deaths",
    "入院治療を要する者": "Requiring inpatient care",
    "確認中": "To be confirmed",
    "重症者数": "Severe cases",
  };
  const rnames = {};
  for (const n in names) {
    rnames[names[n]] = n;
  }

  const csv = util.readCSV(path + "covid19_all");
  const json = util.csv2json(csv);
  console.log(json);
  for (const d of json) {
    for (const enname in rnames) {
      const janame = rnames[enname];
      if (!d[janame] && d[enname]) { // janameが無い時だけ使用
        d[janame] = d[enname];
      }
      delete d[enname];
    }
  }
  const csv2 = util.json2csv(json);
  util.writeCSV(path + "covid19", csv2);
};

const main = async () => {
  await download()
  await merge();
  await make();
};

if (process.argv[1].endsWith('/covid19mhlw.mjs')) {
  main();
}
