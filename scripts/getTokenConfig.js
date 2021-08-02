const fs = require("fs");
const path = require("path");

const HOST_URL =
  "https://raw.githubusercontent.com/meterio/bridge-tokens/master";
const LOGOS_DIR = "data/resource-logos";

const TITLE = {
  resourceId: "Resource ID",
  address: "Token Address",
  name: "Token Name",
  symbol: "Token Symbol",
};

/**
 * copy logo from resource-logos to destDir
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

    if (!isDirExists) {
      console.log("path: ", writePath, " doesnt exists, will make this dir.");
    } else {
      console.log("path: ", writePath, " exists, skip make.");
    }

    // if logo.png does not exist then copy
    const logoPath = path.join(writePath, "logo.png");
    const isLogoExists = fs.existsSync(logoPath);
    if (!isLogoExists) {
      console.log("logo: ", logoPath, " doesnt exists, will write logo in.");
      const logo = fs.readFileSync(readPath);
      fs.writeFileSync(logoPath, logo);
    } else {
      console.log("logo: ", logoPath, " exists, skip write logo.");
    }
  } else {
    throw new Error(
      "can not find the " + resourceId + " directory in data/resource-logos"
    );
  }
};
/**
 * copy token logo
 */
const copyTokenLogo = (tokenMappings, resourceLogoDirs) => {
  tokenMappings.forEach((item) => {
    const e = item.Ethereum;
    const m = item.Meter;
    const b = item.BSC;
    const resourceId = item[TITLE.resourceId];

    if (e) {
      const eth_dist_dir = "tokens/eth/" + e[TITLE.address].toLowerCase();
      copy(resourceLogoDirs, resourceId, eth_dist_dir);
    }

    if (m) {
      const meter_dist_dir = "tokens/meter/" + m[TITLE.address].toLowerCase();
      copy(resourceLogoDirs, resourceId, meter_dist_dir);
    }

    if (b) {
      const bsc_dist_dir = "tokens/bsc/" + b[TITLE.address].toLowerCase();
      copy(resourceLogoDirs, resourceId, bsc_dist_dir);
    }
  });
};

const loadTokenMappings = () => {
  const pre = path.join(__dirname, "..", "data/token_mappings");

  const tokenList = fs.readdirSync(pre);

  const mappings = [];
  for (const token of tokenList) {
    const tokenPath = path.join(pre, `${token}`);
    const data = JSON.parse(fs.readFileSync(tokenPath));
    mappings.push(data);
  }

  return mappings;
};

const getImageUri = (resourceId) => {
  return `${HOST_URL}/${LOGOS_DIR}/${resourceId}/logo.png`;
};

const getObj = (data, resourceId) => {
  return {
    address: data[TITLE.address],
    name: data[TITLE.name],
    symbol: data[TITLE.symbol],
    imageUri: getImageUri(resourceId),
    native: false,
    resourceId: resourceId,
  };
};

const parseTokenMappings = (tokenMappings) => {
  const eth = [];
  const meter = [];
  const bsc = [];
  tokenMappings.forEach((item) => {
    const e = item.Ethereum;
    const m = item.Meter;
    const b = item.BSC;
    const resourceId = item[TITLE.resourceId];
    if (e) {
      const obj = getObj(e, resourceId);
      if (obj.symbol === "ETH") {
        obj.native = true;
        obj.nativeDecimals = e["Token Decimals"];
      }
      eth.push(obj);
    }
    if (m) {
      const obj = getObj(m, resourceId);
      meter.push(obj);
    }
    if (b) {
      const obj = getObj(b, resourceId);
      if (obj.symbol === "UTU") {
        obj.native = true;
        obj.tokenProxy = b["Token Proxy"];
      }
      bsc.push(obj);
    }
  });

  return { eth, meter, bsc };
};

function main() {
  const token_mappings = loadTokenMappings();

  // console.log(token_mappings);

  const { eth, meter, bsc } = parseTokenMappings(token_mappings);

  fs.writeFileSync(
    path.join(__dirname, "..", "eth.json"),
    JSON.stringify(eth, null, 2)
  );
  console.log("generate eth.json success.");

  fs.writeFileSync(
    path.join(__dirname, "..", "meter.json"),
    JSON.stringify(meter, null, 2)
  );
  console.log("generate meter.json success.");

  fs.writeFileSync(
    path.join(__dirname, "..", "bsc.json"),
    JSON.stringify(bsc, null, 2)
  );
  console.log("generate bsc.json success.");

  // get resourceId directories
  const resource_logo_dirs = fs.readdirSync(
    path.join(__dirname, "..", "data/resource-logos")
  );

  copyTokenLogo(token_mappings, resource_logo_dirs);
}

main();
