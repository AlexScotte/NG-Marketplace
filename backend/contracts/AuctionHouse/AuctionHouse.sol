// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../../node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "../../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AuctionHouse is Ownable, ERC1155Holder, ReentrancyGuard {
    using Counters for Counters.Counter;

    /**
     * @notice Use to store the fees
     */
    uint256 public auctionHouseFunds;

    /**
     * @notice The fee charged to be able to list an item
     */
    uint256 public listingFee = 0.01 ether;

    /**
     * @notice Only this token address is allowed on this marketplace for now
     */
    address public tokenAddress;

    /**
     * @notice Number of item sold on the marketplace
     */
    Counters.Counter private _itemsSoldCount;

    /**
     * @notice Number of item listed on the marketplace
     */
    Counters.Counter public listedItemsCount;

    /**
     * @notice Listed item Informations
     */
    struct ListedItem {
        uint256 listedItemId; // ID in the marketplace list
        uint256 itemId; // ERC1155 token ID
        address payable seller;
        address buyer;
        uint256 price;
        bool isSold;
    }

    /**
     * @notice Event item listed successfully
     */
    event ItemListedSuccess(
        uint256 indexed itemId,
        address seller,
        uint256 price
    );

    /**
     * @notice Event Item sold successfully
     */
    event ItemSoldSuccess(
        uint256 indexed itemId,
        address seller,
        address buyer,
        uint256 price
    );

    /**
     * @notice Event Item canceled successfully
     */
    event ItemCanceledSuccess();

    /**
     * @notice Map listedItem by marketplace ID
     */
    mapping(uint256 => ListedItem) private idToListedItem;

    /**
     * @notice All lited items
     */
    ListedItem[] public listedItems;

    /**
     * @notice Set the token address in the constructor to only be able to list/buy/sell this specific token
     * @param _tokenAddress: Address of the marketplace token
     */
    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }

    /**
     * @notice Allows the administrator to set the listing fees
     * @param newListingFee: New marketplace listing fees
     */
    function updatelistingFee(
        uint256 newListingFee
    ) external payable onlyOwner nonReentrant {
        require(newListingFee > 0, "New listing fee cannot be 0");
        listingFee = newListingFee;
    }

    /**
     * @notice Allows to know the current listing fees
     */
    function getlistingFee() external view returns (uint256) {
        return listingFee;
    }

    /**
     * @notice Allows to list all the items that is sell on the marketplace
     * @return Items listed on the marketplace.
     */
    function getListedItems() external view returns (ListedItem[] memory) {
        return listedItems;
    }

    /**
     * @notice Allow a user to sell an item on the marketplace
     * @param itemId: Collection item ID to sell
     * @param sellingPrice: Sell price of the item
     */
    function listItem(
        uint256 itemId,
        uint256 sellingPrice
    ) external payable nonReentrant {
        //Make sure the user sent enough money to pay for the listing fee
        require(msg.value == listingFee, "You need to pay listing fees");
        require(sellingPrice > 0, "You need to specify a correct price");

        uint256 listedItemCount = listedItemsCount.current();

        ListedItem memory newListedItem = ListedItem(
            listedItemCount,
            itemId,
            payable(msg.sender), // seller
            address(0), // buyer
            sellingPrice,
            false
        );

        // Transfer fee to the contract
        auctionHouseFunds += msg.value;

        // Update the mapping of tokenId's to Item details, useful for retrieval functions
        idToListedItem[listedItemCount] = newListedItem;
        listedItems.push(newListedItem);

        IERC1155(tokenAddress).safeTransferFrom(
            msg.sender, // from
            address(this), // to
            itemId,
            1,
            "0x0"
        );

        listedItemsCount.increment();

        // Trigger the event
        emit ItemListedSuccess(itemId, msg.sender, sellingPrice);
    }

    function executeSale(uint256 listedItemId) external payable nonReentrant {
        uint itemPrice = idToListedItem[listedItemId].price;
        address seller = idToListedItem[listedItemId].seller;

        require(
            msg.value == itemPrice,
            "Insufficent price value for this item."
        );

        require(seller != msg.sender, "You cannot buy your own item");

        // Update item informations
        ListedItem memory listedItem = idToListedItem[listedItemId];
        listedItem.buyer = payable(msg.sender);
        listedItem.isSold = true;

        listedItems[listedItemId] = listedItem;
        idToListedItem[listedItemId] = listedItem;

        _itemsSoldCount.increment();

        // Transfer item to the new owner
        IERC1155(tokenAddress).safeTransferFrom(
            address(this), // from
            msg.sender, // to
            listedItem.itemId,
            1,
            "0x0"
        );

        // // TODO - improvment
        // // Add a taxe on all the item sold (royalties ?)
        // // payable(address(this)).transfer(fee to define);

        // Transfer money to the seller
        (bool success, ) = payable(idToListedItem[listedItemId].seller).call{
            value: msg.value
        }("");
        require(success, "Failed to send money to the seller");

        emit ItemSoldSuccess(
            listedItem.itemId,
            listedItem.seller,
            msg.sender,
            listedItem.price
        );
    }

    /**
     * @notice Allow a user to cancel a sale that he created
     * @param marketplaceId: ID in the market place list
     */
    function cancelSale(uint256 marketplaceId) external {
        ListedItem memory listedItem = idToListedItem[marketplaceId];

        require(listedItem.itemId != 0, "Item not found in the marketplace");
        require(
            listedItem.seller == msg.sender,
            "You are not the seller of the item"
        );

        // Send back the item to the seller
        IERC1155(tokenAddress).safeTransferFrom(
            address(this), // from
            msg.sender, // to
            listedItem.itemId,
            1,
            "0x0"
        );

        uint256 listedItemCount = listedItemsCount.current();
        if (listedItemCount > 1) {
            // Get last item in list
            ListedItem storage lastItem = listedItems[listedItemCount - 1];

            // Put last item at the canceled item place
            lastItem.listedItemId = marketplaceId;
            idToListedItem[marketplaceId] = lastItem;
            listedItems[marketplaceId] = lastItem;
        }

        // Remove the last item in the marketplace list
        listedItems.pop();
        listedItemsCount.decrement();

        // Trigger the event
        emit ItemCanceledSuccess();
    }
}
