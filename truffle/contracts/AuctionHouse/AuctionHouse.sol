// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../../node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract AuctionHouse is Ownable, ERC1155Holder {
    using Counters for Counters.Counter;
    //_itemIds variable has the most recent minted tokenId
    Counters.Counter private _itemIds;
    //Keeps track of the number of items sold on the marketplace
    Counters.Counter private _itemsSold;
    // //owner is the contract address that created the smart contract
    // address payable owner;
    //The fee charged by the marketplace to be allowed to list an NFT
    uint256 listPrice = 0.01 ether;

    address public tokenAddress;

    //The structure to store info about a listed token
    struct ListedItem {
        uint256 itemId;
        address payable owner;
        address payable seller;
        uint256 price;
        uint256 deadline;
        bool currentlyListed;
    }

    //the event emitted when a token is successfully listed
    // event ItemListedSuccess (
    //     uint256 indexed tokenId,
    //     address owner,
    //     address seller,
    //     uint256 price,
    //     bool currentlyListed
    // );

    //This mapping maps tokenId to token info and is helpful when retrieving details about a tokenId
    mapping(uint256 => ListedItem) private idToListedItem;

    constructor(address _tokenAddress) {
        // Set the token address in the constructor
        // to only be able to list/buy/sell this specific token
        tokenAddress = _tokenAddress;
    }

    // function updateListPrice(uint256 _listPrice) public payable {
    //     require(owner == msg.sender, "Only owner can update listing price");
    //     listPrice = _listPrice;
    // }

    // function getListPrice() public view returns (uint256) {
    //     return listPrice;
    // }

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
        uint256 price,
        uint256 deadline
    ) external {
        //Make sure the sender sent enough ETH to pay for listing
        // require(msg.value == listPrice, "Hopefully sending the correct price");
        // //Just sanity check
        // require(price > 0, "Make sure the price isn't negative");
        // require(
        //     _deadline > 3600,
        //     "The deadline needs to be greater than 1 hour"
        // );

        //Update the mapping of tokenId's to Item details, useful for retrieval functions
        idToListedItem[itemId] = ListedItem(
            itemId,
            payable(address(this)),
            payable(msg.sender),
            price,
            deadline,
            true
        );

        // IERC1155(nftContract).safeTransferFrom(
        //     msg.sender,
        //     _receiver,
        //     _itemId,
        //     _amountOfItem,
        //     "0x0"
        // );

        IERC1155(tokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            itemId,
            1,
            "0x0"
        );
        // _marketOwner.transfer(LISTING_FEE);
        // _nftCount.increment();

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

    // function executeSale(uint256 tokenId) public payable {
    //     uint price = idToListedItem[tokenId].price;
    //     address seller = idToListedItem[tokenId].seller;
    //     require(
    //         msg.value == price,
    //         "Please submit the asking price in order to complete the purchase"
    //     );

    //     //update the details of the token
    //     idToListedItem[tokenId].currentlyListed = true;
    //     idToListedItem[tokenId].seller = payable(msg.sender);
    //     _itemsSold.increment();

    //     //Actually transfer the token to the new owner
    //     _transfer(address(this), msg.sender, tokenId);
    //     //approve the marketplace to sell NFTs on your behalf
    //     approve(address(this), tokenId);

    //     //Transfer the listing fee to the marketplace creator
    //     payable(owner).transfer(listPrice);
    //     //Transfer the proceeds from the sale to the seller of the NFT
    //     payable(seller).transfer(msg.value);
    // }
}
