import { loadKeypairFromFile } from "@/lib/helpers";
import {Keypair, TransactionMessage, VersionedTransaction} from "@solana/web3.js";

import { explorerURL, printConsoleSeparator } from "@/lib/helpers";
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

// ############## Write code to create a new Solana account, transfer 5,000 lamports to this new account, and also transfer 7,000 lamports to the account 63EEC9FfGyksm7PkVC6z8uAmqozbQcTzbkWJNsgqjkFs. #################
(async function (){
    const new_account_keypair = Keypair.generate();
    console.log(`The public new account: `, new_account_keypair.publicKey.toBase58());
    console.log(`The secret new account: `, new_account_keypair.secretKey);

    const rentExemptionAmount =
        await connection.getMinimumBalanceForRentExemption(0);

    const createAccountParams = {
        fromPubkey: senderKeypair.publicKey,
        newAccountPubkey: new_account_keypair.publicKey,
        lamports: rentExemptionAmount,
        space: 0,
        programId: SystemProgram.programId,
    };

    const createAccountTransaction = new Transaction().add(
        SystemProgram.createAccount(createAccountParams),
    );

    let signature_ = await sendAndConfirmTransaction(connection, createAccountTransaction, [
        senderKeypair,
        new_account_keypair,
    ]);

    console.log(
        `Transaction signature create account is ${explorerURL({ txSignature: signature_ })}!`
    );

    const transferToNewWalletIx = SystemProgram.transfer({
        lamports: 5000,
        // `fromPubkey` - from MUST sign the transaction
        fromPubkey: senderKeypair.publicKey,
        // `toPubkey` - does NOT have to sign the transaction
        toPubkey: new_account_keypair.publicKey,
        programId: SystemProgram.programId,
    });

    const transferToStaticWalletIx = SystemProgram.transfer({
        lamports: 7000,
        // `fromPubkey` - from MUST sign the transaction
        fromPubkey: senderKeypair.publicKey,
        // `toPubkey` - does NOT have to sign the transaction
        toPubkey: new PublicKey("63EEC9FfGyksm7PkVC6z8uAmqozbQcTzbkWJNsgqjkFs"),
        programId: SystemProgram.programId,
    });
    const recentBlockhash = await connection
        .getLatestBlockhash()
        .then((res) => res.blockhash);

    const message = new TransactionMessage({
        payerKey: senderKeypair.publicKey,
        recentBlockhash,
        instructions: [
            // create the test wallet's account on chain
            transferToNewWalletIx,
            // transfer lamports to the static wallet
            transferToStaticWalletIx,
        ],
    }).compileToV0Message();

    const tx = new VersionedTransaction(message);
    tx.sign([senderKeypair]);
    const sig = await connection.sendTransaction(tx);

    console.log("Transaction completed.");
    console.log(explorerURL({ txSignature: sig }));

})();
/* output
...
Transaction signature create account is https://explorer.solana.com/tx/2wGqoiDMqkVi3mj7qzwDhLpPAtEH5jfMjzuvnyciL3emtCbyggvwaLmmvDY4TYCxciprgnNDsyp7b3224XqfftoU?cluster=devnet
Transaction completed.
https://explorer.solana.com/tx/5yef7o8b4QEBfuPh3izf3ngpSAMnmbxDKZvb5ivJe3APruxJAk8gcnTShtJFrvpxL1UAdJeUai7JLMAVc1jmRSKn?cluster=devnet
 */
