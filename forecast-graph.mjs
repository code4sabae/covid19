import Chart from "https://code4sabae.github.io/kafumon/lib/Chart.mjs";
import util from "https://taisukef.github.io/util/util.mjs";
import { CSV } from "https://code4sabae.github.io/js/CSV.js";
import { fix0 } from "https://code4sabae.github.io/js/fix0.js";

const main = async (parent) => {
  const atts = getAttributes(parent);

  const fn = atts.date || "latest";
  const url = "https://www.stopcovid19.jp/data/covid19forecast/google/" + fn + ".csv";
  // const url = "data/covid19forecast/google/latest.csv";

  const json = await util.fetchCSVtoJSON(url);
  console.log(json);

  for (let i = 1; i <= 47; i++) {
    const prefcode = "JP-" + (i < 10 ? "0" : "") + i;
    makeGraph(json, prefcode, parent);
  }

};
const getAttributes = (parent) => {
  const atts = {};
  for (const a of parent.attributes) {
    atts[a.nodeName] = a.value;
  }
  return atts;
};
const makeGraph = async (json, prefcode, parent) => {
  const atts = getAttributes(parent);

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

  if (atts["view-pref"]) {
    if (atts["view-pref"].toUpperCase() !== nameen.toUpperCase()) {
      return;
    }
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
        { type: "line", label: "PCR 検査陽性者数（予測）", data: data1, borderColor: 'rgb(255, 99, 132)', fill: false, lineTension: 0, yAxisID: "yl" },
        { type: "line", label: "入院治療を要する者（予測）", data: data_c, borderColor: 'rgb(80, 80, 205)', fill: false, lineTension: 0, yAxisID: "yr" },
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
  if (atts.date) {
    const actual = await getActualData(atts["view-pref"], date.map(stdDate));
    console.log(actual);
    config.data.datasets.push({type: "bar", label: "入院を要する者（結果）", backgroundColor: 'rgb(80, 80, 205, .2)', data: actual, yAxisID: "yr" });
  }

  const title = "COVID-19 " + name + "のPCR検査陽性者数と入院者数 " + (atts.date ? atts.date + "時点 予測値と結果" : "予測値");
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

  if (atts["view-src"]) {
    const div = document.createElement("div");
    div.className = "src";
    div.style.textAlign = "center";
    div.innerHTML = "データ出典: <a href='https://datastudio.google.com/reporting/8224d512-a76e-4d38-91c1-935ba119eb8f/page/4KwoB'>Japan: COVID-19 Public Forecasts › 日本語 - Japan COVID-19 Forecast Dashboard by Google</a>";
    if (atts.date) {
      div.innerHTML += "<br>データ出典: <a href='https://www.mhlw.go.jp/stf/covid-19/open-data.html'>新型コロナウイルス感染症 入院治療等を要する者の数別 - 厚労省オープンデータ</a>";
    }
    parent.appendChild(div);
  }
};
const stdDate = (dt) => {
  const n = dt.match(/(\d+)\/(\d+)/);
  if (!n) {
    return null;
  }
  const d = new Date();
  const month = n[1];
  const day = n[2];
  const year = d.getFullYear() + (month < 8 ? 1 : 0);
  return year + "-" + fix0(month, 2) + "-" + fix0(day, 2);
};
const getActualData = async (pref, date) => {
	const fn = `data/covid19japan/pref/${pref}.csv`;
	const json = CSV.toJSON(await CSV.fetch(fn));
	console.log(fn, json);

  const data1 = [];
  const data2 = [];
  const data_c = [];
	const data_d = [];
	let bkis = null;
  for (const dt of date) {
    const d = json.find((d) => d.date == dt);
    if (!d) {
      continue;
    }
    console.log(dt, d);
		data_c.push(d.ncurrentpatients);
		data_d.push(d.ndeaths);
		if (d.ninspections === undefined) {
			data2.push(0);
		} else {
			const n = parseInt(d.ninspections);
			if (bkis === null) {
				data2.push(n);
			} else {
				data2.push(n - bkis);
			}
			bkis = n;
		}
  }
  return data_c;
};

class ForecastGraph extends HTMLElement {
  constructor () {
    super();
    main(this);
  }
};

customElements.define('forecast-graph', ForecastGraph);
