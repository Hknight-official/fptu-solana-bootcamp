import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMint2Instruction } from "@solana/spl-token";

import {
    PROGRAM_ID as METADATA_PROGRAM_ID,
    createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";

import {loadKeypairFromFile } from "@/lib/helpers";
import {testWallet, connection } from "@/lib/vars";

import {
    buildTransaction,
    explorerURL,
    extractSignatureFromFailedTransaction,
    printConsoleSeparator,
    savePublicKeyToFile,
} from "@/lib/helpers";

import dotenv from "dotenv";
dotenv.config();

const payer = loadKeypairFromFile(
    process.env.LOCAL_PAYER_JSON_ABSPATH as string
);

/*
Write code (preferably in JavaScript) to mint both a fungible token (token) and a non-fungible token (NFT).
The tokens should have names, symbols, descriptions, and images.
The token decimals should be set to 6.
 */
(async () => {
    console.log("Payer address:", payer.publicKey.toBase58());
    console.log("Test wallet address:", testWallet.publicKey.toBase58());

    const mintKeypair = Keypair.generate();
    console.log("Mint address:", mintKeypair.publicKey.toBase58());

    // define the assorted token config settings
    const tokenConfig = {
        // define how many decimals we want our tokens to have
        decimals: 6,
        //
        name: "Solana Bootcamp: FPTU",
        //
        symbol: "SB",
        //
        uri: "https://raw.githubusercontent.com/trankhacvy/fptu-solana-bootcamp/main/assets/sb-fptu-token.json",
    };

    const createMintAccountInstruction = SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        // the `space` required for a token mint is accessible in the `@solana/spl-token` sdk
        space: MINT_SIZE,
        // store enough lamports needed for our `space` to be rent exempt
        lamports: await connection.getMinimumBalanceForRentExemption(MINT_SIZE),
        // tokens are owned by the "token program"
        programId: TOKEN_PROGRAM_ID,
    });

    const initializeMintInstruction = createInitializeMint2Instruction(
        mintKeypair.publicKey,
        tokenConfig.decimals,
        payer.publicKey,
        payer.publicKey,
    );

    const metadataAccount = PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mintKeypair.publicKey.toBuffer()],
        METADATA_PROGRAM_ID,
    )[0];
    console.log("Metadata address:", metadataAccount.toBase58());

    const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
        {
            metadata: metadataAccount,
            mint: mintKeypair.publicKey,
            mintAuthority: payer.publicKey,
            payer: payer.publicKey,
            updateAuthority: payer.publicKey,
        },
        {
            createMetadataAccountArgsV3: {
                data: {
                    creators: null,
                    name: tokenConfig.name,
                    symbol: tokenConfig.symbol,
                    uri: tokenConfig.uri,
                    sellerFeeBasisPoints: 0,
                    collection: null,
                    uses: null,
                },
                // `collectionDetails` - for non-nft type tokens, normally set to `null` to not have a value set
                collectionDetails: null,
                // should the metadata be updatable?
                isMutable: true,
            },
        },
    );

    const tx = await buildTransaction({
        connection,
        payer: payer.publicKey,
        signers: [payer, mintKeypair],
        instructions: [
            createMintAccountInstruction,
            initializeMintInstruction,
            createMetadataInstruction,
        ],
    });

    printConsoleSeparator();

    try {
        // actually send the transaction
        const sig = await connection.sendTransaction(tx);

        // print the explorer url
        console.log("Transaction completed.");
        console.log(explorerURL({ txSignature: sig }));

        // locally save our addresses for the demo
        savePublicKeyToFile("tokenMint", mintKeypair.publicKey);
    } catch (err) {
        console.error("Failed to send transaction:");
        console.log(tx);

        // attempt to extract the signature from the failed transaction
        const failedSig = await extractSignatureFromFailedTransaction(connection, err);
        if (failedSig) console.log("Failed signature:", explorerURL({ txSignature: failedSig }));

        throw err;
    }

})();
