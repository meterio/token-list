const fs = require("fs");
const os = require("os");
const path = require('path');
const parse = require('csv-parse/lib/sync');

const HOST_URL = "https://raw.githubusercontent.com/meterio/bridge-tokens/master";
const LOGOS_DIR = 'data/resource-logos';

const ethTitle = {
  "address": "Ethereum Token Address",
  "name": "Ethereum Token Name",
  "symbol": "Ethereum Token Symbol",
  "resourceId": "Resource ID",
  "nativeDecimals": "Ethereum Token Decimals"
}

const meterTitle = {
  "address": "Meter Token Address",
  "name": "Meter Token Name",
  "symbol": "Meter Token Symbol",
  "resourceId": "Resource ID"
}

const bscTitle = {
  "address": "BSC Token Address",
  "name": "BSC Token Name",
  "symbol": "BSC Token Symbol",
  "resourceId": "Resource ID"
}

/**
 * read csv file and transfer it to obj list
 * @param {string} fileName 
 * @returns json object for csv
 */
 const loadCSV = (path)=>{
  const content = fs.readFileSync(path).toString()
  return parse(content, {
    columns: true,
    skip_empty_lines: true
  })
}

function main() {
  const tokenMappings = loadCSV(path.join(__dirname, '..', 'data', 'token_mappings.csv'));

  const ethTokens = generate(tokenMappings, ethTitle);
  const meterTokens = generate(tokenMappings, meterTitle);
  const bscTokens = generate(tokenMappings, bscTitle);

  fs.writeFileSync(path.join(__dirname, '..', "eth.json"), JSON.stringify(ethTokens, null, 2));
  fs.writeFileSync(path.join(__dirname, '..', "meter.json"), JSON.stringify(meterTokens, null, 2));
  fs.writeFileSync(path.join(__dirname, '..', "bsc.json"), JSON.stringify(bscTokens, null, 2));
}

main();


/**
 * generate json by mapping and title
 * @param {obj[]} mappings 
 * @param {obj} title 
 * @returns obj
 */
function generate(mappings, title) {
  let tokens = {data: []}
  mappings.forEach((item) => {
    let o = {
      "address": item[title.address],
      "name": item[title.name],
      "symbol": item[title.symbol],
      "imageUri": HOST_URL + "/" + LOGOS_DIR + "/" + item[title.resourceId] + "/" + "logo.png",
      "native": false,
      "resourceId": "0x" + item[title.resourceId],
    }
    if (!o.address && !o.name && !o.symbol){
      // no name, address and symbol, skip
      return
    }
    if (o.symbol === 'ETH') {
      o.native = true;
      o.nativeDecimals = item[title.nativeDecimals]
    }
    tokens.data.push(o)
  })

  return tokens;
}

/**
 * @deprecated
 * merge the same Resource ID
 * @param {obj[]} eth_mappings 
 * @param {obj[]} bsc_mappings 
 * @returns obj[]
 */
function mergeEthAndBsc(eth_mappings, bsc_mappings) {
  const tObj = {};
  const mappings = eth_mappings.concat(bsc_mappings);

  mappings.forEach((item) => {
    tObj[item['Resource ID']] = item
  })
  
  const tMappings = []
  for (let key in tObj) {
    tMappings.push(tObj[key])
  }

  return tMappings;
}

/**
 * read csv file and transfer it to obj list
 * @deprecated
 * @param {string} fileName 
 * @returns obj[]
 */
function cvsToMap(fileName) {
  let mappings = [];
  const t = os.type();
  const splitFlag = t === "Windows_NT" ? "\r\n" : (t === "Darwin" ? "\r" : "\n");
  const tData = fs.readFileSync(`data/${fileName}`).toString().split(splitFlag);
  const title = tData[0].split(',');
  tData.forEach((item, index) => {
    if (index > 0 && item) {
      let obj = {};
      let values = item.split(',');
      values.forEach((val, ind) => {
        obj[title[ind]] = val;
      })
      mappings.push(obj)
    }
  })

  return mappings;
}

