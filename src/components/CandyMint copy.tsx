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
import dynamic from 'next/dynamic';

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

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
)

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
    const [selectedType, setSelectedType] = useState(null);

    const [_loader2, set_loader2] = useState(0);

    const [_hitFilter, set_hitFilter] = useState(false);

    const [copyAlert, setCopyAlert] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopyAlert(true);
        setTimeout(() => setCopyAlert(false), 2000);
    };

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
            //   let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
            //  console.log("blockhash : " + blockhash);

            const bytesCreated = transactionBuilder().getBytesCreatedOnChain();
            console.log('Bytes created:', bytesCreated);

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




            //..............................
            // Build the transaction with the latest blockhash
            const transaction = await transactionBuilder()
                .add(setComputeUnitLimit(umi, { units: 800_000 })
                    .add(nft));

            transaction.setBlockhash(transaction.getBlockhash());

            const { signature } = await transaction.sendAndConfirm(umi, {
                confirm: { commitment: "confirmed" },
            });




            //....................


            // const txid = bs58.encode(signature);
            // console.log('success', `Mint successful! ${txid}`)
            //  notify({ type: 'success', message: 'Mint successful!', txid });


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
            console.log('error', `Mint failed! ${error?.message}`);
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

            console.log("candyMachine.collectionMint," + candyMachine.collectionMint);

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
                group: some('om'), // you have to mention the relevant group here
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
                        group: some('om'), // you have to mention the relevant group here

                        mintArgs: {
                            allowList: some({ merkleRoot: root }),
                            //mintLimit: some({ id: 1 }),
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

    // Memoized styles
    const walletButtonStyle = useMemo(() => ({
        backgroundColor: 'white',
        color: 'black',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        border: '1px solid #e5e7eb'
    }), []);

    return (

        <div className="mintDetails">

            <div className="mint-info" id="colorH4">
                <span id='txtColor'>Minted {_itemsRedeemed}/1000</span>
                <span id='txtColor2'>Price: 0.75 SOL</span>
            </div>


            <div className="wallet-button-container" id="wallet">
                <WalletMultiButtonDynamic style={walletButtonStyle} />
            </div>

            {wallet.connected && (
                <button className='mint-button' id="wallet" onClick={publicMint}>Public Mint</button>
            )}
            {_showWL1 ?

                <button className='mint-button' id="wallet2" onClick={WLMint}>Whitelist Mint</button> :
                null}

            {mintedImg && (
                <div className='mintSection'>
                    <div
                        className='idAmount'
                        onClick={() => handleCopy(imageID)}
                        title="Click to copy"
                    >
                        Minted ID:<br />
                        {imageID.substring(0, 4)}...{imageID.substring(imageID.length - 6)}
                    </div>
                    {copyAlert && (
                        <div className='copyAlert'>
                            Copied!
                        </div>
                    )}
                    <a
                        href={`https://solana.fm/address/${imageID}/transactions?cluster=mainnet-alpha`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                    >
                        <img
                            src={mintedImg}
                            className='mintedNFT'
                            alt="NFT Image"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://placehold.co/200x200?text=NFT+Image';
                            }}
                        />
                    </a>
                </div>
            )}

        </div>


    );
};

