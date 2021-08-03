import Chart from "https://code4sabae.github.io/kafumon/lib/Chart.mjs";
import { CSV } from "https://js.sabae.cc/CSV.js";

const main = async (parent) => {
  //const url = "https://www.stopcovid19.jp/data/mhlw_go_jp/opendata/covid19.csv";
  const label = "日付";
  const title = "厚生労働省オープンデータ - 新型コロナウイルス感染症について";

  const url = "./data/mhlw_go_jp/opendata/covid19_all.csv";
  const csv = await CSV.fetch(url);
  console.log(csv);

  const datas = {};
  for (let i = 0; i < csv[0].length; i++) {
    const data = [];
    datas[csv[0][i]] = data;
    for (let j = 1; j < csv.length; j++) {
      data.push(csv[j][i]);
    }
  }
  
  const datasets = [];
  for (const name in datas) {
    if (name == label) {
      continue;
    }
    const borderColor = `hsl(${datasets.length * 15}, 80%, 80%)`;
    console.log(borderColor);
    datasets.push({ type: "line", fill: false, label: name, data: datas[name], borderColor, lineTension: 0, yAxisID: "yr" });
  }
  console.log(datasets);
  const config = {
    data: {
      labels: datas[label],
      datasets,
    },
    options: {
      title: { display: true, text: title },
      scales: {
        xAxes: [{ scaleLabel: { display: false, labelString: label } }],
        yAxes: [
        { id: "yr", position: "right", scaleLabel: { display: true, labelString: "数" }, ticks: { beginAtZero: true } },
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
    div.innerHTML = `データ出典：<a href=https://www.mhlw.go.jp/stf/covid-19/open-data.html>オープンデータ｜厚生労働省</a>→<a href=${url}>CSV</a>`;
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
