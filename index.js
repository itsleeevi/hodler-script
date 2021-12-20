const Web3 = require("web3");
const crystalsABI = require("./artifacts/Crystals.json");
const heroesABI = require("./artifacts/Heroes.json");
var fs = require("fs");

const web3Main = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
);
const web3Test = new Web3(
  new Web3.providers.HttpProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545"
  )
);

const crystalsAddr = "0x55ae0C6DD155749Cc661245EDFd79dD09aE433A6";
const heroesAddr = "0x207D3bbF0fF14A51e2b80c4AE9F3b47d9515C174";

const crystalsContract = new web3Main.eth.Contract(crystalsABI, crystalsAddr);
const heroesContract = new web3Main.eth.Contract(heroesABI, heroesAddr);

const getHodlers = async (maxSupply, contract) => {
  let result = new Set();
  let address;

  for (let i = 1; i < maxSupply; i++) {
    try {
      address = await contract.methods.ownerOf(Number(i)).call();
      result.add(address);
      console.log(`Current progress: ${((i / maxSupply) * 100).toFixed(2)}%`);
    } catch (err) {}
  }

  return result;
};

const main = async () => {
  const crystalsMaxSupply = await crystalsContract.methods.MAX_SUPPLY().call();
  const heroesMaxSupply = await heroesContract.methods.MAX_SUPPLY().call();

  // get crystal hodlers
  console.log("Getting crystal hodlers...");
  let crystalHodlers = await getHodlers(crystalsMaxSupply, crystalsContract);

  // get hero hodlers
  console.log("Getting hero hodlers...");
  let heroHodlers = await getHodlers(heroesMaxSupply, heroesContract);

  let hodlers = new Set([...crystalHodlers, ...heroHodlers]);
  hodlers = Array.from(hodlers);

  console.log("Writing into file...");
  let file = fs.createWriteStream("hodlers.txt");
  file.on("error", (err) => {
    console.log(err);
  });
  hodlers.forEach((address) => {
    file.write(address + "\n");
  });
  file.end();

  console.log("Done!");
};

main();
