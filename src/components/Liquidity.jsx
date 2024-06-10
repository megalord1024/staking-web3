import { useEffect, useState } from 'react';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { BrowserProvider, Contract, formatUnits, formatEther, parseEther } from 'ethers';
import BigNumber from 'bignumber.js';
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
// const LiquidityAddress = '0xfE9BA5d5fb2909Fffec58e928437FD52DC05ffd0';
// const LiquidityAddress = '0xe7986D07D865208ABb4fdE4bCE25017CFFD546ce';
const LiquidityAddress = '0x636372c9aB49202Ce7A47E4f2CA52400C029E679';


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

  const [ depositAmount, setDepositAmount ] = useState('');
  const [ totalDepositAmount, setTotalDepositAmount ] = useState('');
  const [ userDepositsArray, setUserDepositsArray ] = useState([]);
  const [ totalDeposits, setTotalDeposits ] = useState(0);
  const [ claimingTokenBalance, setClaimingTokenBalance ] = useState(0);
  const [ pairAddress, setPairAddress ] = useState('');

  // get staking enabled status, token decimals
  useEffect(() => {
    if (!isConnected) return;

    getDepositStart();
    getTokenDecimals();
    getLiquidityContractOwner();
    getUserTotalDeposit();
    getTotalDepositAmount();
  }, [isConnected]);

  useEffect(() => {
    getClaimingTokenBalance();
  }, [isConnected, decimals]);

  // get deposits array
  useEffect(() => {
    getUserDepositsArray();
  }, [isConnected, address, chainId]);

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

  async function getUserTotalDeposit() {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const LiquidityContract = new Contract(LiquidityAddress, LiquidityJSON.abi, signer);
    const totalAmount = await LiquidityContract.getUserTotalDeposit(address);

    setTotalDepositAmount(formatUnits(totalAmount));
  }

  async function getUserDepositsArray() {
    if (!isConnected) return;

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const LiquidityContract = new Contract(LiquidityAddress, LiquidityJSON.abi, signer);

    // The Contract object
    try {
      const data = await LiquidityContract.getUserDepositsArray(address);
      if (data.length > 0) {
        setUserDepositsArray(data);
      } else {
        setUserDepositsArray([]);
      }
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function getTotalDepositAmount() {
    if (!isConnected) return;

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const LiquidityContract = new Contract(LiquidityAddress, LiquidityJSON.abi, signer);

    try {
      const total = await LiquidityContract.totalDeposits();
      
      setTotalDeposits(formatUnits(total));
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function getClaimingTokenBalance() {
    if (!isConnected) return;

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const TokenContract = new Contract(TokenAddress, TokenJSON.abi, signer);

    try {
      const balance = await TokenContract.balanceOf(ClaimingAddress);

      setClaimingTokenBalance(formatUnits(balance, decimals));
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

  async function depositETH() {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    try {
      const LiquidityContract = new Contract(LiquidityAddress, LiquidityJSON.abi, signer);
      await LiquidityContract.depositETH({
        value: parseEther(depositAmount)
      });

      getUserTotalDeposit();
      getUserDepositsArray();
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function withdrawDeposit(index) {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    try {
      const LiquidityContract = new Contract(LiquidityAddress, LiquidityJSON.abi, signer);
      await LiquidityContract.removeLiquidity(index);

      await getUserTotalDeposit();
      await getUserDepositsArray();
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function listLiquidity() {

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
    const month = (x.getMonth()+1).toString().padStart(2, 0);
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
        <div className='flex items-center mt-4'>
          <div>Deposited Amount: <span class="bg-green-100 text-green-800 text-sm font-medium me-2 px-1.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 ml-2">{totalDepositAmount} ETH</span></div>
        </div>
        <div className='flex mt-4'>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Deposit Amount</label>
            <div className='flex'>
              <input
                type = "number"
                className="block w-64 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
                onChange={e => setDepositAmount(e.target.value)}
                placeholder='Enter the amount of token to claim'
              />
              <button className="ml-4 py-2 px-4 bg-blue-700 hover:bg-blue-500 rounded text-white" onClick={depositETH}>Deposit</button>
            </div>
          </div>
        </div>        
        <div className="mt-4">
          <table className="w-full text-sm text-left rtl:text-right text-gray-400 dark:text-gray-400">
            <thead className="text-xs text-gray-900 uppercase bg-gray-200 text-center">
              <tr>
                <th scope="col" className="px-6 py-3">
                  No
                </th>
                <th scope="col" className="px-6 py-3">
                  Deposit Amount
                </th>
                <th scope="col" className="px-6 py-3">
                  Deposit Time
                </th>
                <th scope="col" className="px-6 py-3">
                  Liquidity
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {
                userDepositsArray.length > 0 ? userDepositsArray.map((item, index) => {
                  return (
                    <tr className="bg-white border-b text-center font-medium text-gray-900 whitespace-nowrap" key={index}>
                      <td className="px-6 py-3">
                        { index + 1 }
                      </td>
                      <td className="px-6 py-3">
                        { formatUnits(item.amount, decimals) } ETH
                      </td>
                      <td className="px-6 py-3">
                        { convertDate(item.depositOn) }
                      </td>
                      <td className="px-6 py-3">
                        { formatUnits(item.liquidity, 18) } UNI-V2
                      </td>
                      <td className="px-6 py-3">
                        { item.removed ? <span class="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">Removed</span> : <span class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Active</span> }
                      </td>
                      <td className="px-6 py-3">
                        {
                          Number(item.amount) > 0 ? (
                            <button className='text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-xs px-2 py-1 text-center' onClick={() => withdrawDeposit(index)}>Withdraw</button>
                          ) : <></>
                        }
                      </td>
                    </tr>
                  )
                }) : <tr><td colSpan="7" className="text-lg text-gray-900 text-center py-2 border-b-2">There is no data</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      <hr className="my-5" />
      <div>
        <div></div>
      </div>
      {
        liquidityContractOwner != '' && liquidityContractOwner == address ? (
          <>
            <hr className="my-5" />
            <div className="text-lg font-bold my-4">LiquidityMining Contract Owner Functions</div>
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
            <div className='mt-6'>
              <div>Total Deposit ETH Amount: <span class="bg-green-100 text-green-800 text-sm font-medium me-2 px-1.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 ml-2">{totalDeposits} ETH</span></div>
              <div className='mt-1'>Claiming Contract Token Balance: <span class="bg-green-100 text-green-800 text-sm font-medium me-2 px-1.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 ml-2">{claimingTokenBalance} {symbol}</span></div>
            </div>
            <div className='flex mt-4'>
              <input
                className="block w-64 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
                onChange={e => setPairAddress(e.target.value)}
                placeholder='Pool Address (0x..)'
              />
              <button type="button" class="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-md px-4 py-2.5 text-center ml-2" onClick={listLiquidity}>List Liquidity</button>
            </div>
          </>
        ): <></>
      }
    </main>
  )
}