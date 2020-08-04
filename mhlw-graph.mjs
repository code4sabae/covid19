import Chart from "https://code4sabae.github.io/kafumon/lib/Chart.mjs";
import util from "https://taisukef.github.io/util/util.mjs";

const main = async (parent) => {
  const url = "https://www.stopcovid19.jp/data/mhlw_go_jp/opendata/covid19.csv";

  const json = await util.fetchCSVtoJSON(url);
  console.log(json);

  const date = [];
  const data1 = [];
  const data2 = [];
  const data_c = [];
  const data_d = [];
  for (const d of json) {
    date.push(d["日付"]);
    data1.push(d["PCR 検査陽性者数"]);
    data2.push(d["PCR 検査実施件数"]);
    data_c.push(d["入院治療を要する者"]);
    data_d.push(d["死亡者数"]);
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
  date.forEach((d, i, ar) =>  ar[i] = parseInt(d.substring(5, 7)) + "/" + parseInt(d.substring(8, 10)));
  const config = {
    data: {
      labels: date,
      datasets: [
        { type: "line", label: "PCR 検査陽性者数", data: data1, borderColor: 'rgb(255, 99, 132)', fill: false, lineTension: 0, yAxisID: "yl" },
        { type: "line", label: "入院治療を要する者", data: data_c, borderColor: 'rgb(80, 80, 205)', fill: false, lineTension: 0, yAxisID: "yr" },
        // { type: "line", label: "死亡者数", data: data_dd, borderColor: 'rgb(10, 10, 12)', fill: false, lineTension: 0, yAxisID: "yl" },
        { type: "line", label: "累計死亡者数", data: data_d, borderColor: 'rgb(10, 10, 12)', fill: false, lineTension: 0, yAxisID: "yl" },
        { type: "bar", label: "PCR 検査実施件数", data: data2, backgroundColor: 'rgb(99, 255, 132)', fill: false, lineTension: 0, yAxisID: "yr" }
      ]
    },
    options: {
      title: { display: true, text: "COVID-19 日本のPCR検査陽性者数・検査施件数、入院者数、死亡者数" },
      scales: {
        xAxes: [{ scaleLabel: { display: false, labelString: "日付" } }],
        yAxes: [
        { id: "yr", position: "right", scaleLabel: { display: true, labelString: "PCR 検査実施件数・現在入院治療を要する者" }, ticks: { beginAtZero: true } },
        { id: "yl", position: "left", scaleLabel: { display: true, labelString: "PCR 検査陽性者数・累計死亡者数" }, ticks: { beginAtZero: true } },
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
    div.innerHTML = "データ出典：<a href=https://www.mhlw.go.jp/stf/covid-19/open-data.html>オープンデータ｜厚生労働省</a>（新型コロナウイルス感染症について）";
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
