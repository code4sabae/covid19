import { CSV } from "https://js.sabae.cc/CSV.js";
import { ArrayUtil } from "https://js.sabae.cc/ArrayUtil.js";
import { JAPAN_PREF_SHORT, JAPAN_PREF, JAPAN_PREF_EN,  } from "https://js.sabae.cc/JAPAN_PREF.js"
import { HTMLParser } from "https://js.sabae.cc/HTMLParser.js";
import { fix0 } from "https://js.sabae.cc/fix0.js";
import { fetchBin } from "https://js.sabae.cc/fetchBin.js";
import { Day } from "https://js.sabae.cc/DateTime.js";

const toHalf = function(s) {
  if (s === null || s === undefined)
    return s
  const ZEN = "０１２３４５６７８９（）／ー！＆：　ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ"
  const HAN = "0123456789()/-!&: abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let s2 = ""
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i)
    const n = ZEN.indexOf(c)
    if (n >= 0) {
      s2 += HAN.charAt(n)
    } else {
      s2 += c
    }
  }
  return s2
}

const pdf2json = async (pdffn, jsonfn) => {
  const p = Deno.run({ cmd: ["node", "pdf2json.mjs", pdffn, jsonfn] });
  await p.status();
};

const json2array = (json) => {
  //const t = json.formImage.Pages[0].Texts;
  const t = json.Pages[0].Texts;
  const ys = ArrayUtil.toUnique(t.map(t => t.y));
  
  ys.sort((a, b) => a - b);
  //ys.map(y => decodeURIComponent(t.filter(t => t.y == y).map(t => t.R[0].T).join("")));
  //const s = t.filter(t => t.y == 9.42).map(t => t.R[0].T).join("")
  
  const parseLine = (y) => {
    const xs = t.filter(t => t.y == y);
    xs.sort((a, b) => a - b);
    let w = 1;
    let x = xs[0].x;
    const ss = [];
    xs.forEach(d => {
      if (d.x - x > w) {
        ss.push("\t");
      }
      x = d.x;
      ss.push(decodeURIComponent(d.R[0].T));
    });
    return ss.join("").split("\t");
  };
  
  const lines = ys.map(y => parseLine(y));
  return lines;
};
const array2csv = (lines) => {
  const prefs = lines.filter(l => JAPAN_PREF_SHORT.includes(l[0]));
  console.log(prefs.length);
  if (prefs.length != 47) {
    throw new Error("illegal pref, data is not support format!! *********************");
  }
  const prefs2 = prefs.map(p => p.filter(s => s.indexOf("※") == -1));
  const not8 = prefs2.find(p => p.length != 8);
  if (not8) {
    console.log(not8, not8.length);
    throw new Error("line.length != 8, data is not support format!! *********************");
  }
  prefs2.forEach(p => {
    p[0] = JAPAN_PREF[JAPAN_PREF_SHORT.indexOf(p[0])];
    for (let i = 1; i < p.length; i++) {
      p[i] = parseInt(p[i].replace(/,/g, ""));
    }
  });
  const header = ["都道府県名","PCR検査陽性者","PCR検査実施人数","入院治療等を要する者 (人)","うち重症","退院又は療養解除となった者の数 (人)","死亡(累積) (人)","確認中(人)"];
  return [header, ... prefs2];
};

// '国内事例における都道府県別の患者報告数（2020年3月13日12時時点）' -> 2020/03/09 09:00
const parseDate = function(s) {
  //const num = s.match(/国内事例における都道府県別の患者報告数（(\d+)年(\d+)月(\d+)日(\d+)時時点）/)
  s = s.substring(s.lastIndexOf('（'))
  let num = s.match(/（(\d+)年(\d+)月(\d+)日(\d+)時時点）/)
  if (num) {
    const y = parseInt(num[1])
    const m = parseInt(num[2])
    const d = parseInt(num[3])
    const h = parseInt(num[4])
    return y + "-" + fix0(m, 2) + "-" + fix0(d, 2) + "T" + fix0(h, 2) + ":00"
  }
  num = s.match(/（(\d+)年(\d+)月(\d+)日掲載分）/)
  if (num) {
    const y = parseInt(num[1])
    const m = parseInt(num[2])
    const d = parseInt(num[3])
    return y + "-" + fix0(m, 2) + "-" + fix0(d, 2)
  }
  return "--"
//  console.log(s, num)
};

const BASEURL = 'https://www.mhlw.go.jp'
const parseLink = (data, title, baseurl) => {
  const dom = HTMLParser.parse(data);
  let res = null
  dom.querySelectorAll("a").forEach(ele => {
    const text = ele.text;
    if (res == null && text && text.indexOf(title) >= 0) {
      res = {};
      console.log(text);
      res.dt = parseDate(text);
      const href = ele.attributes.href;
      res.url = href.startsWith("https://") ? href : BASEURL + href
    }
  });
  return res
};

const parseURLCovid19Latest = async (urlweb) => {
  const html = await (await fetch(urlweb)).text();
  //const title = "新型コロナウイルス感染症の現在の状況と厚生労働省の対応について";
  //const title = "新型コロナウイルス感染症の現在の状況について"; // 2022-09-27から変更 https://www.mhlw.go.jp/stf/newpage_28078.html
  const title = "各都道府県の検査陽性者の状況（空港検疫、チャーター便案件を除く国内事例）"; // 2022-11-09から
  let url = parseLink(html, title);
  return url.url;
}
const parseURLCovid19 = async (urlweb) => {
  const html = await (await fetch(urlweb)).text()
  // console.log(html)
  const title = '各都道府県の検査陽性者の状況'
  const title2 = '国内における都道府県別のPCR検査陽性者数'
  let url = parseLink(html, title)
  if (!url) {
    url = parseLink(html, title2)
  }
  return url.url
}
const pi = (s) => {
  const n = parseInt(s);
  if (isNaN(n)) {
    console.log(n);
    return s;
  }
  return n;
};

const getAreas = () => {
  const area = []
  for (let i = 0; i < JAPAN_PREF.length; i++) {
    area[i] = { name: JAPAN_PREF_EN[i], name_jp: JAPAN_PREF[i] }
  }
  return area
}

const makeCurrentPatientsJSON = (txt, csv, url, urlweb) => {
  const parseDate = (s) => {
    s = toHalf(s)
    s = s.replace(/⽉/g, "月"); // 令和2年7⽉2⽇ へんな漢字
    s = s.replace(/⽇/g, "日");
    {
      const num = s.match(/令和(\d+)年(\d+)月(\d+)日/)
      if (num) {
        const y = parseInt(num[1])
        const m = parseInt(num[2])
        const d = parseInt(num[3])
        return (y + 2018) + '-' + fix0(m, 2) + '-' + fix0(d, 2)
      }
    }
    {
      const num = s.match(/(2\d+)年(\d+)月(\d+)日/)
      if (num) {
        const y = parseInt(num[1])
        const m = parseInt(num[2])
        const d = parseInt(num[3])
        return y + '-' + fix0(m, 2) + '-' + fix0(d, 2)
      }
    }
    {
      const num = s.match(/(20\d+)\/(\d+)\/(\d+)/)
      if (num) {
        const y = parseInt(num[1])
        const m = parseInt(num[2])
        const d = parseInt(num[3])
        return y + '-' + fix0(m, 2) + '-' + fix0(d, 2)
      }
    }
    throw new Error(s + ": can't parse date!!");
    //return '--'
  }

  const res = {}
  res.srcurl_pdf = url
  res.srcurl_web = urlweb
  res.description = '各都道府県の検査陽性者の状況(空港検疫、チャーター便案件を除く国内事例)'
  res.lastUpdate = parseDate(txt)
  if (txt.indexOf("0時時点") >= 0) {
    res.lastUpdate = new Day(res.lastUpdate).dayBefore(1).toString();
    //console.log(txt, res.lastUpdate)
    //Deno.exit(0);
  }
  res.npatients = 0
  res.nexits = 0
  res.ndeaths = 0
  res.ncurrentpatients = 0
  res.ninspections = 0

  const pi = s => parseInt(s) !== s ? 0 : parseInt(s)
  const data = CSV.toJSON(csv);
  console.log(data);
  const area = getAreas()
  for (let i = 0; i < area.length; i++) {
    const a = area[i]
    const c = data[i]
    console.log(c)
    a.npatients = c['PCR検査陽性者']
    a.ncurrentpatients = 0
    a.nexits = c['退院又は療養解除となった者の数 (人)'] || c['退院又は療養解除となった者の数']
    a.ndeaths = c['死亡(累積) (人)'] || c['死亡']
    a.nheavycurrentpatients = c['うち重症']
    a.nunknowns = c['確認中(人)'] || c['確認中'] || 0;
    a.ncurrentpatients = a.npatients - a.nexits - pi(a.ndeaths)
    const nc = c['入院治療等を要する者'] || c["入院治療等を要する者 (人)"];
    if (a.ncurrentpatients !== nc) {
      console.log('unmatch', a)
      a.ncurrentpatients = nc
    }
    a.ninspections = c['PCR検査実施人数']

    res.npatients += a.npatients
    res.nexits += a.nexits
    res.ndeaths += pi(a.ndeaths)
    res.nheavycurrentpatients += pi(a.nheavycurrentpatients)
    res.nunknowns += pi(a.nunknowns)
    res.ncurrentpatients += pi(a.ncurrentpatients)
    res.ninspections += pi(a.ninspections)
    
    a["ISO3155-2"] = "JP-" + fix0(i + 1, 2);
  }
  res.area = area
  return res
};

const main = async function () {
  const now = new Date();
  const urlweb7 = `https://www.mhlw.go.jp/stf/houdou/houdou_list_${now.getFullYear()}${fix0(now.getMonth() + 1, 2)}.html`;
  console.log(urlweb7);
  const urlweb = await parseURLCovid19Latest(urlweb7);
  //const urlweb = "https://www.mhlw.go.jp/stf/newpage_22731.html";
  console.log(urlweb);
  //Deno.exit();
  // savePDF
  const path = '../data/covid19japan/'
  const url = await parseURLCovid19(urlweb)
  console.log(url)
  if (!url) {
    throw new Error("not found url: " + url);
  }
  const fn = url.substring(url.lastIndexOf('/') + 1);
  const pdf = await fetchBin(url);
  await Deno.writeFile(path + fn, pdf);

  console.log("pdf:" + path + fn);
  const tmpfn = "./temp/pdf2json.json";
  await pdf2json(path + fn, tmpfn);
  const json0 = JSON.parse(await Deno.readTextFile(tmpfn));
  console.log(json0);

  const ar = json2array(json0);
  const txt = ar.map(a => a.join("")).join("\n");
  const csv = array2csv(ar);
  console.log(csv);
  //Deno.exit(0);

  const json = makeCurrentPatientsJSON(txt, csv, url, urlweb);
  const scsv = CSV.stringify(json.area);
  // util.addBOM(util.encodeCSV(util.json2csv(json.area)))

  console.log(json);

  console.log(path + json.lastUpdate + '.csv');
  await Deno.writeTextFile(path + json.lastUpdate + '.csv', scsv);
  await Deno.writeTextFile(path + fn + '.json', JSON.stringify(json));
  await Deno.writeTextFile(path + fn + '.csv', CSV.encode(csv));
  
  await Deno.writeTextFile(path + '../covid19japan.csv', scsv);
  await Deno.writeTextFile(path + '../covid19japan.json', JSON.stringify(json));

};

const recover2 = async (urlweb) => {
  console.log(urlweb);
  //Deno.exit();
  // savePDF
  const path = '../data/covid19japan/'
  const url = await parseURLCovid19(urlweb)
  console.log(url)
  Deno.exit(1)
  if (!url) {
    throw new Error("not found url: " + url);
  }
  const fn = url.substring(url.lastIndexOf('/') + 1);
  const pdf = await fetchBin(url);
  await Deno.writeFile(path + fn, pdf);

  console.log("pdf:" + path + fn);
  const tmpfn = "./temp/pdf2json.json";
  await pdf2json(path + fn, tmpfn);
  const json0 = JSON.parse(await Deno.readTextFile(tmpfn));
  console.log(json0);

  const ar = json2array(json0);
  const txt = ar.map(a => a.join("")).join("\n");
  const csv = array2csv(ar);
  console.log(csv);
  //Deno.exit(0);

  const json = makeCurrentPatientsJSON(txt, csv, url, urlweb);
  const scsv = CSV.stringify(json.area);
  // util.addBOM(util.encodeCSV(util.json2csv(json.area)))

  console.log(json);

  console.log(path + json.lastUpdate + '.csv');
  await Deno.writeTextFile(path + json.lastUpdate + '.csv', scsv);
  await Deno.writeTextFile(path + fn + '.json', JSON.stringify(json));
  await Deno.writeTextFile(path + fn + '.csv', CSV.encode(csv));
};
const recover = async () => {
  //const urlweb = "https://www.mhlw.go.jp/stf/newpage_26173.html";
  const urlwebs = [
    /*
    "https://www.mhlw.go.jp/stf/newpage_26175.html",
    "https://www.mhlw.go.jp/stf/newpage_26205.html",
    "https://www.mhlw.go.jp/stf/newpage_26248.html",
    "https://www.mhlw.go.jp/stf/newpage_26277.html",
    "https://www.mhlw.go.jp/stf/newpage_26307.html",
    */
    //"https://www.mhlw.go.jp/stf/newpage_27299.html",
    //"https://www.mhlw.go.jp/stf/newpage_27844.html",
    //"https://www.mhlw.go.jp/stf/newpage_28193.html", // 9.26 25
    "https://www.mhlw.go.jp/stf/newpage_29102.html",
    //"https://www.mhlw.go.jp/stf/newpage_28078.html", // 9.27 26
    //"https://www.mhlw.go.jp/stf/newpage_28240.html", // 9.28 28? -> 24時ではなく0時表記に変わった
    //"https://www.mhlw.go.jp/stf/newpage_28193.html",
    //"https://www.mhlw.go.jp/stf/newpage_28271.html", // 9.29 29
  ];
  for (const urlweb of urlwebs) {
    await recover2(urlweb);
  }
};

recover();

//main();
