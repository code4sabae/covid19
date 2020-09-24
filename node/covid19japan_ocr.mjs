import fs from "fs";
import fetch from "node-fetch";
import util from "./util.mjs";
import jimp from "jimp";
import pdf2png from "./pdf2png.mjs";

const img2num = async (img) => {
  let res = 0;
  let beam = 0;
  await cropImages(img, async (img) => {
    const n = await croppedimg2num(img);
    if (n >= 0) {
      res = res * 10 + n;
      beam++;
    }
  });
  if (!beam) {
    return "-";
  }
  return res;
};
let numimg = null;
const croppedimg2num = async (img) => {
  if (img.bitmap.width < 10 && img.bitmap.height < 10) { // maybe comma
    return -1;
  }
  if (numimg == null) {
    numimg = [];
    //const imgfn = 'numimg'
    //const size = 16
    const imgfn = 'numimg2';
    const size = 18;
    for (let i = 0; i < 10; i++) {
      numimg[i] = await jimp.read(imgfn + '/n' + i + '.png');
      numimg[i].resize(size, size);
    }
  }
  const pixel2num = (n) => {
    const r = (n >> 24) & 0xff;
    const g = (n >> 16) & 0xff;
    const b = (n >> 8) & 0xff;
    return (r + g + b) / (256 * 3);
  }
  const chk = (img1, img2) => {
    let n = 0
    for (let i = 0; i < img1.bitmap.width && i < img2.bitmap.width; i++) {
      for (let j = 0; j < img1.bitmap.height && j < img2.bitmap.height; j++) {
        const n1 = pixel2num(img1.getPixelColor(i, j))
        const n2 = pixel2num(img2.getPixelColor(i, j))
        let dn = Math.abs(n1 - n2)
        //if (i > img1.bitmap.width / 4 && i < img1.bitmap.width * 3 / 4)
        //  dn /= 2
        n += dn
      }
    }
    return n
  }
  let min = 1 << 30
  let nmin = 0
  img.resize(numimg[0].bitmap.width, numimg[0].bitmap.height)
  for (let i = 0; i < numimg.length; i++) {
    const n = chk(img, numimg[i])
    //console.log(i, n)
    if (n < min) {
      min = n
      nmin = i
    }
  }
  return nmin
};

let nmakenumimage = 0
const makeNumImage = async (img) => {
  if (MAKE_POS_IMAGE) {
    img.write('temp/num' + nmakenumimage++ + '.png')
    return;
  }
  await cropImages(img, async (img) => {
    img.write('temp/num' + nmakenumimage++ + '.png')
    console.log(nmakenumimage)
  })
}

const cropImages = async (img, asynccallback) => {
  const n = img.getPixelColor(0, 0)
  const WHITE = 0xffffffff // RGBA (A=0xff 不透明)
  //console.log(n.toString(16)) // 0xffffffff // RGBA (A=0xff 不透明)
  let x = 0
  for (;;) {
    let x1 = -1
    A: for (; x < img.bitmap.width; x++) {
      //for (let i = miny; i <= maxy; i++) {
      for (let i = 0; i <= img.bitmap.height; i++) {
        let n = img.getPixelColor(x, i)
        if (n != WHITE) {
          x1 = x
          break A
        }
      }
    }
    if (x1 < 0) {
      break
    }
    let x2 = img.bitmap.width - 1
    for (x++; x < img.bitmap.width; x++) {
      let flg = 0
      //for (let i = miny; i <= maxy; i++) {
        for (let i = 0; i <= img.bitmap.height; i++) {
          let n = img.getPixelColor(x, i)
        flg += n != WHITE ? 1 : 0
      }
      if (!flg) {
        x2 = x
        break
      }
    }
    // y
    let miny = 0;
    A: for (let i = 0; i < img.bitmap.height; i++) {
      for (let j = x1; j <= x2; j++) {
        let n = img.getPixelColor(j, i)
        if (n != WHITE) {
          miny = i
          break A
        }
      }
    }
    let maxy = 0
    B: for (let i = img.bitmap.height - 1; i >= miny; i--) {
      for (let j = x1; j <= x2; j++) {
        let n = img.getPixelColor(j, i)
        if (n != WHITE) {
          maxy = i
          break B
        }
      }
    }
      
    const imgc = img.clone()
    imgc.crop(x1, miny, (x2 - x1) + 1, (maxy - miny) + 1)
    await asynccallback(imgc)
  }
// return cnt
}

const collect = [
  { name_ja: 0, npatients: 1809 },
  { name_ja: 1, npatients: 35 },
  { name_ja: 2, npatients: 22 },
  { name_ja: 3, npatients: 226 },
  { name_ja: 4, npatients: 50 },
  { name_ja: 5, npatients: 78 },
  { name_ja: 6, npatients: 173 },
  { name_ja: 7, npatients: 567 },
  { name_ja: 8, npatients: 309 },
  { name_ja: 9, npatients: 471 },
  { name_ja: 10, npatients: 4079 },
  { name_ja: 11, npatients: 3160 },
  { name_ja: 12, npatients: 21475 },
  { name_ja: 13, npatients: 5285 },
  { name_ja: 14, npatients: 145 },
  { name_ja: 15, npatients: 401 },
  { name_ja: 16, npatients: 681 },
  { name_ja: 17, npatients: 241 },
  { name_ja: 18, npatients: 174 },
  { name_ja: 19, npatients: 284 },
  { name_ja: 20, npatients: 564 },
  { name_ja: 21, npatients: 487 },
  { name_ja: 22, npatients: 4604 },
  { name_ja: 23, npatients: 388 },
  { name_ja: 24, npatients: 459 },
  { name_ja: 25, npatients: 1512 },
  { name_ja: 26, npatients: 8900 },
  { name_ja: 27, npatients: 2322 },
  { name_ja: 28, npatients: 531 },
  { name_ja: 29, npatients: 231 },
  { name_ja: 30, npatients: 22 },
  { name_ja: 31, npatients: 137 },
  { name_ja: 32, npatients: 146 },
  { name_ja: 33, npatients: 459 },
  { name_ja: 34, npatients: 178 },
  { name_ja: 35, npatients: 145 },
  { name_ja: 36, npatients: 82 },
  { name_ja: 37, npatients: 114 },
  { name_ja: 38, npatients: 130 },
  { name_ja: 39, npatients: 4755 },
  { name_ja: 40, npatients: 239 },
  { name_ja: 41, npatients: 234 },
  { name_ja: 42, npatients: 537 },
  { name_ja: 43, npatients: 153 },
  { name_ja: 44, npatients: 338 },
  { name_ja: 45, npatients: 370 },
  { name_ja: 46, npatients: 2200 }
];

const DEBUG = true;
const MAKE_POS_IMAGE = false;
const MAKE_NUM_IMAGE = false;
const getNums = async (fn) => { // 枠線自動認識させたい -> 罫線認識ないと使えない・・・
  const png = await jimp.read(fn)
  png.contrast(.3);
  png.posterize(.05);

  /*
  png.contrast(.2);
  png.posterize(.8);
  const offxs = [409, 532, 662, 805, 929, 1096, 1287];
  const offy = 418; 
  const boxws = [114, 122, 134, 114, 158,  152,  116];
  const steph = 31.61;
  */
  const offxs = [409, 532, 660, 802, 926, 1093, 1284];
  const offy = 423; 
  const boxws = [114, 122, 134, 114, 158,  152,  116];
  const steph = 31.67;

  const res = []
  let idx = 0;
  for (let i = 0; i < 49; i++) {
    const line = [];
    for (let j = 0; j < offxs.length; j++) {
      const offx = offxs[j];
      const boxw = boxws[j];
      const x = offx; // + boxw * (i % 11)
      const y = offy + steph * i;
      const w = boxw;
      const h = steph - 8;
      const imgc = png.clone()
      imgc.crop(x, y, w, h)
      //const text = await img2text.img2text(imgc, DEBUG)
      if (MAKE_NUM_IMAGE || MAKE_POS_IMAGE) {
        await makeNumImage(imgc)
      } else {
        const num = await img2num(imgc)
        if (DEBUG) {
          imgc.write('_num/' + idx++ + '.png');
          /*
          if (collect[i].npatients !== num) {
            console.log("error! ", collect[i].npatients, num);
          }
          */
        }
        line.push(num);
      }
    }
    res.push(line);
  }
  return res;
};
const checkSum = (data) => {
  for (let i = 0; i < data[0].length; i++) {
    let sum = 0;
    for (let j = 0; j < data.length - 1; j++) {
      const c = data[j][i];
      sum += c === "-" ? 0 : parseInt(c);
    }
    const chk = parseInt(data[data.length - 1][i]);
    if (sum !== chk) {
      console.log("not match sum:", sum, "must be", chk);
      throw new Error();
    }
    console.log("ok!", sum, chk);
  }
};
const ocrNums = async (fnpdf) => {
  /*
  await pdf2png.pdf2png(fnpdf);
  const path = fnpdf.substring(0, fnpdf.lastIndexOf("/") + 1);
  const png1 = path + "0001.png";
  const png2 = fnpdf.substring(fnpdf.lastIndexOf("/") + 1, fnpdf.length - 3) + "png";
  fs.renameSync(png1, path + png2);
  console.log(png1);
  console.log(png2);
  const res = await getNums(path + png2);
  */
  // 変換エラーがある時は、手動で直した temp/test.csv を使う
  const res = util.decodeCSV(util.removeBOM(fs.readFileSync("temp/test.csv", "utf-8")));
  
  console.log(res);
  checkSum(res);
  return res;
};
const main = async () => {
  // const fn = "../data/covid19japan/000668310.png";
  const fn = "../data/covid19japan/000675159.png";
  const res = await getNums(fn);
  console.log(res);
  fs.writeFileSync("temp/test.csv", util.addBOM(util.encodeCSV(res)));
  checkSum(res);
}
//if (require.main === module) {
// main()
//}

export { ocrNums };
