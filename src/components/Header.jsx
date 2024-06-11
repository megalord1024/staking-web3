import {
  createWeb3Modal,
  defaultConfig,
} from '@web3modal/ethers/react'
import { Outlet, Link } from "react-router-dom";

// 1. Get projectId
const projectId = "a627aa841f7924b83dfd55ecfae12ea3"
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

// 2. Set chains
const chains = [
  {
    chainId: 11155111,
    name: 'Sepolia',
    currency: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io/',
    rpcUrl: 'https://rpc2.sepolia.org'
  }
];

const ethersConfig = defaultConfig({
  metadata: {
    name: 'Web3Modal',
    description: 'Web3Modal Laboratory',
    url: 'https://web3modal.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  },
  enableEmail: true,
  defaultChainId: 1,
  rpcUrl: 'https://cloudflare-eth.com'
});

// 3. Create modal
createWeb3Modal({
  ethersConfig,
  chains,
  projectId,
  enableAnalytics: true,
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#00DCFF',
    '--w3m-color-mix-strength': 20
  }
});

export const Header = () => {

  return(
    <nav className="bg-white w-full px-12 text-black border-b-2 border-black">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-3">
        <nav className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0">
            <li>
              <a href="/" className="block py-2 px-3 md:hover:text-blue-700" aria-current="page">Staking & Claiming</a>
            </li>
            <li>
              <a href="/liquidity" className="block py-2 px-3 md:hover:text-blue-700" aria-current="page">Liquidity Mining</a>
            </li>
          </ul>
        </nav>
        <button className="flex items-center space-x-3 rtl:space-x-reverse py-2 px-3">
          <w3m-button size={undefined} label={undefined} loadingLabel={undefined} disabled={undefined} balance={undefined} />
        </button>
      </div>
    </nav>
  );
}