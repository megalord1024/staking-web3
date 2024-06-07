import { useEffect, useState } from 'react';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import TokenJSON from '../artifacts/TokenABI.json';
import ClaimingJSON from '../artifacts/ClaimingABI.json';
import StakingJSON from '../artifacts/StakingABI.json';

// const TokenAddress = '0x2eBECAf092BC7251d1d6EB18102885d421780263';
// const ClaimingAddress = '0xacCcE71d97a81CDb25B7e97D2e7190E6f64e6dd6';
// const StakingAddress = '0xAe1ba1B8D587d22A668405Ab8237158a08E7981a';

const TokenAddress = '0x8c06e9fb6C8254917a13133F490BBd6680408948';
const StakingAddress = '0x671Fe65F0721574CFc3594CCf91ACB7A8a55433e';
const ClaimingAddress = '0x89b77621559290D9C0535A142A29027f7bB31BAC';
const LiquidityAddress = '0xfE9BA5d5fb2909Fffec58e928437FD52DC05ffd0';


export const Liquidity = () => {
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const [ depositStart, setDepositStart ] = useState('');

  function depositStarted() {
    if (depositStart == 0) return false;

    const depositStartDate = new Date(Number(depositStart) * 1000);
    const currentDate = new Date();

    return currentDate >= depositStartDate;
  }

  function convertDate(x) {
    if (x == 0) return 'Not defined yet';

    x = new Date(Number(x) * 1000);
    const date = x.getDate().toString().padStart(2, 0);
    const month = x.getMonth().toString().padStart(2, 0);
    const year = x.getFullYear().toString();

    const hours = x.getHours().toString().padStart(2, 0);
    const minutes = x.getMinutes().toString().padStart(2, 0);
    const seconds = x.getSeconds().toString().padStart(2, 0);
    return [date, month, year].join('/') + ' '+ [hours, minutes, seconds].join(':');
  }

  return(
    <main className="py-12 px-24">
      <div>
        <div className='flex items-center'>
          <div className={(depositStarted() ? `bg-green-800`:`bg-red-800`)+` rounded-full w-4 h-4 mr-3`}></div>
            { depositStarted() ? <span className="text-lg font-bold">Deposit is enabled.</span> : <span className="text-lg font-bold">Deposit is Disabled</span> }
            <span className="mx-4">|</span>
          <div>Deposit is available from: <span className="font-bold">{convertDate(depositStart)}</span></div>
        </div>
      </div>
    </main>
  )
}