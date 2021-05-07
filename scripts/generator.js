const fs = require("fs");
const os = require("os");

const HOST_URL = "https://raw.githubusercontent.com/meterio/bridge-tokens/master";
const LOGOS_DIR = 'logo-tokens';

const ethTitle = {
  "address": "Ethereum Token Address",
  "name": "Ethereum Token Name",
  "symbol": "Ethereum Token Symbol",
  "resourceId": "Resource ID"
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

function main() {
  const eth_mappings = cvsToMap('eth_mappings.csv');
  const bsc_mappings = cvsToMap('bsc_mappings.csv');

  const meter_mappings = mergeEthAndBsc(eth_mappings, bsc_mappings);

  const ethTokens = generate(eth_mappings, ethTitle);
  const meterTokens = generate(meter_mappings, meterTitle);
  const bscTokens = generate(bsc_mappings, bscTitle);
  
  fs.writeFileSync("eth.json", JSON.stringify(ethTokens));
  fs.writeFileSync("meter.json", JSON.stringify(meterTokens));
  fs.writeFileSync("bsc.json", JSON.stringify(bscTokens));
}

main();

/**
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
 * generate json by mapping and title
 * @param {obj[]} mappings 
 * @param {obj} title 
 * @returns obj
 */
function generate(mappings, title) {
  let tokens = {data: []}
  mappings.forEach((item) => {
    tokens.data.push({
      "address": item[title.address],
      "name": item[title.name],
      "symbol": item[title.symbol],
      "imageUri": HOST_URL + "/" + LOGOS_DIR + "/" + item['Meter Token Address'] + "/" + "logo.png",
      "native": false,
      "resourceId": "0x" + item[title.resourceId],
    })
  })

  return tokens;
}
/**
 * read csv file and transfer it to obj list
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