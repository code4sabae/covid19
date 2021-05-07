//import { SJIS } from "https://code4sabae.github.io/js/SJIS.js";

const CSV = {};

CSV.parse = (s) => CSV.toJSON(CSV.decode(s));
CSV.stringify = (json) => CSV.encode(CSV.fromJSON(json));

CSV.addBOM = function (s) {
  return "\ufeff" + s;
};
CSV.removeBOM = function (s) {
  if (s.charAt(0) === "\ufeff") {
    return s.substring(1);
  }
  return s;
};
CSV.decode = function (s) {
  s = CSV.removeBOM(s);
  const res = [];
  let st = 0;
  let line = [];
  let sb = null;
  if (!s.endsWith("\n")) s += "\n";
  const len = s.length;
  for (let i = 0; i < len; i++) {
    const c = s.charAt(i);
    if (c === "\r") continue;
    if (st === 0) {
      if (c === "\n") {
        if (line.length > 0) line.push("");
        res.push(line);
        line = [];
      } else if (c == ",") {
        line.push("");
      } else if (c == '"') {
        sb = "";
        st = 2;
      } else {
        sb = c;
        st = 1;
      }
    } else if (st === 1) {
      if (c === "\n") {
        line.push(sb);
        res.push(line);
        line = [];
        st = 0;
        sb = null;
      } else if (c === ",") {
        line.push(sb);
        sb = null;
        st = 0;
      } else {
        sb += c;
      }
    } else if (st === 2) {
      if (c === '"') {
        st = 3;
      } else {
        sb += c;
      }
    } else if (st === 3) {
      if (c === '"') {
        sb += c;
        st = 2;
      } else if (c === ",") {
        line.push(sb);
        sb = null;
        st = 0;
      } else if (c === "\n") {
        line.push(sb);
        res.push(line);
        line = [];
        st = 0;
        sb = null;
      }
    }
  }
  if (sb != null) line.push(sb);
  if (line.length > 0) res.push(line);
  return res;
};
CSV.encode = function (csvar) {
  let s = [];
  for (let i = 0; i < csvar.length; i++) {
    let s2 = [];
    const line = csvar[i];
    for (let j = 0; j < line.length; j++) {
      const v = line[j];
      if (v == undefined || v.length == 0) {
        s2.push("");
      } else if (typeof v == "number") {
        s2.push(v);
      } else if (typeof v != "string") {
        s2.push('"' + v + '"');
      } else if (v.indexOf('"') >= 0) {
        s2.push('"' + v.replace(/\"/g, '""') + '"');
      } else if (v.indexOf(",") >= 0 || v.indexOf("\n") >= 0) {
        s2.push('"' + v + '"');
      } else {
        s2.push(v);
      }
    }
    s.push(s2.join(","));
  }
  return CSV.addBOM(s.join("\n"));
};
CSV.toJSON = function (csv, removeblacket) {
  const res = [];
  const head = csv[0];
  if (removeblacket) {
    for (let i = 0; i < head.length; i++) {
      const h = head[i];
      const n = h.indexOf("(");
      const m = h.indexOf("（");
      let l = -1;
      if (n === -1) {
        l = m;
      } else if (m === -1) {
        l = n;
      } else {
        l = Math.min(n, m);
      }
      head[i] = (l > 0 ? h.substring(0, l) : h).trim();
    }
  }
  for (let i = 1; i < csv.length; i++) {
    const d = {};
    for (let j = 0; j < head.length; j++) {
      d[head[j]] = csv[i][j];
    }
    res.push(d);
  }
  return res;
};
CSV.fromJSON = function (json) {
  if (!Array.isArray(json)) {
    throw "is not array!";
  }
  const head = [];
  for (const d of json) {
    for (const name in d) {
      if (head.indexOf(name) == -1) {
        head.push(name);
      }
    }
  }
  const res = [head];
  for (const d of json) {
    const line = [];
    for (let i = 0; i < head.length; i++) {
      const v = d[head[i]];
      if (v == undefined) {
        line.push("");
      } else {
        line.push(v);
      }
    }
    res.push(line);
  }
  return res;
};
CSV.fetchOrLoad = async (fn) => {
  if (fn.startsWith("https://") || fn.startsWith("http://") || !globalThis.Deno) {
    return new Uint8Array(await (await fetch(fn)).arrayBuffer());
  } else {
    return await Deno.readFile(fn);
  }
}
CSV.fetchUtf8 = async (url) => {
  const data = await (await fetch(url)).text();
  const csv = CSV.decode(data);
  return csv;
};
CSV.fetch = async (url) => {
  const data = SJIS.decodeAuto(await CSV.fetchOrLoad(url));
  const csv = CSV.decode(data);
  return csv;
};
CSV.makeTable = (csv) => {
  const c = (tag) => document.createElement(tag);
  const tbl = c("table");
  const tr0 = c("tr");
  tbl.appendChild(tr0);
  for (let i = 0; i < csv[0].length; i++) {
    const th = c("th");
    tr0.appendChild(th);
    th.textContent = csv[0][i];
  }
  for (let i = 1; i < csv.length; i++) {
    const tr = c("tr");
    tbl.appendChild(tr);
    for (let j = 0; j < csv[i].length; j++) {
      const td = c("td");
      tr.appendChild(td);
      const s = csv[i][j];
      if (s.startsWith("http://") || s.startsWith("https://")) {
        const a = c("a");
        a.href = a.textContent = s;
        td.appendChild(a);
      } else {
        td.textContent = s;
      }
    }
  }
  return tbl;
};

export { CSV };
