import Chart from "https://code4sabae.github.io/kafumon/lib/Chart.mjs";
import util from "https://taisukef.github.io/util/util.mjs";
import { Day } from "https://code4fukui.github.io/day-es/Day.js";

const main = async (parent) => {
  //const url = "https://www.stopcovid19.jp/data/mhlw_go_jp/opendata/covid19.csv";
  const url = "https://www.stopcovid19.jp/data/mhlw_go_jp/opendata/requiring_inpatient_care_etc_daily.csv";
  const json1 = await util.fetchCSVtoJSON(url);
  console.log(json1);
  const json = json1.map(d => {
    return {
      "日付": new Day(d.Date).toString(),
      "退院者数": d["(ALL) Discharged from hospital or released from treatment"],
      "入院治療を要する者": d["(ALL) Requiring inpatient care"],
      "確認中": d["(ALL) To be confirmed"],
    }
  });
  console.log(json);

  const url2 = "https://code4fukui.github.io/fdma_go_jp/emergencytransport_difficult_all.csv";
  const json2 = await util.fetchCSVtoJSON(url2);
  console.log(json2);

  const date = [];
  const data1 = [];
  const data2 = [];
  const data_c = [];
  const data_d = [];

  const data_em = [];
  const names = ["日付", "PCR 検査陽性者数", "PCR 検査実施件数", "入院治療を要する者", "死亡者数"];
  const datas = [date, data1, data2, data_c, data_d];
  for (const d of json) {
    /*
    if (names.reduce((pre, name) => pre || !d[name], false)) {
      continue;
    }
    */
    for (let i = 0; i < names.length; i++) {
      datas[i].push(d[names[i]]);
    }
    
    data_em.push(json2.find(e => d.日付 == e.終了日)?.救急搬送困難事案数);
    //data_em.push(json2.find(e => new Day(d.日付).includes(new Day(e.開始日), new Day(e.終了日)))?.救急搬送困難事案数);
  }
  /*
  const data_dd = data_d.map((n, i, a) => {
    if (i === 0) {
      return a[0];
    } else {
      return a[i] - a[i - 1];
    }
  });
  data_dd.forEach((d, i) => data_dd[i] *= 10);
  */
  //date.forEach((d, i, ar) =>  ar[i] = parseInt(d.substring(5, 7)) + "/" + parseInt(d.substring(8, 10)));
  const config = {
    data: {
      labels: date,
      datasets: [
        { type: "line", label: "入院治療を要する者", data: data_c, borderColor: 'rgb(80, 80, 205)', fill: false, lineTension: 0, yAxisID: "yr" },
        { type: "line", label: "PCR 検査陽性者数", hidden: false, data: data1, borderColor: 'rgb(255, 99, 132)', fill: false, lineTension: 0, yAxisID: "yl" },
        // { type: "line", label: "死亡者数", data: data_dd, borderColor: 'rgb(10, 10, 12)', fill: false, lineTension: 0, yAxisID: "yl" },
        { type: "line", label: "累計死亡者数", hidden: false, data: data_d, borderColor: 'rgb(10, 10, 12)', fill: false, lineTension: 0, yAxisID: "yl" },
        { type: "bar", label: "PCR 検査実施件数", hidden: true, data: data2, backgroundColor: 'rgb(99, 255, 132)', fill: false, lineTension: 0, yAxisID: "yr" },
        //{ type: "bar", label: "救急搬送困難事案数", hidden: false, data: data_em, backgroundColor: 'rgb(255, 0, 0)', borderWidth: 10, borderColor: "#777", fill: false, lineTension: 0, yAxisID: "yl" },
        { type: "line", label: "救急搬送困難事案数", hidden: false, data: data_em, backgroundColor: 'rgb(255, 0, 0)', borderWidth: 1, borderColor: "#777", fill: false, lineTension: 0, yAxisID: "yl" },
      ]
    },
    options: {
      title: { display: true, text: "COVID-19 日本の新型コロナウイルス概況" },
      scales: {
        xAxes: [{ scaleLabel: { display: false, labelString: "日付" } }],
        yAxes: [
        { id: "yr", position: "right", scaleLabel: { display: true, labelString: "PCR 検査実施件数・現在入院治療を要する者" }, ticks: { beginAtZero: true } },
        { id: "yl", position: "left", scaleLabel: { display: true, labelString: "PCR 検査陽性者数・累計死亡者数・救急搬送困難事案数" }, ticks: { beginAtZero: true } },
        ],
      },
      legend: { display: true }
    }
  };

  parent.style.display = "block";
  parent.style.marginBottom = ".5em";

  const chart = document.createElement("canvas");
  chart.width = 600;
  chart.height = 350;
  new Chart.Chart(chart, config);
  parent.appendChild(chart);

  const atts = {};
  for (const a of parent.attributes) {
    atts[a.nodeName] = a.value;
  }
  if (atts["view-src"] && atts["view-src"]) {
    const div = document.createElement("div");
    div.style.textAlign = "center";
    div.style.fontSize = "80%";
    div.innerHTML = `データ出典：<a href=https://www.mhlw.go.jp/stf/covid-19/open-data.html>オープンデータ｜厚生労働省</a>→<a href=${url}>CSV</a>、
    <a href=https://www.fdma.go.jp/disaster/coronavirus/post-1.html>新型コロナウイルス感染症に伴う救急搬送困難事案に係る状況調査について<!--（救急企画室） | 新型コロナウイルス感染症関連--> | 総務省消防庁</a>
     (<a href=https://code4fukui.github.io/fdma_go_jp/pref.html>都道府県別 救急搬送困難事案数</a>)`;
    parent.appendChild(div);
  }
};

class MHLWGraph extends HTMLElement {
  constructor () {
    super();
    main(this);
  }
}

customElements.define('mhlw-graph', MHLWGraph);
