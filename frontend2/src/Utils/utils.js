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
