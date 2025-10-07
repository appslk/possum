import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, TransactionSignature } from "@solana/web3.js";
import { FC, useCallback, useMemo, useState, useEffect } from "react";
import useUserSOLBalanceStore from "../stores/useUserSOLBalanceStore";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  transactionBuilder,
  publicKey,
  some,
} from "@metaplex-foundation/umi";
import {
  TokenPaymentMintArgs,
  fetchCandyMachine,
  mintV2,
  mplCandyMachine,
  route,
  safeFetchCandyGuard,
} from "@metaplex-foundation/mpl-candy-machine";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  fetchMetadata,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import * as bs58 from "bs58";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import {
  getMerkleProof,
  getMerkleRoot,
} from "@metaplex-foundation/mpl-candy-machine";
import axios from "axios";
import { FindNftByMintInput, Metaplex } from "@metaplex-foundation/js";
import { url } from "inspector";
import { Footer2 } from "./Footer2";
import { Console } from "console";
import dynamic from "next/dynamic";

const quicknodeEndpoint =
  process.env.NEXT_PUBLIC_RPC; /* || clusterApiUrl('devnet')*/
const candyMachineAddress = publicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID);
const treasury = publicKey(process.env.NEXT_PUBLIC_TREASURY);
const allowList = process.env.NEXT_PUBLIC_ALLOWLIST.split(",");
const allowList2 = process.env.NEXT_PUBLIC_ALLOWLIST2.split(",");
const allowList3 = process.env.NEXT_PUBLIC_ALLOWLIST3.split(",");

interface ItemData {
  name?: string;
  uri?: string;
}

// Custom notification types
type NotificationType = "success" | "error" | "info" | "loading";

interface NotificationState {
  visible: boolean;
  message: string;
  type: NotificationType;
  txid?: string;
}

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const CandyMint: FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { getUserSOLBalance } = useUserSOLBalanceStore();
  const [_itemsRedeemed, setItemsRedeemed] = useState(0);
  const [_itemsLoaded, setTotalSupply] = useState(0);
  const [showMintOptions, setShowMintOptions] = useState(false);
  const [mintedImg, setMintedImg] = useState<string>("");
  const [imageID, setImageID] = useState<string>("");
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
  const [notificationTimeout, setNotificationTimeout] = useState(null);

  // Custom notification state
  const [notification, setNotification] = useState<NotificationState>({
    visible: false,
    message: "",
    type: "info",
  });
  const [assetID, setNFTMintAddress] = useState("");

  const showNotification_copy = ({ type, message, txid = null }) => {
    // Clear any existing timeout to prevent previous notifications from disappearing
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }

    // Show the new notification
    setNotification({
      visible: true,
      message,
      type,
      txid,
    });

    // Set a new timeout and store its ID
    /*const timeoutId = setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 4000);*/

    //setNotificationTimeout();
  };

  const showNotification = ({ type, message, txid = null }) => {
    // Clear any existing timeout to prevent previous notifications from disappearing
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }

    // Show the new notification
    setNotification({
      visible: true,
      message,
      type,
      txid,
    });

    // Set a new timeout only for error notifications
    if (type === "error") {
      const timeoutId = setTimeout(() => {
        setNotification((prev) => ({ ...prev, visible: false }));
      }, 5000); // 3000 milliseconds = 3 seconds
      setNotificationTimeout(timeoutId);
    }
  };

  // Don't forget to clear the timeout when component unmounts
  useEffect(() => {
    return () => {
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
    };
  }, [notificationTimeout]);

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

  const umi = useMemo(
    () =>
      createUmi(quicknodeEndpoint)
        .use(walletAdapterIdentity(wallet))
        .use(mplCandyMachine())
        .use(mplTokenMetadata()),
    [
      wallet,
      mplCandyMachine,
      walletAdapterIdentity,
      mplTokenMetadata,
      quicknodeEndpoint,
      createUmi,
    ]
  );

  const publicMint = useCallback(async () => {
    if (!wallet.publicKey) {
      showNotification({ type: "error", message: "Wallet not connected!" });
      return;
    }

    // Show loading notification
    showNotification({ type: "loading", message: "Minting in progress..." });

    try {
      // Fetch the Candy Machine.
      const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
      // Fetch the Candy Guard.
      const candyGuard = await safeFetchCandyGuard(
        umi,
        candyMachine.mintAuthority
      );

      // Fetch the Candy Guard.
      const itemsRedeemed = candyMachine.itemsRedeemed;
      setItemsRedeemed(Number(itemsRedeemed));

      const bytesCreated = transactionBuilder().getBytesCreatedOnChain();
      console.log("Bytes created:", bytesCreated);

      // Mint from the Candy Machine.
      const nftMint = generateSigner(umi);
      const nft = mintV2(umi, {
        candyMachine: candyMachine.publicKey,
        candyGuard: candyGuard?.publicKey,
        nftMint,
        collectionMint: candyMachine.collectionMint,
        collectionUpdateAuthority: candyMachine.authority,
        group: some("public"), // you have to mention the relevant group here

        mintArgs: {
          solPayment: some({ destination: treasury }), //treasury is the destination address
        },
      });

      // Build the transaction with the latest blockhash
      const transaction = await transactionBuilder().add(
        setComputeUnitLimit(umi, { units: 800_000 }).add(nft)
      );

      transaction.setBlockhash(transaction.getBlockhash());

      const { signature } = await transaction.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
      });

      const mintAddress = nftMint.publicKey;
      const mintAddressPublicKey = new PublicKey(mintAddress);

      setNFTMintAddress(mintAddress);

      // Create an object with the mintAddress property
      const findNftInput: FindNftByMintInput = {
        mintAddress: mintAddressPublicKey,
      };

      // Create a Metaplex instance
      const metaplex = new Metaplex(connection);

      // Fetch the NFT metadata
      const nftMetadata = await metaplex.nfts().findByMint(findNftInput);

      const imageUrl = nftMetadata.json.image;
      setMintedImg(imageUrl);

      const imageID = nftMetadata.json.name;
      setImageID(imageID);

      showNotification({
        type: "success",
        message: "Mint successful!",
        txid: bs58.encode(signature),
      });
      getUserSOLBalance(wallet.publicKey, connection);
    } catch (error: any) {
      showNotification({
        type: "error",
        message: `Error minting: ${error?.message}`,
      });
      console.log("error", `Mint failed! ${error?.message}`);
    }
  }, [
    wallet,
    connection,
    getUserSOLBalance,
    umi,
    candyMachineAddress,
    treasury,
  ]);

  const WLMint = useCallback(async () => {
    if (!wallet.publicKey) {
      showNotification({ type: "error", message: "Wallet not connected!" });
      return;
    }

    // Show loading notification
    showNotification({
      type: "loading",
      message: "Whitelist minting in progress...",
    });

    try {
      // Fetch the Candy Machine.
      const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
      if (!candyMachine) {
        console.error("Candy Machine not found!");
        showNotification({
          type: "error",
          message: "Candy Machine not found!",
        });
        return;
      }

      console.log("candyMachine.collectionMint," + candyMachine.collectionMint);

      // Fetch the Candy Guard.
      const candyGuard = await safeFetchCandyGuard(
        umi,
        candyMachine.mintAuthority
      );
      if (!candyGuard) {
        console.error("Candy Guard is not initialized!");
        showNotification({
          type: "error",
          message: "Candy Guard is not initialized!",
        });
        return;
      }

      // Pre-validate the wallet
      const root = getMerkleRoot(allowList);
      const proof = getMerkleProof(allowList, publicKey(umi.identity));

      await route(umi, {
        candyMachine: candyMachine.publicKey,
        candyGuard: candyGuard.publicKey,
        group: some("om"), // you have to mention the relevant group here
        guard: "allowList",
        routeArgs: {
          path: "proof",
          merkleRoot: root,
          merkleProof: proof,
        },
      }).sendAndConfirm(umi);

      const rootHex = Buffer.from(root).toString("hex");

      const itemsRedeemed = candyMachine.itemsRedeemed;
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
            group: some("om"), // you have to mention the relevant group here

            mintArgs: {
              allowList: some({ merkleRoot: root }),
              //mintLimit: some({ id: 1 }),
            },
          })
        );

      const { signature } = await transaction.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
      });
      const txid = bs58.encode(signature);
      showNotification({ type: "success", message: "Mint successful!", txid });

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

      const imageUrl = nftMetadata.json.image;
      setMintedImg(imageUrl);

      const imageID = nftMetadata.json.name;
      setImageID(imageID);

      getUserSOLBalance(wallet.publicKey, connection);
    } catch (error: any) {
      showNotification({
        type: "error",
        message: `An error occurred: ${error.message}`,
      });
    }
  }, [wallet, umi, candyMachineAddress, allowList, setItemsRedeemed]);

  async function candyTime() {
    // Fetch the Candy Machine.
    const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);

    // Fetch the Candy Guard.
    const itemsAvailable = candyMachine.itemsLoaded;
    setTotalSupply(Number(itemsAvailable));

    const itemsRedeemed = candyMachine.itemsRedeemed;
    setItemsRedeemed(Number(itemsRedeemed));

    // Fetch the Candy Guard.
    const candyGuard = await safeFetchCandyGuard(
      umi,
      candyMachine.mintAuthority
    );
  }

  async function allImgs(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.image;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  useEffect(() => {
    setShowWL1(false);
    setShowWL2(false);
    setShowWL3(false);

    candyTime();
    
    if (wallet.publicKey) {
      getUserSOLBalance(wallet.publicKey, connection);
      console.log("allowList.length : " + allowList.length);
      for (let x = 0; x < allowList.length; x++) {
        console.log("allowList1[x] : " + allowList[x]);
        if (allowList[x] == wallet.publicKey.toBase58()) {
          setShowWL1(true);
        }
      }

      for (let x = 0; x < allowList2.length; x++) {
        console.log("allowList2[x] : " + allowList2[x]);
        if (allowList2[x] == wallet.publicKey.toBase58()) {
          setShowWL2(true);
        }
      }

      for (let x = 0; x < allowList3.length; x++) {
        console.log("allowList3[x] : " + allowList3[x]);
        if (allowList3[x] == wallet.publicKey.toBase58()) {
          setShowWL3(true);
        }
      }      
    }

    console.log("_o" + _o);
  }, [
    wallet.publicKey,
    connection,
    getUserSOLBalance,
    _showWL1,
    _showWL2,
    _showWL3,
    _pageNo,
  ]);

  const walletButtonStyle = useMemo<React.CSSProperties>(
    () => ({
      backgroundColor: "#8dcae5",
      color: "black",
      borderRadius: "12px",
      padding: "12px 24px",
      fontSize: "18px",
      fontWeight: 800,
      fontFamily: '"Comic Sans MS", cursive',
      textTransform: "uppercase",
      border: "3px solid #2c2d2e",
      boxShadow: "4px 4px 0 #2c2d2e",
      cursor: "pointer",
      transition: "transform 0.1s ease-in-out",
    }),
    []
  );

  return (
    <div className="mintDetails">
      <div className="mint-info" id="colorH4">
        <span id='txtColor'>Minted {_itemsRedeemed}/{_itemsLoaded}</span>
        <div id="txtColor2">Price: 0.25 SOL</div>
      </div>

      <div className="wallet-button-container" id="wallet">
        <WalletMultiButtonDynamic style={walletButtonStyle} />
      </div>

      {wallet.connected && (
        <button className="mint-button" id="wallet" onClick={publicMint}>
          Public Mint
        </button>
      )}

      {_showWL1 && (
        <button className="mint-button" id="wallet2" onClick={WLMint}>
          Whitelist Mint
        </button>
      )}

      {/* Custom notification component */}
      {notification.visible && (
        <div className={`custom-notification ${notification.type}`}>
          <span className="notification-message">{notification.message}</span>
        </div>
      )}

      {mintedImg && (
        <div className="mintSection">
          <div
            className="idAmount"
            onClick={() => handleCopy(notification.txid)}
            title="Click to copy"
          >
            Minted ID:
            <br />
            {imageID}
          </div>
          {copyAlert && <div className="copyAlert">Copied!</div>}
          <a
            href={`https://solana.fm/tx/${notification.txid}?cluster=mainnet-alpha`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <img
              src={mintedImg}
              className="mintedNFT"
              alt="NFT Image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/200x200?text=NFT+Image";
              }}
            />
          </a>
        </div>
      )}
    </div>
  );
};
