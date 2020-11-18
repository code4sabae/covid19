import Chart from "https://code4sabae.github.io/kafumon/lib/Chart.mjs";
import util from "https://taisukef.github.io/util/util.mjs";

const main = async (parent) => {
  //const url = "https://www.stopcovid19.jp/data/mhlw_go_jp/opendata/covid19.csv";
  const url = "data/covid19forecast/google/latest.csv";

  const json = await util.fetchCSVtoJSON(url);
  console.log(json);

  for (let i = 1; i <= 47; i++) {
    const prefcode = "JP-" + (i < 10 ? "0" : "") + i;
    makeGraph(json, prefcode, parent);
  }

};
const makeGraph = async (json, prefcode, parent) => {
  const date = [];
  const data1 = [];
  const data_c = [];
  const data_d = [];
  let name = null;
  let nameen = null;
  for (const d of json) {
    if (d.japan_prefecture_code !== prefcode) {
      continue;
    }
    if (d.new_confirmed == "") {
      continue;
    }
    date.push(d.target_prediction_date);
    data1.push(d.new_confirmed); // PCR 検査陽性者数
    data_c.push(d.hospitalized_patients); // ["入院治療を要する者"]);
    data_d.push(d.new_deaths); // ["死亡者数"]); 累計ではない
    name = d.prefecture_name_kanji;
    nameen = d.prefecture_name;
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
        { type: "line", label: "入院治療を要する者", data: data_c, borderColor: 'rgb(80, 80, 205)', fill: false, lineTension: 0, yAxisID: "yr" },
        { type: "line", label: "PCR 検査陽性者数", data: data1, borderColor: 'rgb(255, 99, 132)', fill: false, lineTension: 0, yAxisID: "yl" },
        // { type: "line", label: "死亡者数", data: data_dd, borderColor: 'rgb(10, 10, 12)', fill: false, lineTension: 0, yAxisID: "yl" },
        //{ type: "line", label: "死亡者数", data: data_d, borderColor: 'rgb(10, 10, 12)', fill: false, lineTension: 0, yAxisID: "yr" },
        // { type: "bar", label: "PCR 検査実施件数", hidden: true, data: data2, backgroundColor: 'rgb(99, 255, 132)', fill: false, lineTension: 0, yAxisID: "yr" }
      ]
    },
    options: {
      // title: { display: true, text: "COVID-19 " + name + "のPCR検査陽性者数、入院者数、死亡者数 予測値" },
      scales: {
        xAxes: [{ scaleLabel: { display: false, labelString: "日付" } }],
        yAxes: [
        { id: "yr", position: "right", scaleLabel: { display: true, labelString: "現在入院治療を要する者" }, ticks: { beginAtZero: true } },
        { id: "yl", position: "left", scaleLabel: { display: true, labelString: "PCR 検査陽性者数" }, ticks: { beginAtZero: true } },
        ],
      },
      legend: { display: true }
    }
  };

  const title = "COVID-19 " + name + "のPCR検査陽性者数、入院者数 予測値";
  const h2 = document.createElement("h2");
  h2.textContent = title;
  h2.style.textAlign = "center";
  const a = document.createElement("a");
  a.name = nameen;
  a.appendChild(h2);
  parent.appendChild(a);

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
    div.innerHTML = "データ出典：<a href='https://datastudio.google.com/reporting/8224d512-a76e-4d38-91c1-935ba119eb8f/page/4KwoB'>Japan: COVID-19 Public Forecasts › 日本語 - Japan COVID-19 Forecast Dashboard</a>";
    parent.appendChild(div);
  }
};

class ForecastGraph extends HTMLElement {
  constructor () {
    super();
    main(this);
  }
};

customElements.define('forecast-graph', ForecastGraph);
