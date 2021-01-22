import fs from 'fs';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import util from './util.mjs';
import pdf2text from './pdf2text.mjs';

const download = async function () {
  const url = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/kekkaku-kansenshou01/houdou_00008.html";
  const BASEURL = "https://www.mhlw.go.jp";

  const html = await (await fetch(url)).text();
  const parseLink = function(data) {
    const dom = cheerio.load(data)
    const res = [];
    //dom('#l-contentBody a').each((idx, ele) => {
    dom("a").each((idx, ele) => {
      const href = dom(ele).attr("href")
      const url = href.startsWith("https://") || href.startsWith("http://") ? href : (href.startsWith("/") ? BASEURL + href : href);
      res.push(url);
    })
    return res
  };
  const res = parseLink(html).filter(url => url.endsWith(".pdf"));
  res.forEach(async (url) => {
    const path = "../data/covid19influ/";
    const fn = url.substring(url.lastIndexOf("/") + 1);
    console.log(fn);
    try {
      fs.readFileSync(path + fn);
      return;
    } catch (e) {
      const pdf = await (await fetch(url)).arrayBuffer()
      fs.writeFileSync(path + fn, new Buffer.from(pdf), 'binary')
      console.log(path + fn, "saved");
      await make(fn);
    }
  });
};
const make = async (pdffn) => {
  const fn = "../data/covid19influ/" + pdffn;
  const txt = await pdf2text.pdf2text(fn);
  const ss = txt.split("\n");
  const n = ss.indexOf("報告数 定点当たり");
  if (n < 0) {
    new Error("not found 報告数 定点当たり");
  }
  const res = {};
  const dparse = (day) => {
    // 2020年43週(10月15日〜10月29日)
    const s = day.match(/(\d+)年(\d+)週\((\d+)月(\d+)日～(\d+)月(\d+)日\)/);
    res["年"] = s[1];
    res["週"] = s[2];
    res["開始日"] = s[1] + "/" + s[3] + "/" + s[4];
    res["終了日"] = s[1] + "/" + s[5] + "/" + s[6];
  };
  dparse(ss[n - 1]);
  for (let i = n + 1; i < n + 50; i++) {
    const removeComma = (s) => {
      return s.replace(/,/g, "");
    };
    const parse = (s) => {
      const ss = s.split(" ");
      const name = ss.filter((v, idx) => idx < ss.length - 2).join("");
      //console.log(name);
      res[name] = removeComma(ss[ss.length - 2]);
      const o2 = {};
      res[name + "（定点当たり）"] = removeComma(ss[ss.length - 1]);
    };
    parse(ss[i]);
  }
  const json = [res];
  console.log(json);

  const fn2 = fn.substring(0, fn.lastIndexOf("."));
  fs.writeFileSync(fn2 + ".txt", txt);
  fs.writeFileSync(fn2 + ".json", JSON.stringify(json));
  fs.writeFileSync(fn2 + ".csv", util.addBOM(util.encodeCSV(util.json2csv(json))));
  return json;
};

const makeAll = async () => {
  const path = "../data/covid19influ/";
  const json = fs.readdirSync(path)
    .filter((path) => path.endsWith(".json"))
    .map(fn => JSON.parse(fs.readFileSync(path + fn)))
    .sort((a, b) => new Date(a[0].開始日).getTime() - new Date(b[0].開始日).getTime())
    .flat();
  console.log(json);
  //process.exit(0);
  /*
  const res = [];
  list.forEach(async (pdffn) => {
    const fn = path + pdffn;
    const fn2 = fn.substring(0, fn.lastIndexOf("."));
    try {
      const d = JSON.parse(fs.readFileSync(fn2 + ".json"));
      res.push(d);
    } catch (e) {
      const d = await make(pdffn);
      res.push(d);
    }
  });
  const json = res.flat();
  */
  const fnall = "../data/covid19influ";
  fs.writeFileSync(fnall + ".json", JSON.stringify(json));
  fs.writeFileSync(fnall + ".csv", util.addBOM(util.encodeCSV(util.json2csv(json))));
};

const main = async () => {
  //await download()
  await makeAll();
};

if (process.argv[1].endsWith('/covid19influ.mjs')) {
  main();
}
