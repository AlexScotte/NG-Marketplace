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