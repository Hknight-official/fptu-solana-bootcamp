// @ts-ignore
import { loadKeypairFromFile } from "@/lib/helpers";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
let secretKey = bs58.decode("4sHETGCB3bKenPVuTM8Ek7gubzcTHyXvAGzhzV1GX5XFjFkPxZiBtrRNgZpH2sHTrpdoYCMuW5ZULYhgUjqpprSG");
console.log(`[${Keypair.fromSecretKey(secretKey).secretKey}]`);
