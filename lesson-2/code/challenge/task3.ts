import { loadKeypairFromFile } from "@/lib/helpers";
import { Keypair } from "@solana/web3.js";

import { explorerURL } from "@/lib/helpers";
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

// ############## create a new Solana account and transfer 5,000 lamports to it. #################
(async function (){
    const keypair = Keypair.generate();
    console.log(`The public new account: `, keypair.publicKey.toBase58());
    console.log(`The secret new account: `, keypair.secretKey);

    const rentExemptionAmount =
        await connection.getMinimumBalanceForRentExemption(0);

    const createAccountParams = {
        fromPubkey: senderKeypair.publicKey,
        newAccountPubkey: keypair.publicKey,
        lamports: rentExemptionAmount,
        space: 0,
        programId: SystemProgram.programId,
    };

    const createAccountTransaction = new Transaction().add(
        SystemProgram.createAccount(createAccountParams),
    );

    let signature_ = await sendAndConfirmTransaction(connection, createAccountTransaction, [
        senderKeypair,
        keypair,
    ]);

    console.log(
        `Transaction signature create account is ${explorerURL({ txSignature: signature_ })}!`
    );

    const balanceInLamports = await connection.getBalance(senderKeypair.publicKey);
    console.log("current lamport:", balanceInLamports)
    const transaction = new Transaction();
    const sendSolInstruction = SystemProgram.transfer({
        fromPubkey: senderKeypair.publicKey,
        toPubkey: keypair.publicKey,
        lamports: 5000,
    });
    transaction.add(sendSolInstruction);

    const signature = await sendAndConfirmTransaction(connection, transaction, [
            senderKeypair,
    ]);

    console.log(
        `💸 Finished! Sent 5000 lamports to the address ${keypair.publicKey.toBase58()}. `
    );
    console.log(
        `Transaction signature is ${explorerURL({ txSignature: signature })}!`
    );
})();
/* output
...
Transaction signature create account is https://explorer.solana.com/tx/4nK6t35e2deVu8e7h9AdrV9y4WKkCTz5gDhMkcQqc75HiqSTFzKTNHfWWKV1g2yL3RDeQ85ApqXnd4mT68P5jWhG?cluster=devnet
current lamport: 1493623840
💸 Finished! Sent 5000 lamports to the address 2Yb6Lwa1LP4fhRPZZZ18WYbxD4ELfgi9CivCjUjHbRKp.
Transaction signature is https://explorer.solana.com/tx/59n6rCzbKBcpRZmy4WVZxQ64etqgJsJX7EnFQsCGVcifFuHTKQTs11BmjeqkH9vThnTjnxd5XtkBiHZSCu1g7FYd?cluster=devnet
*/
