import { loadKeypairFromFile } from "@/lib/helpers";
import { Keypair } from "@solana/web3.js";

import { explorerURL} from "@/lib/helpers";
import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    clusterApiUrl,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();
const endpoint = clusterApiUrl("devnet");
const connection = new Connection(endpoint, "confirmed");
const senderKeypair = loadKeypairFromFile(
    process.env.LOCAL_PAYER_JSON_ABSPATH as string
);

//######## transfer 5,000 lamports to the account with address `63EEC9FfGyksm7PkVC6z8uAmqozbQcTzbkWJNsgqjkFs`.#######
(async function () {
    const receiverPublicKey = new PublicKey(
        "63EEC9FfGyksm7PkVC6z8uAmqozbQcTzbkWJNsgqjkFs"
    );
    const transaction = new Transaction();
    const sendSolInstruction = SystemProgram.transfer({
        fromPubkey: senderKeypair.publicKey,
        toPubkey: receiverPublicKey,
        lamports: 5000,
    });
    transaction.add(sendSolInstruction);
    const signature = await sendAndConfirmTransaction(connection, transaction, [
        senderKeypair,
    ]);
    console.log(
        `💸 Finished! Sent 5000 lamports to the address ${receiverPublicKey.toBase58()}. `
    );
    console.log(
        `Transaction signature is ${explorerURL({ txSignature: signature })}!`
    );
})();
/* output
💸 Finished! Sent 5000 lamports to the address 63EEC9FfGyksm7PkVC6z8uAmqozbQcTzbkWJNsgqjkFs.
Transaction signature is https://explorer.solana.com/tx/4nqxAaxjDjQykDC5VhiZJT2zoRBX8RhTaGMXovMtzSMqrR5XNTiCJ2Rd6gY26vmYznBYv5z71TvYbMVhmHiFcDFv?cluster=devnet
 */
