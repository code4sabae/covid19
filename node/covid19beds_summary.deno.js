// https://www.mhlw.go.jp/stf/seisakunitsuite/newpage_00023.html

import { CSV } from "https://code4sabae.github.io/js/CSV.js";
import { fix0 } from "https://code4sabae.github.io/js/fix0.js";

const path = "../data/covid19japan_beds/";

const list = [];
for await (const f of Deno.readDir(path)) {
  if (f.isDirectory || !f.name.endsWith(".csv") || f.name.length != 14) {
    continue;
  }
  list.push(f.name);
}
list.sort();

list.unshift("name");
await Deno.writeTextFile(path + "index.csv", CSV.encode(list.map(l => [l])));

const all = [];
for (let j = 1; j < list.length; j++) {
  const json = CSV.toJSON(CSV.decode(await Deno.readTextFile(path + list[j])));
  json.forEach(j => all.push(j));
}
await Deno.writeTextFile(path + "all.csv", CSV.encode(CSV.fromJSON(all)));
