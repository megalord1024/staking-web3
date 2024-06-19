import { useEffect, useState } from 'react';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { BrowserProvider, Contract, formatUnits, parseEther, parseUnits } from 'ethers';
import BigNumber from 'bignumber.js';
import TokenJSON from '../artifacts/TokenABI.json';
import ClaimingJSON from '../artifacts/ClaimingABI.json';
import StakingJSON from '../artifacts/StakingABI.json';
import LiquidityJSON from '../artifacts/LiquidityMiningABI.json';

const TokenAddress = '0xE7981188f8D10DAB0aba03C1974E496CE83E2876';
const StakingAddress = '0xe5f438191cA1C051373239748BF8E0cd55155A3E';
const ClaimingAddress = '0xE097A30Ba2c5737e0d9b73603e91c600DBf4a8Dc';
const LiquidityAddress = '0x2DEadC133aAA4c30D95FDA4C2Bb003E673487F94';


export const Liquidity = () => {
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const [ decimals, setDecimals ] = useState(0);
  const [ symbol, setSymbol ] = useState('');

  const [ liquidityContractOwner, setLiquidityContractOwner ] = useState('');
  const [ depositStart, setDepositStart ] = useState('');
  const [ updateDepositStart, setUpdateDepositStart ] = useState('');
  const [ updateRewardStartDate, setUpdateRewardStartDate ] = useState('');
  const [ updateRewardPeriod, setUpdateRewardPeriod ] = useState('');
  const [ updateRewardTotalAmount, setUpdateRewardTotalAmount ] = useState('');
  const [ rewardStartDate, setRewardStartDate ] = useState('');
  const [ rewardPeriod, setRewardPeriod ] = useState('');
  const [ rewardTotalAmount, setRewardTotalAmount ] = useState('');
  const [ claimableRewardAmount, setClaimableRewardAmount ] = useState('');

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
    getRewardStates();
  }, [isConnected]);

  useEffect(() => {
    getClaimingTokenBalance();
  }, [isConnected, decimals]);

  // get deposits array
  useEffect(() => {
    getUserDepositsArray();
    getClaimableRewardAmount();
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
      const trx = await LiquidityContract.setDepositStart(data);

      trx.wait().then(async receipt => {
        if (receipt && receipt.status == 1) {
          getDepositStart();
        }
      });
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

  async function getClaimableRewardAmount() {
    if (!isConnected || !address) return;

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const LiquidityContract = new Contract(LiquidityAddress, LiquidityJSON.abi, signer);

    try {
      const returns = await LiquidityContract.getRewardTokenAmount(address);

      setClaimableRewardAmount(returns.rewardAmount);
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function getRewardStates() {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const LiquidityContract = new Contract(LiquidityAddress, LiquidityJSON.abi, signer);

    try {
      const startDay = await LiquidityContract.startDay();
      const rewardPeriod = await LiquidityContract.rewardPeriod();
      const totalReward = await LiquidityContract.totalReward();

      setRewardStartDate(Number(startDay) * 86400);
      setRewardPeriod(rewardPeriod);
      setRewardTotalAmount(totalReward);
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function setRewardStates() {
    const startDate = Math.floor(new Date(updateRewardStartDate).getTime() / 1000);
    
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    try {
      const LiquidityContract = new Contract(LiquidityAddress, LiquidityJSON.abi, signer);
      const DECIMAL = Math.pow(Number(10), Number(decimals));
      let amount = Number(updateRewardTotalAmount) * DECIMAL;
      const trx = await LiquidityContract.setRewardStates(startDate, updateRewardPeriod, parseUnits(updateRewardTotalAmount, decimals));

      trx.wait().then(async receipt => {
        if (receipt && receipt.status == 1) {
          getRewardStates();
        }
      });
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
      const trx = await LiquidityContract.depositETH({
        value: parseEther(depositAmount)
      });

      trx.wait().then(async receipt => {
        if (receipt && receipt.status == 1) {
          getUserTotalDeposit();
          getUserDepositsArray();
          getTotalDepositAmount();
          getClaimableRewardAmount();
        }
      });
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
      const trx = await LiquidityContract.removeLiquidity(index);

      trx.wait().then(async receipt => {
        if (receipt && receipt.status == 1) {
          getUserTotalDeposit();
          getUserDepositsArray();
          getClaimableRewardAmount();
        }
      });
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function claimReward() {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    try {
      const LiquidityContract = new Contract(LiquidityAddress, LiquidityJSON.abi, signer);
      const trx = await LiquidityContract.claimReward();

      trx.wait().then(async receipt => {
        if (receipt && receipt.status == 1) {
          getClaimableRewardAmount();
        }
      });
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function listLiquidity() {
    if (!isConnected) return;
    if (!pairAddress) {
      alert("Please input pair address");
      return;
    }
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    try {
      const LiquidityContract = new Contract(LiquidityAddress, LiquidityJSON.abi, signer);
      const trx = await LiquidityContract.listLiquidity(pairAddress);

      trx.wait().then(async receipt => {
        if (receipt && receipt.status == 1) {
          getClaimingTokenBalance();
        }
      });
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

  function rewardPeriodStarted() {
    if (rewardStartDate == 0) return false;

    const startDate = new Date(Number(rewardStartDate) * 1000);
    const currentDate = new Date();

    return currentDate >= startDate;
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
          <div>Deposited Amount: <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-1.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 ml-2">{totalDepositAmount} ETH</span></div>
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
                        { item.removed ? <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">Removed</span> : <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Active</span> }
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
        <div className='flex items-center'>
          <div className={(rewardPeriodStarted() ? `bg-green-800`:`bg-red-800`)+` rounded-full w-4 h-4 mr-3`}></div>
          { rewardPeriodStarted() ? <span className="text-lg font-bold">Reward period is started.</span> : <span className="text-lg font-bold">Reward isn't started</span> }
        </div>
        <div className='mt-3'>Reward period starts from: <span className="font-bold">{convertDate(rewardStartDate)}</span></div>
        <div className='mt-3'>Reward period ends at: <span className="font-bold">{convertDate(rewardStartDate + 86400 * Number(rewardPeriod))}</span></div>
        <div className='mt-3'>Reward Total Amount: <span className="font-bold"> <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-1.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 ml-2">{rewardTotalAmount > 0 ? formatUnits(rewardTotalAmount, decimals) : 0} {symbol}</span></span></div>
        <div className='mt-3'>Claimable Reward Amount: <span className="font-bold"> <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-1.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 ml-2">{claimableRewardAmount > 0 ? formatUnits(claimableRewardAmount, decimals) : 0} {symbol}</span></span></div>
        <button type="button" className="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-md px-4 py-2.5 text-center mt-2" onClick={claimReward}>Claim Reward</button>
      </div>
      <hr className="my-5" />
      {
        liquidityContractOwner != '' && liquidityContractOwner == address ? (
          <>
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
                  onChange={e => setUpdateRewardPeriod(e.target.value)}
                  placeholder="Enter the amount of token to stake"
                />
              </div>
              <div className='ml-2'>
                <label className="block mb-2 text-sm font-medium text-gray-900">Reward Token Amount</label>
                <div className='flex'>
                  <input
                    type="number"
                    className="block w-64 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
                    onChange={e => setUpdateRewardTotalAmount(e.target.value)}
                    placeholder="Enter the amount of token to stake"
                  />
                  <button className="ml-4 py-2 px-4 bg-blue-700 hover:bg-blue-500 rounded text-white" onClick={setRewardStates}>Set Reward States</button>
                </div>
              </div>
            </div>
            <div className='mt-6'>
              <div>Total Deposit ETH Amount: <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-1.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 ml-2">{totalDeposits} ETH</span></div>
              <div className='mt-1'>Claiming Contract Token Balance: <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-1.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 ml-2">{claimingTokenBalance} {symbol}</span></div>
            </div>
            <div className='flex mt-4'>
              <input
                className="block w-64 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
                onChange={e => setPairAddress(e.target.value)}
                placeholder='Pool Address (0x..)'
              />
              <button type="button" className="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-md px-4 py-2.5 text-center ml-2" onClick={listLiquidity}>List Liquidity</button>
            </div>
          </>
        ): <></>
      }
    </main>
  )
}