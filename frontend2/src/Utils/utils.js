export const Pages = {
  Quests: 0,
  Inventory: 1,
  Marketplace: 2,
};

export const ChainID = {
  Local: 1337,
  HardhatLocal: 31337,
  Goerli: 5,
  Mumbai: 80001,
};

export const ToShortAddress = (address) => {
  return address.substring(0, 5) + "..." + address.substr(address.length - 5);
};

export const ToFriendlyPrice = (price, decimals) => {
  if (!decimals) decimals = 0;
  return parseFloat(price * 10 ** -decimals).toFixed(2);
};

export const GetColorRarity = (rarity) => {
  switch (rarity) {
    case "Common":
      return "rgba(255, 255, 244, 0.314)";
    case "Uncommon":
      return "rgba(30, 255, 0, 0.314)";
    case "Rare":
      return "rgba(0, 112, 221, 0.314)";
    case "Epic":
      return "rgba(163, 53, 238, 0.314)";
    case "Legendary":
      return "rgba(255, 128, 0, 0.314)";
    default:
      return "rgba(255, 255, 244, 0.314)";
  }
};

export const GetColorRarityWithoutTransparency = (rarity) => {
  switch (rarity) {
    case "Common":
      return "rgba(255, 255, 244, 1)";
    case "Uncommon":
      return "rgba(30, 255, 0, 11)";
    case "Rare":
      return "rgba(0, 112, 221, 1)";
    case "Epic":
      return "rgba(163, 53, 238, 1)";
    case "Legendary":
      return "rgba(255, 128, 0, 1)";
    default:
      return "rgba(255, 255, 244, 1)";
  }
};

export const GetCoinIconWithEnv = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912";
  } else {
    return "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880";
  }
};

export const GetExpectedChainIdWithEnv = () => {
  // Use to define what chain is used in function of the current environment
  // Development -> Hardhat Local
  // Production -> Mumbai
  if (process.env.NODE_ENV === "production") {
    return ChainID.Mumbai;
  } else {
    return ChainID.HardhatLocal;
  }
};

export const GetExpectedChainNameWithEnv = () => {
  if (process.env.NODE_ENV === "production") {
    return "Mumbai";
  } else {
    return "Hardhat local";
  }
};
