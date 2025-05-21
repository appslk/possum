// Next, React
import { FC, useEffect, useState } from "react";
import Link from "next/link";

// Wallet
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

// Components
import { RequestAirdrop } from "../../components/RequestAirdrop";
import pkg from "../../../package.json";
import { CandyMint } from "../../components/CandyMint";

// Store
import useUserSOLBalanceStore from "../../stores/useUserSOLBalanceStore";
import { Footer } from "components/Footer";
import { Footer2 } from "components/Footer2";
import Carousel from "components/Carousel";

export const HomeView: FC = ({}) => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const balance = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58());
      getUserSOLBalance(wallet.publicKey, connection);
    }
  }, [wallet.publicKey, connection, getUserSOLBalance]);

  return (
    <div id="bgC" className="w-full mx-auto flex flex-col items-center">
      <div id="amountSol">
        <CandyMint />
      </div>

      <div className="px-[15px] sm:px-[20px] md:px-[30px] lg:px-[40px] xl:px-[45px] 2xl:px-[50px] relative z-[2] container mx-auto pb-[4em]">
        <div className="flex justify-between">
          <Carousel />
        </div>
      </div>
    </div>
  );
};
