import { CSV } from "https://code4sabae.github.io/js/CSV.js";
import { isFileExists } from "./isFileExists.js";

const url = "https://storage.googleapis.com/covid-external/forecast_JAPAN_PREFECTURE_28.csv";
const path = "../data/covid19forecast/google/";

const csv = await CSV.fetch(url);
const json = CSV.toJSON(csv);
const date = json[0].forecast_date;
console.log(date);

const fn = path + date + ".csv";
const fn2 = path + "latest.csv";
if (!isFileExists(fn)) {
  await Deno.writeTextFile(fn, CSV.encode(csv));
  await Deno.writeTextFile(fn2, CSV.encode(csv));
  console.log("downloaded " + fn);
} else {
  console.log("already exists");
}

const files = Deno.readDir(path);
const csvs = [];
for await (const f of files) {
  if (!f.name.endsWith(".csv") || f.name === "latest.csv" || f.name === "list.csv") {
    continue;
  }
  csvs.push([f.name.substring(0, 10)]);
}
csvs.sort();
console.log(csvs);
csvs.unshift(["flie"]);
await Deno.writeTextFile(path + "list.csv", CSV.encode(csvs));
