import { CSV } from "https://code4sabae.github.io/js/CSV.js";
import { isFileExists } from "./isFileExists.js";

const url = "https://storage.googleapis.com/covid-external/forecast_JAPAN_PREFECTURE_28.csv";
const csv = await CSV.fetch(url);
const json = CSV.toJSON(csv);
const date = json[0].forecast_date;
console.log(date);

const path = "../data/covid19forecast/google/";
const fn = path + date + ".csv";
const fn2 = path + "latest.csv";
if (!isFileExists(fn)) {
  await Deno.writeTextFile(fn, CSV.encode(csv));
  await Deno.writeTextFile(fn2, CSV.encode(csv));
  console.log("downloaded " + fn);
} else {
  console.log("already exists");
}
