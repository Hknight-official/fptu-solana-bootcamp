import { PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

import { connection } from "@/lib/vars";
import {explorerURL, loadKeypairFromFile, loadPublicKeysFromFile} from "@/lib/helpers";
import dotenv from "dotenv";
dotenv.config();

const payer = loadKeypairFromFile(
    process.env.LOCAL_PAYER_JSON_ABSPATH as string
);

(async () => {
    console.log("Payer address:", payer.publicKey.toBase58());

    const localKeys = loadPublicKeysFromFile();

    if (!localKeys?.tokenMint)
        return console.warn("No local keys were found. Please run 'task1_create_token.ts'");

    const tokenMint: PublicKey = localKeys.tokenMint;

    console.log("==== Local PublicKeys loaded ====");
    console.log("Token's mint address:", tokenMint.toBase58());
    console.log(explorerURL({ address: tokenMint.toBase58() }));

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        tokenMint,
        payer.publicKey,
    ).then(ata => ata.address);

    console.log("Token ata account address:", tokenAccount.toBase58());

    console.log("Minting some tokens to the ata...");
    const mintSig = await mintTo(
        connection,
        payer,
        tokenMint,
        tokenAccount,
        payer,
        100*10**6,
    );

    console.log(explorerURL({ txSignature: mintSig }));

})();
