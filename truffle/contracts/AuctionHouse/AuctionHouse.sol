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
     * @notice The fee charged to be able to list an item
     */
    // Listed token Informations
    struct ListedItem {
        uint256 listedItemId; // Id in the marketplace list
        uint256 itemId; // token id
        address payable seller;
        address buyer;
        uint256 price;
        bool currentlyListed;
        bool isSold;
    }

    /**
     * @notice Event listing successfull
     */
    event ItemListedSuccess(
        uint256 indexed itemId,
        address seller,
        uint256 price
    );

    /**
     * @notice Event sell successfull
     */
    event ItemSoldSuccess(
        uint256 indexed itemId,
        address seller,
        address buyer,
        uint256 price
    );
    /**
     * @notice Map listedItem by itemId
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
     * @notice Allows a registered voter to check informations of another voter.
     * Requirements:
     *  - The caller must be the owner.
     * @param newListingFee: New marketplace listing fee
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
            true,
            false
        );

        // Transfer fee to the contract
        auctionHouseFunds += msg.value;

        //Update the mapping of tokenId's to Item details, useful for retrieval functions
        idToListedItem[listedItemCount] = newListedItem;
        listedItems.push(newListedItem);

        IERC1155(tokenAddress).safeTransferFrom(
            msg.sender, // from
            address(this), // to
            itemId,
            1,
            "0x0"
        );

        // _marketOwner.transfer(LISTING_FEE);
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
        listedItem.currentlyListed = false;
        listedItem.buyer = payable(msg.sender);
        listedItem.isSold = true;

        listedItems[listedItemId] = listedItem;

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

        // // Transfer money to the seller
        (bool success, ) = payable(idToListedItem[listedItemId].seller).call{
            value: msg.value
        }("");

        emit ItemSoldSuccess(
            listedItem.itemId,
            listedItem.seller,
            msg.sender,
            listedItem.price
        );
    }
}
