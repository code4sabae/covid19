import fs from "fs";
import PDFParser from "pdf2json";

console.log(process.argv);
const pdffn = process.argv[2];
const jsonfn = process.argv[3];

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
  fs.writeFileSync(jsonfn, JSON.stringify(pdfData));
});

pdfParser.loadPDF(pdffn);
