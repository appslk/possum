import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, TransactionSignature } from '@solana/web3.js';
import { FC, useCallback, useMemo, useState, useEffect } from 'react';
import { notify } from "../utils/notifications";
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { generateSigner, transactionBuilder, publicKey, some } from '@metaplex-foundation/umi';
import { TokenPaymentMintArgs, fetchCandyMachine, mintV2, mplCandyMachine, route, safeFetchCandyGuard } from "@metaplex-foundation/mpl-candy-machine";
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { fetchMetadata, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import * as bs58 from 'bs58';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import { getMerkleProof, getMerkleRoot } from "@metaplex-foundation/mpl-candy-machine";
import axios from 'axios';
import { FindNftByMintInput, Metaplex } from '@metaplex-foundation/js';
import { url } from 'inspector';
import { Footer2 } from './Footer2';
import { Console } from 'console';

const quicknodeEndpoint = process.env.NEXT_PUBLIC_RPC/* || clusterApiUrl('devnet')*/;
const candyMachineAddress = publicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID);
const treasury = publicKey(process.env.NEXT_PUBLIC_TREASURY);
const allowList = process.env.NEXT_PUBLIC_ALLOWLIST.split(',');
const allowList2 = process.env.NEXT_PUBLIC_ALLOWLIST2.split(',');
const allowList3 = process.env.NEXT_PUBLIC_ALLOWLIST3.split(',');

interface ItemData {
    name?: string;
    uri?: string;
}

export const CandyMint: FC = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const { getUserSOLBalance } = useUserSOLBalanceStore();
    const [_itemsRedeemed, setItemsRedeemed] = useState(0);
    const [_itemsLoaded, setTotalSupply] = useState(0);
    const [showMintOptions, setShowMintOptions] = useState(false);
    const [mintedImg, setMintedImg] = useState<string>('');
    const [imageID, setImageID] = useState<string>('');
    const [itemDatas, setItemDatas] = useState<ItemData[]>([]);
    const [_showWL1, setShowWL1] = useState(false);
    const [_showWL2, setShowWL2] = useState(false);
    const [_showWL3, setShowWL3] = useState(false);
    const [_pageNo, setPageNo] = useState(1);
    const [activePage, setActivePage] = useState(1);
    const [_lastPage, setLastPage] = useState(10);
    const [_o, setO] = useState(0);
    const [_loader, set_loader] = useState(0);
    const [_loaded, setLoaded] = useState(0);
    const [_type1, set_type1] = useState(0);
    const [_type2, set_type2] = useState(0);
    const [_type3, set_type3] = useState(0);
    const [_type4, set_type4] = useState(0);
    const [_type5, set_type5] = useState(0);
    const [_type6, set_type6] = useState(0);
    const [selectedType, setSelectedType] = useState(null);

    const [_value0_1, set_value0_1] = useState('');
    const [_value1_1, set_value1_1] = useState('');
    const [_value2_1, set_value2_1] = useState('');
    const [_value3_1, set_value3_1] = useState('');
    const [_value4_1, set_value4_1] = useState('');
    const [_value5_1, set_value5_1] = useState('');
    const [_value6_1, set_value6_1] = useState('');
    const [_value7_1, set_value7_1] = useState('');
    const [_value8_1, set_value8_1] = useState('');

    const [_value0_2, set_value0_2] = useState('');
    const [_value1_2, set_value1_2] = useState('');
    const [_value2_2, set_value2_2] = useState('');
    const [_value3_2, set_value3_2] = useState('');
    const [_value4_2, set_value4_2] = useState('');
    const [_value5_2, set_value5_2] = useState('');
    const [_value6_2, set_value6_2] = useState('');
    const [_value7_2, set_value7_2] = useState('');
    const [_value8_2, set_value8_2] = useState('');

    const [_value0_3, set_value0_3] = useState('');
    const [_value1_3, set_value1_3] = useState('');
    const [_value2_3, set_value2_3] = useState('');
    const [_value3_3, set_value3_3] = useState('');
    const [_value4_3, set_value4_3] = useState('');
    const [_value5_3, set_value5_3] = useState('');
    const [_value6_3, set_value6_3] = useState('');
    const [_value7_3, set_value7_3] = useState('');
    const [_value8_3, set_value8_3] = useState('');
    const [_value9_3, set_value9_3] = useState('');
    const [_value10_3, set_value10_3] = useState('');
    const [_value11_3, set_value11_3] = useState('');
    const [_value12_3, set_value12_3] = useState('');
    const [_value13_3, set_value13_3] = useState('');
    const [_value14_3, set_value14_3] = useState('');
    const [_value15_3, set_value15_3] = useState('');


    const [_value0_4, set_value0_4] = useState('');
    const [_value1_4, set_value1_4] = useState('');
    const [_value2_4, set_value2_4] = useState('');
    const [_value3_4, set_value3_4] = useState('');
    const [_value4_4, set_value4_4] = useState('');
    const [_value5_4, set_value5_4] = useState('');
    const [_value6_4, set_value6_4] = useState('');
    const [_value7_4, set_value7_4] = useState('');
    const [_value8_4, set_value8_4] = useState('');
    const [_value9_4, set_value9_4] = useState('');

    const [_value0_5, set_value0_5] = useState('');
    const [_value1_5, set_value1_5] = useState('');
    const [_value2_5, set_value2_5] = useState('');
    const [_value3_5, set_value3_5] = useState('');
    const [_value4_5, set_value4_5] = useState('');
    const [_value5_5, set_value5_5] = useState('');


    const [_value0_6, set_value0_6] = useState('');
    const [_value1_6, set_value1_6] = useState('');
    const [_value2_6, set_value2_6] = useState('');
    const [_value3_6, set_value3_6] = useState('');
    const [_value4_6, set_value4_6] = useState('');
    const [_value5_6, set_value5_6] = useState('');
    const [_value6_6, set_value6_6] = useState('');
    const [_value7_6, set_value7_6] = useState('');
    const [_value8_6, set_value8_6] = useState('');
    const [_value9_6, set_value9_6] = useState('');
    const [_selectedPages, setSelectedPages] = useState(0);

    const [_loader2, set_loader2] = useState(0);

    const [_hitFilter, set_hitFilter] = useState(false);

    const handleClick = (type) => {
        setSelectedType(type);
        set_hitFilter(true);
    };

    const handleReset = () => {
        setSelectedType(null);
    };

    const handleMintClick = () => {
        setShowMintOptions(true);
    };

    const umi = useMemo(() =>
        createUmi(quicknodeEndpoint)
            .use(walletAdapterIdentity(wallet))
            .use(mplCandyMachine())
            .use(mplTokenMetadata()),
        [wallet, mplCandyMachine, walletAdapterIdentity, mplTokenMetadata, quicknodeEndpoint, createUmi]
    );

    /*    
    
    const publicMint = useCallback(async () => {
        if (!wallet.publicKey) {
            //console.log('error', 'Wallet not connected!');
            notify({ type: 'error', message: 'error', description: 'Wallet not connected!' });
            return;
        }


        // Fetch the Candy Machine.
        const candyMachine = await fetchCandyMachine(
            umi,
            candyMachineAddress,
        );
        // Fetch the Candy Guard.
        const candyGuard = await safeFetchCandyGuard(
            umi,
            candyMachine.mintAuthority,
        );



        // Fetch the Candy Guard.
        const itemsRedeemed = candyMachine.itemsRedeemed;
        //console.log("itemsRedeemed :" + itemsRedeemed);
        setItemsRedeemed(Number(itemsRedeemed));

        try {
            // Mint from the Candy Machine.
            const nftMint = generateSigner(umi);

            const nft = mintV2(umi, {
                candyMachine: candyMachine.publicKey,
                candyGuard: candyGuard?.publicKey,
                nftMint,
                collectionMint: candyMachine.collectionMint,
                collectionUpdateAuthority: candyMachine.authority,
                group: some('public'), // you have to mention the relevant group here

                mintArgs: {
                    solPayment: some({ destination: treasury }), //treasury is the destination address
                },
            });
            const transaction = await transactionBuilder()
                .add(setComputeUnitLimit(umi, { units: 800_000 }))
                .add(nft
                );
            const { signature } = await transaction.sendAndConfirm(umi, {
                confirm: { commitment: "confirmed" },
            });
            const txid = bs58.encode(signature);
            //console.log('success', `Mint successful! ${txid}`)
            notify({ type: 'success', message: 'Mint successful!', txid });


            //console.log("nft Details" + JSON.stringify(nft));

            const mintAddress = nftMint.publicKey;

            const mintAddressPublicKey = new PublicKey(mintAddress);

            // Create an object with the mintAddress property
            const findNftInput: FindNftByMintInput = {
                mintAddress: mintAddressPublicKey,
            };

            // Create a Metaplex instance
            const metaplex = new Metaplex(connection);

            // Fetch the NFT metadata
            const nftMetadata = await metaplex.nfts().findByMint(findNftInput);

            //console.log("nftMetadata : " + JSON.stringify(nftMetadata));

            const imageUrl = nftMetadata.json.image;
            setMintedImg(imageUrl);

            const imageID = nftMetadata.json.name;
            setImageID(imageID);

            //console.log("Image URL:", imageUrl);

            getUserSOLBalance(wallet.publicKey, connection);


        } catch (error: any) {
            notify({ type: 'error', message: `Error minting!`, description: error?.message });
            //console.log('error', `Mint failed! ${error?.message}`);
        }
    }, [wallet, connection, getUserSOLBalance, umi, candyMachineAddress, treasury]);

    */

    //.................................. Mint .......................................//

    const publicMint = useCallback(async () => {
        if (!wallet.publicKey) {
            //console.log('error', 'Wallet not connected!');
            notify({ type: 'error', message: 'error', description: 'Wallet not connected!' });
            return;
        }

        // Fetch the Candy Machine.
        const candyMachine = await fetchCandyMachine(
            umi,
            candyMachineAddress,
        );
        // Fetch the Candy Guard.
        const candyGuard = await safeFetchCandyGuard(
            umi,
            candyMachine.mintAuthority,
        );



        // Fetch the Candy Guard.
        const itemsRedeemed = candyMachine.itemsRedeemed;
        //console.log("itemsRedeemed :" + itemsRedeemed);
        setItemsRedeemed(Number(itemsRedeemed));

        try {
            // Mint from the Candy Machine.
            const nftMint = generateSigner(umi);

            const nft = mintV2(umi, {
                candyMachine: candyMachine.publicKey,
                candyGuard: candyGuard?.publicKey,
                nftMint,
                collectionMint: candyMachine.collectionMint,
                collectionUpdateAuthority: candyMachine.authority,
                group: some('public'), // you have to mention the relevant group here

                mintArgs: {
                    solPayment: some({ destination: treasury }), //treasury is the destination address
                },
            });
            const transaction = await transactionBuilder()
                .add(setComputeUnitLimit(umi, { units: 800_000 })

                    .add(nft));


            const { signature } = await transaction.sendAndConfirm(umi, {
                confirm: { commitment: "confirmed" },
            });
            const txid = bs58.encode(signature);
            //console.log('success', `Mint successful! ${txid}`)
            notify({ type: 'success', message: 'Mint successful!', txid });


            //console.log("nft Details" + JSON.stringify(nft));

            const mintAddress = nftMint.publicKey;

            const mintAddressPublicKey = new PublicKey(mintAddress);

            // Create an object with the mintAddress property
            const findNftInput: FindNftByMintInput = {
                mintAddress: mintAddressPublicKey,
            };

            // Create a Metaplex instance
            const metaplex = new Metaplex(connection);

            // Fetch the NFT metadata
            const nftMetadata = await metaplex.nfts().findByMint(findNftInput);

            //console.log("nftMetadata : " + JSON.stringify(nftMetadata));

            const imageUrl = nftMetadata.json.image;
            setMintedImg(imageUrl);

            const imageID = nftMetadata.json.name;
            setImageID(imageID);

            //console.log("Image URL:", imageUrl);

            getUserSOLBalance(wallet.publicKey, connection);


        } catch (error: any) {
            notify({ type: 'error', message: `Error minting!`, description: error?.message });
            //console.log('error', `Mint failed! ${error?.message}`);
        }
    }, [wallet, connection, getUserSOLBalance, umi, candyMachineAddress, treasury]);

    const WLMint = useCallback(async () => {
        if (!wallet.publicKey) {
            //console.log('error', 'Wallet not connected!');
            notify({ type: 'error', message: 'error', description: 'Wallet not connected!' });
            return;
        }

        try {
            // Fetch the Candy Machine.
            const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
            if (!candyMachine) {
                console.error('Candy Machine not found!');
                notify({ type: 'error', message: 'Candy Machine not found!' });
                return;
            }

            // Fetch the Candy Guard.
            const candyGuard = await safeFetchCandyGuard(umi, candyMachine.mintAuthority);
            if (!candyGuard) {
                console.error('Candy Guard is not initialized!');
                notify({ type: 'error', message: 'Candy Guard is not initialized!' });
                return;
            }

            // Pre-validate the wallet
            const root = getMerkleRoot(allowList);
            const proof = getMerkleProof(allowList, publicKey(umi.identity));

            //console.log("root : " + root);
            //console.log("proof : " + proof);
            //console.log("umi : " + (publicKey(umi.identity)));

            await route(umi, {
                candyMachine: candyMachine.publicKey,
                candyGuard: candyGuard.publicKey,
                group: some('wl'), // you have to mention the relevant group here
                guard: "allowList",
                routeArgs: {
                    path: "proof",
                    merkleRoot: root,
                    merkleProof: proof,
                },
            }).sendAndConfirm(umi);

            const rootHex = Buffer.from(root).toString('hex');
            //console.log('Root (hex): ' + rootHex);

            const itemsRedeemed = candyMachine.itemsRedeemed;
            //console.log("Items Redeemed: " + itemsRedeemed);
            setItemsRedeemed(Number(itemsRedeemed));

            // Mint from the Candy Machine.

            const nftMint = generateSigner(umi);
            const transaction = await transactionBuilder()
                .add(setComputeUnitLimit(umi, { units: 800_000 }))
                .add(
                    await mintV2(umi, {
                        candyMachine: candyMachine.publicKey,
                        candyGuard: candyGuard.publicKey,
                        nftMint,
                        collectionMint: candyMachine.collectionMint,
                        collectionUpdateAuthority: candyMachine.authority,
                        group: some('wl'), // you have to mention the relevant group here

                        mintArgs: {
                            allowList: some({ merkleRoot: root }),
                            mintLimit: some({ id: 1 }),
                        },
                    }));


            const { signature } = await transaction.sendAndConfirm(umi, {
                confirm: { commitment: "confirmed" },
            });
            const txid = bs58.encode(signature);
            //console.log('success', `Mint successful! ${txid}`)
            notify({ type: 'success', message: 'Mint successful!', txid });

            const mintAddress = nftMint.publicKey;

            const mintAddressPublicKey = new PublicKey(mintAddress);

            // Create an object with the mintAddress property
            const findNftInput: FindNftByMintInput = {
                mintAddress: mintAddressPublicKey,
            };

            // Create a Metaplex instance
            const metaplex = new Metaplex(connection);

            // Fetch the NFT metadata
            const nftMetadata = await metaplex.nfts().findByMint(findNftInput);

            //console.log("nftMetadata : " + JSON.stringify(nftMetadata));

            const imageUrl = nftMetadata.json.image;
            setMintedImg(imageUrl);

            const imageID = nftMetadata.json.name;
            setImageID(imageID);

            //console.log("Image URL:", imageUrl);



            getUserSOLBalance(wallet.publicKey, connection);


        } catch (error: any) {
            //console.log('error', 'An error occurred:', error);
            notify({ type: 'error', message: 'An error occurred!', description: error.message });
        }
    }, [wallet, umi, candyMachineAddress, allowList, setItemsRedeemed]);

    const WLMint2 = useCallback(async () => {
        if (!wallet.publicKey) {
            //console.log('error', 'Wallet not connected!');
            notify({ type: 'error', message: 'error', description: 'Wallet not connected!' });
            return;
        }

        try {
            // Fetch the Candy Machine.
            const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
            if (!candyMachine) {
                console.error('Candy Machine not found!');
                notify({ type: 'error', message: 'Candy Machine not found!' });
                return;
            }

            // Fetch the Candy Guard.
            const candyGuard = await safeFetchCandyGuard(umi, candyMachine.mintAuthority);
            if (!candyGuard) {
                console.error('Candy Guard is not initialized!');
                notify({ type: 'error', message: 'Candy Guard is not initialized!' });
                return;
            }

            // Pre-validate the wallet
            const root = getMerkleRoot(allowList2);
            const proof = getMerkleProof(allowList2, publicKey(umi.identity));

            //console.log("root : " + root);
            //console.log("proof : " + proof);
            //console.log("umi : " + (publicKey(umi.identity)));

            await route(umi, {
                candyMachine: candyMachine.publicKey,
                candyGuard: candyGuard.publicKey,
                group: some('wl2'), // you have to mention the relevant group here
                guard: "allowList",
                routeArgs: {
                    path: "proof",
                    merkleRoot: root,
                    merkleProof: proof,
                },
            }).sendAndConfirm(umi);

            const rootHex = Buffer.from(root).toString('hex');
            //console.log('Root (hex): ' + rootHex);

            const itemsRedeemed = candyMachine.itemsRedeemed;
            //console.log("Items Redeemed: " + itemsRedeemed);
            setItemsRedeemed(Number(itemsRedeemed));

            // Mint from the Candy Machine.

            const nftMint = generateSigner(umi);
            const transaction = await transactionBuilder()
                .add(setComputeUnitLimit(umi, { units: 800_000 }))
                .add(
                    await mintV2(umi, {
                        candyMachine: candyMachine.publicKey,
                        candyGuard: candyGuard.publicKey,
                        nftMint,
                        collectionMint: candyMachine.collectionMint,
                        collectionUpdateAuthority: candyMachine.authority,
                        group: some('wl2'), // you have to mention the relevant group here

                        mintArgs: {
                            allowList: some({ merkleRoot: root }),
                            mintLimit: some({ id: 2 }),
                        },
                    }));


            const { signature } = await transaction.sendAndConfirm(umi, {
                confirm: { commitment: "confirmed" },
            });
            const txid = bs58.encode(signature);
            //console.log('success', `Mint successful! ${txid}`)
            notify({ type: 'success', message: 'Mint successful!', txid });

            const mintAddress = nftMint.publicKey;

            const mintAddressPublicKey = new PublicKey(mintAddress);

            // Create an object with the mintAddress property
            const findNftInput: FindNftByMintInput = {
                mintAddress: mintAddressPublicKey,
            };

            // Create a Metaplex instance
            const metaplex = new Metaplex(connection);

            // Fetch the NFT metadata
            const nftMetadata = await metaplex.nfts().findByMint(findNftInput);

            //console.log("nftMetadata : " + JSON.stringify(nftMetadata));

            const imageUrl = nftMetadata.json.image;
            setMintedImg(imageUrl);

            const imageID = nftMetadata.json.name;
            setImageID(imageID);

            //console.log("Image URL:", imageUrl);



            getUserSOLBalance(wallet.publicKey, connection);


        } catch (error: any) {
            //console.log('error', 'An error occurred:', error);
            notify({ type: 'error', message: 'An error occurred!', description: error.message });
        }
    }, [wallet, umi, candyMachineAddress, allowList2, setItemsRedeemed]);

    const WLMint3 = useCallback(async () => {
        if (!wallet.publicKey) {
            //console.log('error', 'Wallet not connected!');
            notify({ type: 'error', message: 'error', description: 'Wallet not connected!' });
            return;
        }

        try {
            // Fetch the Candy Machine.
            const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
            if (!candyMachine) {
                console.error('Candy Machine not found!');
                notify({ type: 'error', message: 'Candy Machine not found!' });
                return;
            }

            // Fetch the Candy Guard.
            const candyGuard = await safeFetchCandyGuard(umi, candyMachine.mintAuthority);
            if (!candyGuard) {
                console.error('Candy Guard is not initialized!');
                notify({ type: 'error', message: 'Candy Guard is not initialized!' });
                return;
            }

            // Pre-validate the wallet
            const root = getMerkleRoot(allowList3);
            const proof = getMerkleProof(allowList3, publicKey(umi.identity));

            //console.log("root : " + root);
            //console.log("proof : " + proof);
            //console.log("umi : " + (publicKey(umi.identity)));

            await route(umi, {
                candyMachine: candyMachine.publicKey,
                candyGuard: candyGuard.publicKey,
                group: some('wl3'), // you have to mention the relevant group here
                guard: "allowList",
                routeArgs: {
                    path: "proof",
                    merkleRoot: root,
                    merkleProof: proof,
                },
            }).sendAndConfirm(umi);

            const rootHex = Buffer.from(root).toString('hex');
            //console.log('Root (hex): ' + rootHex);

            const itemsRedeemed = candyMachine.itemsRedeemed;
            //console.log("Items Redeemed: " + itemsRedeemed);
            setItemsRedeemed(Number(itemsRedeemed));

            // Mint from the Candy Machine.

            const nftMint = generateSigner(umi);
            const transaction = await transactionBuilder()
                .add(setComputeUnitLimit(umi, { units: 800_000 }))
                .add(
                    await mintV2(umi, {
                        candyMachine: candyMachine.publicKey,
                        candyGuard: candyGuard.publicKey,
                        nftMint,
                        collectionMint: candyMachine.collectionMint,
                        collectionUpdateAuthority: candyMachine.authority,
                        group: some('wl3'), // you have to mention the relevant group here

                        mintArgs: {
                            allowList: some({ merkleRoot: root }),
                            mintLimit: some({ id: 3 }),
                        },
                    }));


            const { signature } = await transaction.sendAndConfirm(umi, {
                confirm: { commitment: "confirmed" },
            });
            const txid = bs58.encode(signature);
            //console.log('success', `Mint successful! ${txid}`)
            notify({ type: 'success', message: 'Mint successful!', txid });

            const mintAddress = nftMint.publicKey;

            const mintAddressPublicKey = new PublicKey(mintAddress);

            // Create an object with the mintAddress property
            const findNftInput: FindNftByMintInput = {
                mintAddress: mintAddressPublicKey,
            };

            // Create a Metaplex instance
            const metaplex = new Metaplex(connection);

            // Fetch the NFT metadata
            const nftMetadata = await metaplex.nfts().findByMint(findNftInput);

            //console.log("nftMetadata : " + JSON.stringify(nftMetadata));

            const imageUrl = nftMetadata.json.image;
            setMintedImg(imageUrl);

            const imageID = nftMetadata.json.name;
            setImageID(imageID);

            //console.log("Image URL:", imageUrl);



            getUserSOLBalance(wallet.publicKey, connection);


        } catch (error: any) {
            //console.log('error', 'An error occurred:', error);
            notify({ type: 'error', message: 'An error occurred!', description: error.message });
        }
    }, [wallet, umi, candyMachineAddress, allowList3, setItemsRedeemed]);

    //....................................................................................//

    async function candyTime() {
        // Fetch the Candy Machine.
        const candyMachine = await fetchCandyMachine(
            umi,
            candyMachineAddress,
        );

        // Fetch the Candy Guard.

        const itemsAvailable = candyMachine.itemsLoaded;
        setTotalSupply(Number(itemsAvailable));

        const itemsRedeemed = candyMachine.itemsRedeemed;
        //console.log("itemsRedeemed :" + itemsRedeemed);
        setItemsRedeemed(Number(itemsRedeemed));

        const mintAuthority = candyMachine.mintAuthority;
        //console.log("mintAuthority :" + mintAuthority);
        // setMintAuthority(mintAuthority);

        const authority = candyMachine.authority;
        //console.log("authority :" + authority);
        // setMintAuthority(mintAuthority);

        /*for (let x = 0; x < 10; x++) {
             //console.log("candyMachine.items :" + JSON.stringify(candyMachine.items[x]));
         }*/

        // Fetch the Candy Guard.
        const candyGuard = await safeFetchCandyGuard(
            umi,
            candyMachine.mintAuthority,
        );

        //console.log("SOL Payment :" + (candyGuard.guards.solPayment.__option));

    }

    async function collection(pageNo) {
        console.log("Current Page No : " + pageNo);


        const candyMachine = await fetchCandyMachine(
            umi,
            candyMachineAddress,
        );

        setActivePage(pageNo);

        // Fetch the Candy Guard.

        const itemsAvailable = candyMachine.itemsLoaded;
        setTotalSupply(Number(itemsAvailable));

        const itemsRedeemed = candyMachine.itemsRedeemed;
        //console.log("itemsRedeemed :" + itemsRedeemed);
        setItemsRedeemed(Number(itemsRedeemed));

        const mintAuthority = candyMachine.mintAuthority;
        //console.log("mintAuthority :" + mintAuthority);
        // setMintAuthority(mintAuthority);

        const authority = candyMachine.authority;
        //console.log("authority :" + authority);
        // setMintAuthority(mintAuthority);

        if (wallet.publicKey && connection) {
            const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
            let itemDataArray: ItemData[] = [];
            let selectedDataArray: ItemData[] = [];



            let y = 25;
            let o = ((pageNo - 1) * y);

            let loaded = 0;
            let selected = 0;
            let percentage = 0;
            let totalRunner = 0;
            let selectedPages = 0;

            if (_hitFilter) {


                //    for (let x = o; x < candyMachine.items.length && x < pageNo * y; x++) {
                for (let x = 0; x < candyMachine.items.length; x++) {
                    set_loader2(1);

                    var imageURL = await allImgs(candyMachine.items[x].uri);

                    const response = await fetch(candyMachine.items[x].uri);
                    const data = await response.json();


                    if (

                        //type 1

                        (

                            (_value0_1 == '' && _value1_1 == '' && _value2_1 == '' && _value3_1 == '' && _value4_1 == '' && _value5_1 == '' && _value6_1 == '' && _value7_1 == '' && _value8_1 == '') ||
                            (
                                data.attributes[0].value == _value0_1 ||
                                data.attributes[0].value == _value1_1 ||
                                data.attributes[0].value == _value2_1 ||
                                data.attributes[0].value == _value3_1 ||
                                data.attributes[0].value == _value4_1 ||
                                data.attributes[0].value == _value5_1 ||
                                data.attributes[0].value == _value6_1 ||
                                data.attributes[0].value == _value7_1 ||
                                data.attributes[0].value == _value8_1
                            )
                        ) &&
                        (
                            (_value0_2 == '' && _value1_2 == '' && _value2_2 == '' && _value3_2 == '' && _value4_2 == '') ||
                            (
                                data.attributes[1].value == _value0_2 ||
                                data.attributes[1].value == _value1_2 ||
                                data.attributes[1].value == _value2_2 ||
                                data.attributes[1].value == _value3_2 ||
                                data.attributes[1].value == _value4_2
                            )
                        ) &&
                        (
                            (_value0_3 == '' && _value1_3 == '' && _value2_3 == ''
                                && _value3_3 == '' && _value4_3 == '' && _value5_3 == ''
                                && _value6_3 == '' && _value7_3 == '' && _value8_3 == '' && _value9_3 == ''
                            ) ||

                            (data.attributes[2].value == _value0_3 ||
                                data.attributes[2].value == _value1_3 ||
                                data.attributes[2].value == _value2_3 ||
                                data.attributes[2].value == _value3_3 ||
                                data.attributes[2].value == _value4_3 ||
                                data.attributes[2].value == _value5_3 ||
                                data.attributes[2].value == _value6_3 ||
                                data.attributes[2].value == _value7_3 ||
                                data.attributes[2].value == _value8_3 ||
                                data.attributes[2].value == _value9_3
                            )
                        ) &&
                        (
                            (_value0_4 == '' && _value1_4 == '' && _value2_4 == ''
                                && _value3_4 == '' && _value4_4 == '' && _value5_4 == ''
                                && _value6_4 == '' && _value7_4 == '' && _value8_4 == '' && _value9_4 == ''
                            ) ||

                            (data.attributes[3].value == _value0_4 ||
                                data.attributes[3].value == _value1_4 ||
                                data.attributes[3].value == _value2_4 ||
                                data.attributes[3].value == _value3_4 ||
                                data.attributes[3].value == _value4_4 ||
                                data.attributes[3].value == _value5_4 ||
                                data.attributes[3].value == _value6_4 ||
                                data.attributes[3].value == _value7_4 ||
                                data.attributes[3].value == _value8_4 ||
                                data.attributes[3].value == _value9_4
                            )
                        ) && (candyMachine.items[x].minted)

                    ) {
                        set_loader2(1);

                        selected++;
                        selectedPages = selected / 25;
                        setSelectedPages(selectedPages);

                        console.log("selectedPages : " + selectedPages);
                        console.log("selected : " + selected);

                        itemDataArray.push({
                            name: candyMachine.items[x].name,
                            uri: imageURL
                        });


                        if (selected > ((pageNo - 1) * 25) && selected <= (pageNo * 25)) {

                            selectedDataArray.push({
                                name: candyMachine.items[x].name,
                                uri: imageURL
                            });

                            loaded++;

                            percentage = ((loaded * 4));
                            //console.log("percentage : " + percentage);
                            setLoaded(percentage);

                            setItemDatas(selectedDataArray);

                        }

                        if (selected >= (_pageNo * 25) && percentage >= 100) {
                            set_loader2(0);
                            // break;                        

                        }

                    } else {

                        y++;

                    }

                    totalRunner++;

                    if (totalRunner == 5100) {
                        set_loader2(0);
                        //setDataSource(itemDataArray);
                        break;
                    }

                }

            } else {
                for (let x = o; x < candyMachine.items.length && x < pageNo * 25; x++) {
                    set_loader(1);

                    loaded++;
                    percentage = loaded * 4;
                    //console.log("percentage : " + percentage);
                    setLoaded(percentage);

                    var imageURL = await allImgs(candyMachine.items[x].uri);
                    ////console.log("INSIDE :" + imageURL);

                    const response = await fetch(candyMachine.items[x].uri);
                    const data = await response.json();
                    ////console.log("data.attributes.length : " + data.attributes.length);
                    //console.log("URI : " + response);
                    var notUrl = 'https://witch-8vg.pages.dev/imgs/witch.jpg';
                    //console.log("value_to Check : " + data.attributes[0].value);

                    itemDataArray.push({
                        name: candyMachine.items[x].name,
                        uri: candyMachine.items[x].minted ?

                            imageURL
                            : notUrl,
                    });


                }

                setItemDatas(itemDataArray);

            }

            set_loader(0);
            setLoaded(0);


        }

        //console.log(`Collection function called with page number: ${pageNo}`);


    }


    async function allImgs(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            //  //console.log("ALL : " + data.image);

            return data.image;

        } catch (error) {
            console.error('Error:', error);
            throw error; // re-throw the error so that the caller can handle it if needed
        }
    }

    useEffect(() => {

        setShowWL1(false);
        setShowWL2(false);
        setShowWL3(false);

        if (wallet.publicKey) {

            //console.log(wallet.publicKey.toBase58())
            getUserSOLBalance(wallet.publicKey, connection);
            console.log("allowList.length : " + allowList.length);
            for (let x = 0; x < allowList.length; x++) {
                console.log("allowList1[x] : " + allowList[x]);
                if (allowList[x] == wallet.publicKey.toBase58()) {
                    setShowWL1(true);
                    //console.log("WL:1 Eligible");
                }
            }

            for (let x = 0; x < allowList2.length; x++) {
                console.log("allowList2[x] : " + allowList2[x]);
                if (allowList2[x] == wallet.publicKey.toBase58()) {
                    setShowWL2(true);
                    //console.log("WL:2 Eligible");
                }
            }

            for (let x = 0; x < allowList3.length; x++) {
                console.log("allowList3[x] : " + allowList3[x]);
                if (allowList3[x] == wallet.publicKey.toBase58()) {
                    setShowWL3(true);
                    //console.log("WL:3 Eligible");
                }
            }

            candyTime();
        }

        collection(_pageNo);
        console.log("_o" + _o);



    }, [wallet.publicKey, connection, getUserSOLBalance, _showWL1, _showWL2, _showWL3, _pageNo])

    const pageIndexer = () => {
        let pageIndexes = [];

        if (!_hitFilter) {

            for (let x = _o; x < 10 + Number(_o); x++) {
                const pageNum = x + 1;
                pageIndexes.push(
                    <div
                        key={x}
                        onClick={() => collection(pageNum)}
                        className={pageNum === activePage ? 'EachNumber active' : 'EachNumber'}
                    >
                        {pageNum}
                    </div>
                );
            }
        } else {

            var i = 0;

            if (Number(_selectedPages) > 10) {
                i = 10;
            } else {
                i = Number(_selectedPages);
            }
            for (let x = _o; x < (i + Number(_o)); x++) {
                const pageNum = x + 1;
                pageIndexes.push(
                    <div
                        key={x}
                        onClick={() => collection(pageNum)}
                        className={pageNum === activePage ? 'EachNumber active' : 'EachNumber'}
                    >
                        {pageNum}
                    </div>
                );
            }
        }
        return pageIndexes;
    }

    const pageIndexer2 = () => {
        let pageIndexes = [];

        for (let x = _o; x < 4 + Number(_o); x++) {
            const pageNum = x + 1;
            pageIndexes.push(
                <div
                    key={x}
                    onClick={() => collection(pageNum)}
                    className={pageNum === activePage ? 'EachNumber active' : 'EachNumber'}
                >
                    {pageNum}
                </div>
            );
        }
        return pageIndexes;
    };



    const arrowClicked = () => {

        if (_hitFilter) {
            var count = Number(_o) + 10;
            if (Number(_selectedPages) >= count) {
                setO(Number(_o) + 10);

            }
        } else {
            var count = Number(_o) + 10;
            if (count < 191) {
                setO(Number(_o) + 10);
            }
        }



    }



    const arrowLast = () => {


        setO(191);
    }

    const arrowFirst = () => {


        setO(0);
    }

    const arrowPrevious = () => {

        var count = Number(_o) - 10;
        if (count >= 0) {
            setO(Number(_o) - 10);
        }
    }

    //EYES

    const eyes0 = () => {
        set_value0_1("sleepy");
    }

    const eyes1 = () => {
        set_value1_1("out");
    }

    const eyes2 = () => {
        set_value2_1("cloudy");
    }

    const eyes3 = () => {
        set_value3_1("angry");
    }

    const eyes4 = () => {
        set_value4_1("hypnotised");
    }

    const eyes5 = () => {
        set_value5_1("ethereum");
    }

    const eyes6 = () => {
        set_value6_1("sunglasses ");
    }

    const eyes7 = () => {
        set_value7_1("laser beam");
    }

    const eyes8 = () => {
        set_value8_1("laughing");
    }


    const _eyes0 = () => {
        set_value0_1("");
    }

    const _eyes1 = () => {
        set_value1_1("");
    }

    const _eyes2 = () => {
        set_value2_1("");
    }

    const _eyes3 = () => {
        set_value3_1("");
    }

    const _eyes4 = () => {
        set_value4_1("");
    }

    const _eyes5 = () => {
        set_value5_1("");
    }

    const _eyes6 = () => {
        set_value6_1("");
    }

    const _eyes7 = () => {
        set_value7_1("");
    }


    const _eyes8 = () => {
        set_value8_1("");
    }

    //MOUTH

    const mouth0 = () => {
        set_value0_2("candy");
    }

    const mouth1 = () => {
        set_value1_2("Zip");
    }

    const mouth2 = () => {
        set_value2_2("whistle");
    }

    const mouth3 = () => {
        set_value3_2("cigar");
    }

    const mouth4 = () => {
        set_value4_2("balloon");
    }

    const _mouth0 = () => {
        set_value0_2("");
    }

    const _mouth1 = () => {
        set_value1_2("");
    }

    const _mouth2 = () => {
        set_value2_2("");
    }

    const _mouth3 = () => {
        set_value3_2("");
    }

    const _mouth4 = () => {
        set_value4_2("");
    }


    //HAT

    const hat0 = () => {
        set_value0_3("witch");
    }

    const hat1 = () => {
        set_value1_3("top");
    }

    const hat2 = () => {
        set_value2_3("sailor");
    }

    const hat3 = () => {
        set_value3_3("army");
    }

    const hat4 = () => {
        set_value4_3("pilot");
    }

    const hat5 = () => {
        set_value5_3("viking");
    }

    const hat6 = () => {
        set_value6_3("captain");
    }

    const hat7 = () => {
        set_value7_3("spider");
    }

    const hat8 = () => {
        set_value8_3("police");
    }

    const hat9 = () => {
        set_value9_3("cowboy");
    }


    /////

    const _hat0 = () => {
        set_value0_3("");
    }

    const _hat1 = () => {
        set_value1_3("");
    }

    const _hat2 = () => {
        set_value2_3("");
    }

    const _hat3 = () => {
        set_value3_3("");
    }

    const _hat4 = () => {
        set_value4_3("");
    }

    const _hat5 = () => {
        set_value5_3("");
    }

    const _hat6 = () => {
        set_value6_3("");
    }

    const _hat7 = () => {
        set_value7_3("");
    }

    const _hat8 = () => {
        set_value8_3("");
    }

    const _hat9 = () => {
        set_value9_3("");
    }

    //COLOR

    const Color0 = () => {
        set_value0_4("green");
    }

    const Color1 = () => {
        set_value1_4("blue");
    }

    const Color2 = () => {
        set_value2_4("yellow");
    }

    const Color3 = () => {
        set_value3_4("red");
    }

    const Color4 = () => {
        set_value4_4("orange");
    }

    const Color5 = () => {
        set_value5_4("violet");
    }

    const Color6 = () => {
        set_value6_4("nude");
    }

    const Color7 = () => {
        set_value7_4("brown");
    }

    const Color8 = () => {
        set_value8_4("pink");
    }

    const Color9 = () => {
        set_value9_4("grey");
    }


    const _Color0 = () => {
        set_value0_4("");
    }

    const _Color1 = () => {
        set_value1_4("");
    }

    const _Color2 = () => {
        set_value2_4("");
    }

    const _Color3 = () => {
        set_value3_4("");
    }

    const _Color4 = () => {
        set_value4_4("");
    }

    const _Color5 = () => {
        set_value5_4("");
    }

    const _Color6 = () => {
        set_value6_4("");
    }

    const _Color7 = () => {
        set_value7_4("");
    }

    const _Color8 = () => {
        set_value8_4("");
    }

    const _Color9 = () => {
        set_value9_4("");
    }

    return (

        <div className="mintDetails">

            <div>
                <div id='price'>Minted {_itemsRedeemed}/5100</div>
                <div id='price'><span className='price2'>Price: 0.01 SOL</span></div>
                {_showWL1 ?
                    <div id='price'><span className='price2'>Special Mint Limit - 1</span></div> :
                    null}

                {_showWL2 ?
                    <div id='price'><span className='price2'>Special Mint Limit - 5</span></div> :
                    null}

                {_showWL3 ?
                    <div id='price'><span className='price2'>Special Mint Limit - 250</span></div> :
                    null}


                <p></p>

                <div className='btns3'>
                    <button className='gradient-button' onClick={publicMint}>Public Mint</button>

                    {_showWL1 ?

                        <button className='gradient-button' onClick={WLMint}>Special Mint 1</button> :
                        null}

                    {_showWL2 ?
                        <button className='gradient-button' onClick={WLMint2}>Special Mint 2</button> :
                        null}

                    {_showWL3 ?
                        <button className='gradient-button' onClick={WLMint3}>Special Mint 3</button> :
                        null}

                </div>

                {mintedImg ?
                    <div className='mintSection'>
                        <div className='idAmount'>{imageID}</div>
                        <img src={mintedImg} className='mintedNFT' alt="NFT Image" />
                    </div> : null}

                <Footer2 />

                <div className='imgs2Main'>
                    <img className='witch1' src='https://imgswitch.pages.dev/imgs/1.png' />
                    <img className='witch2' src='https://imgswitch.pages.dev/imgs/2.png' />
                </div>

                {wallet.publicKey ?
                    <div>

                        <div className='typesMain'>
                            {selectedType === null ? (
                                <>
                                    <button onClick={() => handleClick('type1')}>Eyes</button>
                                    <button onClick={() => handleClick('type2')}>Mouth</button>
                                    <button onClick={() => handleClick('type3')}>Hat</button>
                                    <button onClick={() => handleClick('type4')}>Color</button>
                                </>
                            ) : (
                                <>
                                    {selectedType === 'type1' && (
                                        <div className='typesMain2'>
                                            <button onClick={() => handleClick('type1')}>Eyes</button>
                                            <div className='valuesDiv'>

                                                {_value0_1 === '' ?
                                                    (<div onClick={eyes0}>Sleepy</div>) : (<div onClick={_eyes0} id='selectedT'>✔ Sleepy</div>)}

                                                {_value1_1 === '' ?
                                                    (<div onClick={eyes1}>Out</div>) : (<div onClick={_eyes1} id='selectedT'>✔ Out</div>)}

                                                {_value2_1 === '' ?
                                                    (<div onClick={eyes2}>Cloudy</div>) : (<div onClick={_eyes2} id='selectedT'>✔ Cloudy</div>)}

                                                {_value3_1 === '' ?
                                                    (<div onClick={eyes3}>Angry</div>) : (<div onClick={_eyes3} id='selectedT'>✔ Angry</div>)}

                                                {_value4_1 === '' ?
                                                    (<div onClick={eyes4}>Hypnotised</div>) : (<div onClick={_eyes4} id='selectedT'>✔ Hypnotised</div>)}

                                                {_value5_1 === '' ?
                                                    (<div onClick={eyes5}>Ethereum</div>) : (<div onClick={_eyes5} id='selectedT'>✔ Ethereum</div>)}

                                                {_value6_1 === '' ?
                                                    (<div onClick={eyes6}>Sunglasses</div>) : (<div onClick={_eyes6} id='selectedT'>✔ Sunglasses</div>)}

                                                {_value7_1 === '' ?
                                                    (<div onClick={eyes7}>Laser beam</div>) : (<div onClick={_eyes7} id='selectedT'>✔ Laser beam</div>)}

                                                {_value8_1 === '' ?
                                                    (<div onClick={eyes8}>Laughing</div>) : (<div onClick={_eyes8} id='selectedT'>✔ Laughing</div>)}

                                            </div>

                                            <div className='apply' onClick={() => collection(_pageNo)}>Apply</div>

                                        </div>
                                    )}
                                    {selectedType === 'type2' && (
                                        <div className='typesMain2'>
                                            <button onClick={() => handleClick('type2')}>Mouth</button>
                                            <div className='valuesDiv'>

                                                {_value0_2 === '' ?
                                                    (<div onClick={mouth0}>Candy</div>) : (<div onClick={_mouth0} id='selectedT'>✔ Candy</div>)}

                                                {_value1_2 === '' ?
                                                    (<div onClick={mouth1}>Zip</div>) : (<div onClick={_mouth1} id='selectedT'>✔ Zip</div>)}

                                                {_value2_2 === '' ?
                                                    (<div onClick={mouth2}>Whistle</div>) : (<div onClick={_mouth2} id='selectedT'>✔ Whistle</div>)}

                                                {_value3_2 === '' ?
                                                    (<div onClick={mouth3}>Cigar</div>) : (<div onClick={_mouth3} id='selectedT'>✔ Cigar</div>)}

                                                {_value4_2 === '' ?
                                                    (<div onClick={mouth4}>Balloon</div>) : (<div onClick={_mouth4} id='selectedT'>✔ Balloon</div>)}

                                            </div>
                                            <div className='apply' onClick={() => collection(_pageNo)}>Apply</div>

                                        </div>
                                    )}
                                    {selectedType === 'type3' && (
                                        <div className='typesMain2'>
                                            <button onClick={() => handleClick('type3')}>Hat</button>
                                            <div className='valuesDiv'>

                                                {_value0_3 === '' ?
                                                    (<div onClick={hat0}>Witch</div>) : (<div onClick={_hat0} id='selectedT'>✔ Witch</div>)}

                                                {_value1_3 === '' ?
                                                    (<div onClick={hat1}>Top</div>) : (<div onClick={_hat1} id='selectedT'>✔ Top</div>)}

                                                {_value2_3 === '' ?
                                                    (<div onClick={hat2}>Sailor</div>) : (<div onClick={_hat2} id='selectedT'>✔ Sailor</div>)}

                                                {_value3_3 === '' ?
                                                    (<div onClick={hat3}>Army</div>) : (<div onClick={_hat3} id='selectedT'>✔ Army</div>)}

                                                {_value4_3 === '' ?
                                                    (<div onClick={hat4}>Pilot</div>) : (<div onClick={_hat4} id='selectedT'>✔ Pilot</div>)}

                                                {_value5_3 === '' ?
                                                    (<div onClick={hat5}>Viking</div>) : (<div onClick={_hat5} id='selectedT'>✔ Viking</div>)}

                                                {_value6_3 === '' ?
                                                    (<div onClick={hat6}>Captain</div>) : (<div onClick={_hat6} id='selectedT'>✔ Captain</div>)}

                                                {_value7_3 === '' ?
                                                    (<div onClick={hat7}>Spider</div>) : (<div onClick={_hat7} id='selectedT'>✔ Spider</div>)}

                                                {_value8_3 === '' ?
                                                    (<div onClick={hat8}>Police</div>) : (<div onClick={_hat8} id='selectedT'>✔ Police</div>)}

                                                {_value9_3 === '' ?
                                                    (<div onClick={hat9}>Cowboy</div>) : (<div onClick={_hat9} id='selectedT'>✔ Cowboy</div>)}

                                            </div>
                                            <div className='apply' onClick={() => collection(_pageNo)}>Apply</div>
                                        </div>
                                    )}
                                    {selectedType === 'type4' && (
                                        <div className='typesMain2'>
                                            <button onClick={() => handleClick('type4')}>Color</button>
                                            <div className='valuesDiv'>

                                                {_value0_4 === '' ?
                                                    (<div onClick={Color0}>Green</div>) : (<div onClick={_Color0} id='selectedT'>✔ Green</div>)}

                                                {_value1_4 === '' ?
                                                    (<div onClick={Color1}>Blue</div>) : (<div onClick={_Color1} id='selectedT'>✔ Blue</div>)}

                                                {_value2_4 === '' ?
                                                    (<div onClick={Color2}>Yellow</div>) : (<div onClick={_Color2} id='selectedT'>✔ Yellow</div>)}

                                                {_value3_4 === '' ?
                                                    (<div onClick={Color3}>Red</div>) : (<div onClick={_Color3} id='selectedT'>✔ Red</div>)}

                                                {_value4_4 === '' ?
                                                    (<div onClick={Color4}>Orange</div>) : (<div onClick={_Color4} id='selectedT'>✔ Orange</div>)}


                                                {_value5_4 === '' ?
                                                    (<div onClick={Color5}>Violet</div>) : (<div onClick={_Color5} id='selectedT'>✔ Violet</div>)}


                                                {_value6_4 === '' ?
                                                    (<div onClick={Color6}>Nude</div>) : (<div onClick={_Color6} id='selectedT'>✔ Nude</div>)}


                                                {_value7_4 === '' ?
                                                    (<div onClick={Color7}>Brown</div>) : (<div onClick={_Color7} id='selectedT'>✔ Brown</div>)}


                                                {_value8_4 === '' ?
                                                    (<div onClick={Color8}>Pink</div>) : (<div onClick={_Color8} id='selectedT'>✔ Pink</div>)}


                                                {_value9_4 === '' ?
                                                    (<div onClick={Color9}>Grey</div>) : (<div onClick={_Color9} id='selectedT'>✔ Grey</div>)}

                                            </div>
                                            <div className='apply' onClick={() => collection(_pageNo)}>Apply</div>

                                        </div>
                                    )}

                                    <div id="closeCategory" onClick={handleReset}>✖</div>
                                </>
                            )}
                        </div>

                        {_loader > 0 ?

                            <div className="page-loader-main">
                                <img className="loader" src="https://witch-8vg.pages.dev/imgs/witch.jpg" />
                                <div className="loadTxt">LOADING NFTs</div>
                                <div className='loadTxt2'>{_loaded} %</div>
                            </div> :
                            <div className="mintDetails">
                                {/* existing JSX */}
                                <div className='eachImgMain'>
                                    {itemDatas.map((data, index) => (
                                        <div className='eachImg' key={index}>
                                            <img src={data.uri} />
                                            <p>{data.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        }

                        {_loader2 > 0 ?
                            (<div className="loader2"></div>) : null}

                        <div className='pageNum'>

                            {!_hitFilter ?
                                <button onClick={() => arrowFirst()} className='arrowFL'>First</button> : null}
                            <button onClick={() => arrowPrevious()} className='EachNumber2'>Previous</button>

                            <div className='pI'>{pageIndexer()}</div>
                            <div className='pIMob'>{pageIndexer2()}</div>
                            <button onClick={() => arrowClicked()} className='EachNumber2'>Next</button>

                            {!_hitFilter ?
                                <button onClick={() => arrowLast()} className='arrowFL'>Last</button> : null}
                        </div>

                    </div> : null}
            </div>



        </div>

    );
};

