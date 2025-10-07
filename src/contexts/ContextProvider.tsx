import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    UnsafeBurnerWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { Cluster, clusterApiUrl } from '@solana/web3.js';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { AutoConnectProvider, useAutoConnect } from './AutoConnectProvider';
import { notify } from "../utils/notifications";
import { NetworkConfigurationProvider, useNetworkConfiguration } from './NetworkConfigurationProvider';
import dynamic from "next/dynamic";
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
    BackpackWalletAdapter,
    CoinbaseWalletAdapter,
    LedgerWalletAdapter,
    MathWalletAdapter,
    TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets";

const ReactUIWalletModalProviderDynamic = dynamic(
    async () =>
        (await import("@solana/wallet-adapter-react-ui")).WalletModalProvider,
    { ssr: false }
);

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { autoConnect } = useAutoConnect();
    const { networkConfiguration } = useNetworkConfiguration();
    const network = networkConfiguration as WalletAdapterNetwork;
    const endpoint = useMemo(() => {
        const customEndpoint = process.env.NEXT_PUBLIC_RPC;
        return customEndpoint;
    }, [network]);

    console.log(network);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new BackpackWalletAdapter(),
            new GlowWalletAdapter(),
            new CoinbaseWalletAdapter(),
            new TrustWalletAdapter(),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new MathWalletAdapter(),
            new SlopeWalletAdapter(),
            //new UnsafeBurnerWalletAdapter(),
        ],
        [network]
    );

    const onError = useCallback(
        (error: WalletError) => {
            // Log error but don't show notification to avoid spam
            console.error(error);
        },
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
                <ReactUIWalletModalProviderDynamic>
                    {children}
                </ReactUIWalletModalProviderDynamic>
            </WalletProvider>
        </ConnectionProvider>
    );
};


export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <>
            <NetworkConfigurationProvider>
                <AutoConnectProvider>
                    <WalletContextProvider>{children}</WalletContextProvider>
                </AutoConnectProvider>
            </NetworkConfigurationProvider>
        </>
    );
};
