<img width="1132" alt="banner-marketplace" src="https://github.com/AlexScotte/NG-Marketplace/assets/53000621/d4da6856-a391-46d7-b818-302da1dce98e">

Welcome guardian. You have come a long way and braved multiple challenges to get all these rewards.
Now it's time to trade them with others guardians

> **Warning**
> All assets used in this project are the property of https://nodeguardians.io/
> 
> They have been copied for purely educational purposes.


## Subject :

NG-Marketplace is a project carried out as part of Alyra's blockchain developer training.

The subject of this project is the tokenization of the Node Guardians quests rewards and the creation of a marketplace to be able to sell and buy these rewards.

## Workflow :

For this project the structure of the site has been retained.
-  The developer performs the quests on the Goerli blockchain to avoid paying too many fees.
- When a quest has been successfully completed, the user no longer wins fictitious gold but Guardians which is an ERC20 token. Rewards are sent to his wallet on the polygon blockchain (Mumbai for the testnet) because the fees are much lower than on the Ethereum blockchain.
- User can go to his inventory to see the earned tokens. From his inventory he can use his tokens to buy reward chests. Reward chests are ERC1155 tokens.
- Always from his inventory, the user can open his chest and discover the rewards he has obtained. The pieces of equipment obtained are also ERC1155 tokens. A smartcontract determines which rewards the user will get randomly with a drop percentage for rarity.
- User can consult the details of the pieces of equipment won by clicking on them. He can also put them on sale on the marketplace by specifying the price.
- User can go to the auction house to see the items he has put up for sale or buy items sold by other users.
- From the market place, the user can consult his sales (and cancel them) and consult the articles put on sale by others to buy them.

![image](https://github.com/AlexScotte/NG-Marketplace/assets/53000621/adec9991-b311-40bc-9b01-b4e46a74b348)


## Links
Lien vers l'application déployée sur Vercel:
https://ng-marketplace-git-master-alexscotte.vercel.app

Vidéo de présentation de Node Guardians pour plus de contexte:
https://www.loom.com/share/1d6defa0b70b45bfb236d8404ae338ed

Vidéo de présentation du projet en LOCAL:
https://www.loom.com/share/fc2acebf33d9400389fb6d970d3d7d87

Vidéo de présentation du projet sur TEST NET:
https://www.loom.com/share/fe4b3009276543db9ae2136e1a73e1df






## Aperçu de l'application:

<img width="957" alt="Inventory" src="https://user-images.githubusercontent.com/53000621/230975145-99f53105-831b-426b-b985-5db83a6f833f.png">
<img width="950" alt="Inventory details" src="https://user-images.githubusercontent.com/53000621/230975171-0b243f64-c37e-4e1a-8241-a86189838d70.png">
<img width="952" alt="Marketplace" src="https://user-images.githubusercontent.com/53000621/230975190-ce387fb1-b450-497c-9dd6-e96a40454953.png">
<img width="950" alt="Marketplace details" src="https://user-images.githubusercontent.com/53000621/230975207-77fbca59-2374-4fb7-9a66-33627d621152.png">

Test unitaires:

<img width="805" alt="image" src="https://user-images.githubusercontent.com/53000621/231377385-adf88dcb-3239-4b79-af03-bd497060999b.png">

