// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../../node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract AuctionHouse is Ownable, ERC1155Holder {
    using Counters for Counters.Counter;

    // Only this token address is allowed on this marketplace for now
    address public tokenAddress;

    //The fee charged by the marketplace to be allowed to list an NFT
    uint256 listingPrice = 0.01 ether;

    //_itemIds variable has the most recent minted tokenId
    Counters.Counter private _itemIds;

    // Number of item sold on the marketplace
    Counters.Counter private _itemsSoldCount;

    // Number of item listed on the marketplace
    Counters.Counter public listedItemsCount;

    // Lited token Informations
    struct ListedItem {
        uint256 itemId;
        address payable owner;
        address payable seller;
        address buyer;
        uint256 price;
        uint256 deadline;
        bool currentlyListed;
        bool isSold;
    }

    // Event listing successfull
    event ItemListedSuccess(
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price
    );

    // Map listedItem by itemId
    mapping(uint256 => ListedItem) private idToListedItem;

    constructor(address _tokenAddress) {
        // Set the token address in the constructor
        // to only be able to list/buy/sell this specific token
        tokenAddress = _tokenAddress;
    }

    function updateListingPrice(uint256 newPrice) public payable onlyOwner {
        require(newPrice > 0, "New listing price cannot be 0");
        listingPrice = newPrice;
    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // function getLatestIdToListedItem()
    //     public
    //     view
    //     returns (ListedItem memory)
    // {
    //     uint256 currentItemId = _itemIds.current();
    //     return idToListedItem[currentItemId];
    // }

    // function getListedItemForId(
    //     uint256 tokenId
    // ) public view returns (ListedItem memory) {
    //     return idToListedItem[tokenId];
    // }

    // function getCurrentItem() public view returns (uint256) {
    //     return _itemIds.current();
    // }

    function listItem(
        uint256 itemId,
        uint256 sellingPrice,
        uint256 deadline
    ) external payable {
        //Make sure the sender sent enough ETH to pay for listing
        require(msg.value == listingPrice, "You need to pay listing fees");
        require(sellingPrice > 0, "You need to specify a correct price");
        // require(
        //     _deadline > 3600,
        //     "The deadline needs to be greater than 1 hour"
        // );

        uint256 listedItemCount = listedItemsCount.current();

        //Update the mapping of tokenId's to Item details, useful for retrieval functions
        idToListedItem[listedItemCount] = ListedItem(
            itemId,
            payable(msg.sender), // owner
            payable(address(this)), // seller
            address(0), // buyer
            sellingPrice,
            deadline,
            true,
            false
        );

        IERC1155(tokenAddress).safeTransferFrom(
            msg.sender, // from
            address(this), // to
            itemId,
            1,
            "0x0"
        );

        // _marketOwner.transfer(LISTING_FEE);
        listedItemsCount.increment();

        //Emit the event for successful transfer. The frontend parses this message and updates the end user
        // emit ItemListedSuccess(
        //     tokenId,
        //     address(this),
        //     msg.sender,
        //     price,
        //     true
        // );
    }

    //This will return all the NFTs currently listed to be sold on the marketplace
    // function getAllNFTs() public view returns (ListedItem[] memory) {
    //     uint nftCount = _itemIds.current();
    //     ListedItem[] memory tokens = new ListedItem[](nftCount);
    //     uint currentIndex = 0;

    //     //at the moment currentlyListed is true for all, if it becomes false in the future we will
    //     //filter out currentlyListed == false over here
    //     for (uint i = 0; i < nftCount; i++) {
    //         uint currentId = i + 1;
    //         ListedItem storage currentItem = idToListedItem[currentId];
    //         tokens[currentIndex] = currentItem;
    //         currentIndex += 1;
    //     }
    //     //the array 'tokens' has the list of all NFTs in the marketplace
    //     return tokens;
    // }

    // //Returns all the NFTs that the current user is owner or seller in
    // function getMyNFTs() public view returns (ListedItem[] memory) {
    //     uint totalItemCount = _itemIds.current();
    //     uint itemCount = 0;
    //     uint currentIndex = 0;

    //     //Important to get a count of all the NFTs that belong to the user before we can make an array for them
    //     for (uint i = 0; i < totalItemCount; i++) {
    //         if (
    //             idToListedItem[i + 1].owner == msg.sender ||
    //             idToListedItem[i + 1].seller == msg.sender
    //         ) {
    //             itemCount += 1;
    //         }
    //     }

    //     //Once you have the count of relevant NFTs, create an array then store all the NFTs in it
    //     ListedItem[] memory items = new ListedItem[](itemCount);
    //     for (uint i = 0; i < totalItemCount; i++) {
    //         if (
    //             idToListedItem[i + 1].owner == msg.sender ||
    //             idToListedItem[i + 1].seller == msg.sender
    //         ) {
    //             uint currentId = i + 1;
    //             ListedItem storage currentItem = idToListedItem[currentId];
    //             items[currentIndex] = currentItem;
    //             currentIndex += 1;
    //         }
    //     }
    //     return items;
    // }

    function executeSale(uint256 listedItemId) public payable {
        uint itemPrice = idToListedItem[listedItemId].price;
        address seller = idToListedItem[listedItemId].seller;

        require(
            msg.value == itemPrice,
            "Insufficent price value for this item."
        );

        // Update item informations
        idToListedItem[listedItemId].currentlyListed = false;
        idToListedItem[listedItemId].buyer = payable(msg.sender);
        idToListedItem[listedItemId].isSold = true;

        _itemsSoldCount.increment();

        // Transfer item to the new owner
        IERC1155(tokenAddress).safeTransferFrom(
            address(this), // from
            msg.sender, // to
            idToListedItem[listedItemId].itemId,
            1,
            "0x0"
        );

        // TODO
        //Transfer the listing fee to the marketplace creator
        // payable(owner).transfer(listPrice);

        // Transfer money to the seller
        payable(seller).transfer(msg.value);
    }
}
