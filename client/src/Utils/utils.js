export const Pages = {
    Quests: 0,
    Inventory: 1,
    Marketplace: 2,
}

export const ChainID = {
    Local: "0x539",
    Goerli: "0x5",
    Mumbai: "0x13881",
}

export const ToShortAddress = (address) => {
    return address.substring(
        0,
        5
    ) + "..." +
        address.substr(address.length - 5);
}

export const ToFriendlyPrice = (price, decimals) => {
    return parseFloat(price * 10 ** -decimals).toFixed(2);
}

export const GetColorRarity = (rarity) => {

    switch (rarity) {
        case "common":
            return "rgba(255, 255, 244, 0.314)";
        case "uncommon":
            return "rgba(30, 255, 0, 0.314)";
        case "rare":
            return "rgba(0, 112, 221, 0.314)";
        case "epic":
            return "rgba(163, 53, 238, 0.314)";
        case "legendary":
            return "rgba(255, 128, 0, 0.314)";
        default:
            return "rgba(255, 255, 244, 0.314)";
    }
}