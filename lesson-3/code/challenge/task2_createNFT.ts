import { Keypair } from "@solana/web3.js";
import {
    Metaplex,
    bundlrStorage,
    keypairIdentity,
} from "@metaplex-foundation/js";

import { connection } from "@/lib/vars";
import {explorerURL, loadKeypairFromFile, printConsoleSeparator} from "@/lib/helpers";

import dotenv from "dotenv";
dotenv.config();

const payer = loadKeypairFromFile(
    process.env.LOCAL_PAYER_JSON_ABSPATH as string
);

/*
Write code (preferably in JavaScript) to mint a non-fungible token (NFT).
The NFT should also have a name, symbol, description, image, and additional traits.
The NFT royalty should be set to 10%.
 */
(async () => {
    console.log("Payer address:", payer.publicKey.toBase58());

    const metadata = {
        name: "Solana Bootcamp: FPTU",
        symbol: "SB",
        description: "Solana Bootcamp: FPTU",
        image:
            "https://github.com/trankhacvy/fptu-solana-bootcamp/blob/main/assets/logo.png?raw=true",
    };

    const metaplex = Metaplex.make(connection)
            // set our keypair to use, and pay for the transaction
            .use(keypairIdentity(payer))
            // define a storage mechanism to upload with
            .use(
                bundlrStorage({
                    address: "https://devnet.bundlr.network",
                    providerUrl: "https://api.devnet.solana.com",
                    timeout: 60000,
                })
            );

    console.log("Uploading metadata...");

    // upload the JSON metadata
    const { uri } = await metaplex.nfts().uploadMetadata(metadata);

    console.log("Metadata uploaded:", uri);

    printConsoleSeparator("NFT details");

    console.log("Creating NFT using Metaplex...");

    const tokenMint = Keypair.generate();

    // create a new nft using the metaplex sdk
    const { nft, response } = await metaplex.nfts().create({
        uri,
        name: metadata.name,
        symbol: metadata.symbol,
        useNewMint: tokenMint,
        sellerFeeBasisPoints: 10*100, // Royalty represents 10.00%.
        isMutable: true,
    });

    console.log(nft);

    printConsoleSeparator("NFT created:");
    console.log(explorerURL({ txSignature: response.signature }));
})();
/* output
Payer address: 8gKKm1P7bEdqAuohewyYrontfJnfwoXrwtQmsfoxJEWg
Uploading metadata...
Metadata uploaded: https://arweave.net/MknPp2Sb8pOx3znFbTE1byWRdm-d6NgnHvPSmLNVSbg

===============================================
===============================================

NFT details
Creating NFT using Metaplex...
{
  model: 'nft',
  updateAuthorityAddress: PublicKey [PublicKey(8gKKm1P7bEdqAuohewyYrontfJnfwoXrwtQmsfoxJEWg)] {
    _bn: <BN: 72142dabcd23229cc3bcf2cbeb78f23bfe129da2974a306bfb660120f2cb27e5>
  },
  json: {
    name: 'Solana Bootcamp: FPTU',
    symbol: 'SB',
    description: 'Solana Bootcamp: FPTU',
    image: 'https://github.com/trankhacvy/fptu-solana-bootcamp/blob/main/assets/logo.png?raw=true'
  },
  jsonLoaded: true,
  name: 'Solana Bootcamp: FPTU',
  symbol: 'SB',
  uri: 'https://arweave.net/MknPp2Sb8pOx3znFbTE1byWRdm-d6NgnHvPSmLNVSbg',
  isMutable: true,
  primarySaleHappened: false,
  sellerFeeBasisPoints: 1000,
  editionNonce: 255,
  creators: [
    {
      address: [PublicKey [PublicKey(8gKKm1P7bEdqAuohewyYrontfJnfwoXrwtQmsfoxJEWg)]],
      verified: true,
      share: 100
    }
  ],
  tokenStandard: 0,
  collection: null,
  collectionDetails: null,
  uses: null,
  programmableConfig: null,
  address: PublicKey [PublicKey(61gpVgraKNEEbQX6Axn7RwZgxr9k5nVSvPvfAdMZV4Hb)] {
    _bn: <BN: 4a77753dd0598822829dd57d7d7c79667c89e56e61b21c4ee438bf1f8cc5918e>
  },
  metadataAddress: Pda [PublicKey(5CxsFD5wHjvC7YH7x2nAzDZWbX9rEpNJAQkYtPRk23JB)] {
    _bn: <BN: 3e7f4e08ecbb7dcb582feb836d17551dd93a0002627e7630aff46863e43a0304>,
    bump: 254
  },
  mint: {
    model: 'mint',
    address: PublicKey [PublicKey(61gpVgraKNEEbQX6Axn7RwZgxr9k5nVSvPvfAdMZV4Hb)] {
      _bn: <BN: 4a77753dd0598822829dd57d7d7c79667c89e56e61b21c4ee438bf1f8cc5918e>
    },
    mintAuthorityAddress: PublicKey [PublicKey(32wW7ncMMDcKA6rbk892T4YXTDMLcExzyvNXsGcPVZ2A)] {
      _bn: <BN: 1e36948dd65707e679e4022b7025bd3632c2b0e97d0da7fd5f9acb3e9c6c0423>
    },
    freezeAuthorityAddress: PublicKey [PublicKey(32wW7ncMMDcKA6rbk892T4YXTDMLcExzyvNXsGcPVZ2A)] {
      _bn: <BN: 1e36948dd65707e679e4022b7025bd3632c2b0e97d0da7fd5f9acb3e9c6c0423>
    },
    decimals: 0,
    supply: { basisPoints: <BN: 1>, currency: [Object] },
    isWrappedSol: false,
    currency: { symbol: 'SB', decimals: 0, namespace: 'spl-token' }
  },
  token: {
    model: 'token',
    address: Pda [PublicKey(8cHH97kiMkd2nuMr39nzJsBzkpB6qcAEuv7uitPh272t)] {
      _bn: <BN: 710b8aeec95b59bcfa543af5aec4d41b33987595af5058f289dcbe603424b0ed>,
      bump: 253
    },
    isAssociatedToken: true,
    mintAddress: PublicKey [PublicKey(61gpVgraKNEEbQX6Axn7RwZgxr9k5nVSvPvfAdMZV4Hb)] {
      _bn: <BN: 4a77753dd0598822829dd57d7d7c79667c89e56e61b21c4ee438bf1f8cc5918e>
    },
    ownerAddress: PublicKey [PublicKey(8gKKm1P7bEdqAuohewyYrontfJnfwoXrwtQmsfoxJEWg)] {
      _bn: <BN: 72142dabcd23229cc3bcf2cbeb78f23bfe129da2974a306bfb660120f2cb27e5>
    },
    amount: { basisPoints: <BN: 1>, currency: [Object] },
    closeAuthorityAddress: null,
    delegateAddress: null,
    delegateAmount: { basisPoints: <BN: 0>, currency: [Object] },
    state: 1
  },
  edition: {
    model: 'nftEdition',
    isOriginal: true,
    address: Pda [PublicKey(32wW7ncMMDcKA6rbk892T4YXTDMLcExzyvNXsGcPVZ2A)] {
      _bn: <BN: 1e36948dd65707e679e4022b7025bd3632c2b0e97d0da7fd5f9acb3e9c6c0423>,
      bump: 255
    },
    supply: <BN: 0>,
    maxSupply: <BN: 0>
  }
}

===============================================
===============================================

NFT created:
https://explorer.solana.com/tx/4g1kVXWFBdYMigqdK3FaQDq4tN9W8VHUw4eyGzRdMtiU975ADyq8LG3wdbMgjFoj17daeE83vpRKmA76wGHnjdg6?cluster=devnet
 */
