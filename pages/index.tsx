import Link from 'next/link'
import Layout from '../components/Layout'
import type { NextPage } from "next";

import {
	useAddress,
	useMetamask,
	useCoinbaseWallet,
	useWalletConnect,
	useDisconnect,
} from "@thirdweb-dev/react";

const Home: NextPage = () => {
	const connectWithCoinbaseWallet = useCoinbaseWallet();
	const connectWithMetamask = useMetamask();
	const connectWithWalletConnect = useWalletConnect();
	const address = useAddress();
	const disconnectWallet = useDisconnect();

	if (address) {
		return (
			<div>
				<p className="m-12 font-medium text-gray-600">Address: {address}</p>
				<br />
				<button
					onClick={disconnectWallet}
					className="w-64 rounded-full bg-blue-600 py-2 font-medium text-white transition-all duration-75 hover:bg-blue-500"
				>
					Disconnect
				</button>
			</div>
		);
	}

	return (
		<>
		<div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50">
			<button
				onClick={connectWithCoinbaseWallet}
				className="w-64 rounded-full bg-blue-600 py-2 font-medium text-white transition-all duration-75 hover:bg-blue-500"
			>Connect Coinbase Wallet</button>
			<button
          		onClick={connectWithMetamask}
          		className="w-64 rounded-full bg-blue-600 py-2 font-medium text-white transition-all duration-75 hover:bg-blue-500"
        	>
          		Connect MetaMask
        	</button>
        	<button
          		onClick={connectWithWalletConnect}
          		className="w-64 rounded-full bg-blue-600 py-2 font-medium text-white transition-all duration-75 hover:bg-blue-500"
        	>
          		Connect WalletConnect
        	</button>
			</div>
		</>
	);
};

export default Home;