import { useEffect, useState } from 'react';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import TokenJSON from '../artifacts/TokenABI.json';
import ClaimingJSON from '../artifacts/ClaimingABI.json';
import StakingJSON from '../artifacts/StakingABI.json';
import LiquidityJSON from '../artifacts/LiquidityMiningABI.json';

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

  const [ decimals, setDecimals ] = useState(0);
  const [ symbol, setSymbol ] = useState('');

  const [ liquidityContractOwner, setLiquidityContractOwner ] = useState('');
  const [ depositStart, setDepositStart ] = useState('');
  const [ updateDepositStart, setUpdateDepositStart ] = useState('');
  const [ updateRewardStartDate, setUpdateRewardStartDate ] = useState('');
  const [ rewardPeriod, setRewardPeriod ] = useState('');
  const [ rewardTotalAmount, setRewardTotalAmount ] = useState('');

  // get staking enabled status, token decimals
  useEffect(() => {
    if (!isConnected) return;

    getDepositStart();
    getTokenDecimals();
    getLiquidityContractOwner();
  }, [isConnected]);

  async function getTokenDecimals() {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const TokenContract = new Contract(TokenAddress, TokenJSON.abi, signer);
    const tokenDecimals = await TokenContract.decimals();
    const symbol = await TokenContract.symbol();
    setDecimals(tokenDecimals);
    setSymbol(symbol);
  }

  async function getDepositStart() {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const LiquidityContract = new Contract(LiquidityAddress, LiquidityJSON.abi, signer);
    const depositStart = await LiquidityContract.depositStart();
    
    setDepositStart(depositStart);
  }

  async function getLiquidityContractOwner() {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const LiquidityContract = new Contract(LiquidityAddress, LiquidityJSON.abi, signer);
    const owner = await LiquidityContract.owner();

    setLiquidityContractOwner(owner);
  }

  async function updateDepositStartDate() {
    const data = Math.floor(new Date(updateDepositStart).getTime() / 1000);
    
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    try {
      const LiquidityContract = new Contract(LiquidityAddress, LiquidityJSON.abi, signer);
      await LiquidityContract.setDepositStart(data);

      getDepositStart();
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function setRewardStates() {
    const rewardStartDate = Math.floor(new Date(updateRewardStartDate).getTime() / 1000);
    
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    try {
      const LiquidityContract = new Contract(LiquidityAddress, LiquidityJSON.abi, signer);
      await LiquidityContract.setRewardStates(rewardStartDate, rewardPeriod, rewardTotalAmount);

      getDepositStart();
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

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
      {
        liquidityContractOwner != '' && liquidityContractOwner == address ? (
          <>
            <hr className="my-5" />
            <div class="text-lg font-bold my-4">LiquidityMining Contract Owner Functions</div>
            <div>
              <div className='flex mt-4'>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Set Deposit Start</label>
                  <div className='flex'>
                    <input
                      className="block w-64 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
                      onChange={e => setUpdateDepositStart(e.target.value)}
                      placeholder='YYYY-MM-DD HH:MI:SS'
                    />
                    <button className="ml-4 py-2 px-4 bg-blue-700 hover:bg-blue-500 rounded text-white" onClick={updateDepositStartDate}>Update Deposit Start</button>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex mt-4'>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Reward Start Time</label>
                <input
                  type="number"
                  className="block w-64 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
                  onChange={e => setUpdateRewardStartDate(e.target.value)}
                  placeholder='YYYY-MM-DD HH:MI:SS'
                />
              </div>
              <div className='ml-2'>
                <label className="block mb-2 text-sm font-medium text-gray-900">Reward Period (in Days)</label>
                <input
                  type="number"
                  className="block w-64 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
                  onChange={e => setRewardPeriod(e.target.value)}
                  placeholder="Enter the amount of token to stake"
                />
              </div>
              <div className='ml-2'>
                <label className="block mb-2 text-sm font-medium text-gray-900">Reward Token Amount</label>
                <div className='flex'>
                  <input
                    type="number"
                    className="block w-64 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
                    onChange={e => setRewardTotalAmount(e.target.value)}
                    placeholder="Enter the amount of token to stake"
                  />
                  <button className="ml-4 py-2 px-4 bg-blue-700 hover:bg-blue-500 rounded text-white" onClick={setRewardStates}>Set Reward States</button>
                </div>
              </div>
            </div>
          </>
        ): <></>
      }
    </main>
  )
}