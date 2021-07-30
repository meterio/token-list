const fs = require("fs");
const os = require("os");
const path = require("path");
const parse = require("csv-parse/lib/sync");

const HOST_URL =
  "https://raw.githubusercontent.com/meterio/bridge-tokens/master";
const LOGOS_DIR = "data/resource-logos";

const ETH_TITLE = {
  address: "Ethereum Token Address",
  name: "Ethereum Token Name",
  symbol: "Ethereum Token Symbol",
  resourceId: "Resource ID",
  nativeDecimals: "Ethereum Token Decimals",
};

const METER_TITLE = {
  address: "Meter Token Address",
  name: "Meter Token Name",
  symbol: "Meter Token Symbol",
  resourceId: "Resource ID",
};

const BSC_TITLE = {
  address: "BSC Token Address",
  name: "BSC Token Name",
  symbol: "BSC Token Symbol",
  resourceId: "Resource ID",
};

/**
 * read csv file and transfer it to obj list
 * @param {string} fileName
 * @returns json object for csv
 */
const loadCSV = (path) => {
  const content = fs.readFileSync(path).toString();
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
  });
};

/**
 * copy logo from resource-logos to destDir
 * @param {array} resourceLogoDirs
 * @param {string} resourceId
 * @param {string} destDir
 */
const copy = (resourceLogoDirs, resourceId, destDir) => {
  if (resourceLogoDirs.includes(resourceId)) {
    const readPath = path.join(
      __dirname,
      "..",
      "data/resource-logos",
      resourceId,
      "logo.png"
    );
    const writePath = path.join(__dirname, "..", destDir);

    // if write directory does not exist then mkdir
    const isDirExists = fs.existsSync(writePath);
    isDirExists || fs.mkdirSync(writePath);

    // if logo.png does not exist then copy
    const isLogoExists = fs.existsSync(writePath + "/logo.png");
    if (!isLogoExists) {
      const logo = fs.readFileSync(readPath);
      fs.writeFileSync(writePath + "/logo.png", logo);
    }
  } else {
    throw new Error(
      "can not find the " + resourceId + " directory in data/resource-logos"
    );
  }
};
/**
 * copy token logo
 * @param {obj[]} tokenMappings
 * @param {[]} resourceLogoDirs
 */
const copyTokenLogo = (tokenMappings, resourceLogoDirs) => {
  tokenMappings.forEach((item) => {
    const resource_id = item["Resource ID"];

    if (item[ETH_TITLE.address] !== "") {
      const eth_dist_dir =
        "tokens/eth/" + item[ETH_TITLE.address].toLowerCase();
      copy(resourceLogoDirs, resource_id, eth_dist_dir);
    }

    if (item[METER_TITLE.address] !== "") {
      const meter_dist_dir =
        "tokens/meter/" + item[METER_TITLE.address].toLowerCase();
      copy(resourceLogoDirs, resource_id, meter_dist_dir);
    }

    if (item[BSC_TITLE.address] !== "") {
      const bsc_dist_dir =
        "tokens/bsc/" + item[BSC_TITLE.address].toLowerCase();
      copy(resourceLogoDirs, resource_id, bsc_dist_dir);
    }
  });
};

function main() {
  const token_mappings = loadCSV(
    path.join(__dirname, "..", "data", "token_mappings.csv")
  );

  const eth = generate(token_mappings, ETH_TITLE);
  const meter = generate(token_mappings, METER_TITLE);
  const bsc = generate(token_mappings, BSC_TITLE);

  // fs.writeFileSync(path.join(__dirname, '..', "all.json"), JSON.stringify(token_mappings, null, 2));

  const tokens = {
    ETH: eth.data,
    MTR: meter.data,
    BNB: bsc.data,
  };

  fs.writeFileSync(
    path.join(__dirname, "..", "tokens.json"),
    JSON.stringify(tokens, null, 2)
  );

  fs.writeFileSync(
    path.join(__dirname, "..", "eth.json"),
    JSON.stringify(eth, null, 2)
  );
  fs.writeFileSync(
    path.join(__dirname, "..", "meter.json"),
    JSON.stringify(meter, null, 2)
  );
  fs.writeFileSync(
    path.join(__dirname, "..", "bsc.json"),
    JSON.stringify(bsc, null, 2)
  );

  // get resourceId directories
  const resource_logo_dirs = fs.readdirSync(
    path.join(__dirname, "..", "data/resource-logos")
  );

  copyTokenLogo(token_mappings, resource_logo_dirs);
}

main();

/**
 * generate json by mapping and title
 * @param {obj[]} mappings
 * @param {obj} title
 * @returns obj
 */
function generate(mappings, title) {
  let tokens = { data: [] };
  mappings.forEach((item) => {
    let o = {
      address: item[title.address],
      name: item[title.name],
      symbol: item[title.symbol],
      imageUri:
        HOST_URL +
        "/" +
        LOGOS_DIR +
        "/" +
        item[title.resourceId] +
        "/" +
        "logo.png",
      native: false,
      resourceId: item[title.resourceId],
    };
    if (!o.address && !o.name && !o.symbol) {
      // no name, address and symbol, skip
      return;
    }
    if (o.symbol === "ETH") {
      o.native = true;
      o.nativeDecimals = item[title.nativeDecimals];
    }
    tokens.data.push(o);
  });

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
    tObj[item["Resource ID"]] = item;
  });

  const tMappings = [];
  for (let key in tObj) {
    tMappings.push(tObj[key]);
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
  const splitFlag = t === "Windows_NT" ? "\r\n" : t === "Darwin" ? "\r" : "\n";
  const tData = fs.readFileSync(`data/${fileName}`).toString().split(splitFlag);
  const title = tData[0].split(",");
  tData.forEach((item, index) => {
    if (index > 0 && item) {
      let obj = {};
      let values = item.split(",");
      values.forEach((val, ind) => {
        obj[title[ind]] = val;
      });
      mappings.push(obj);
    }
  });

  return mappings;
}
