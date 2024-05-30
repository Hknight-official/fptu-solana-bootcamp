import {explorerURL, loadKeypairFromFile} from "@/lib/helpers";
import { Keypair } from "@solana/web3.js";
import {
    Connection,
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

//####### create a new Solana account.##############
(async function (){
    const keypair = Keypair.generate();
    console.log(`The public new account: `, keypair.publicKey.toBase58());
    console.log(`The secret new account: `, keypair.secretKey);

    let createAccountParams = {
        fromPubkey: senderKeypair.publicKey,
        newAccountPubkey: keypair.publicKey,
        lamports: (await connection.getMinimumBalanceForRentExemption(0)),
        space: 0,
        programId: SystemProgram.programId,
    };

    const createAccountTransaction = new Transaction().add(
        SystemProgram.createAccount(createAccountParams),
    );

    let sign = await sendAndConfirmTransaction(connection, createAccountTransaction, [
        senderKeypair,
        keypair,
    ]);
    console.log(
        `Transaction signature create account is ${explorerURL({ txSignature: sign })}!`
    );
})();
/*
...
Transaction signature create account is https://explorer.solana.com/tx/5M7aHpEW7VAgviLfrDB2irZUNtYJYETkvBKuCMdDzSQkNNVRgBYFCDxGCJ35WXVCdUXNn9LKDmCo5tv559iMEhoL?cluster=devnet
 */
