import { useEffect, useState } from 'react';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';
import TokenJSON from '../artifacts/TokenABI.json';
import ClaimingJSON from '../artifacts/ClaimingABI.json';
import StakingJSON from '../artifacts/StakingABI.json';
import { getStakes, createStake, updateStake } from '../api/stake';
import { shortenAddress } from '../utils';

console.log(process.env.REACT_APP_BACKEND_ENDPOINT);

const TokenAddress = '0xE7981188f8D10DAB0aba03C1974E496CE83E2876';
const StakingAddress = '0xe5f438191cA1C051373239748BF8E0cd55155A3E';
const ClaimingAddress = '0xE097A30Ba2c5737e0d9b73603e91c600DBf4a8Dc';
const LiquidityAddress = '0x2DEadC133aAA4c30D95FDA4C2Bb003E673487F94';

export const Claiming = () => {
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const [decimals, setDecimals] = useState(0);
  const [symbol, setSymbol] = useState('');

  const [claimContractOwner, setClaimContractOwner] = useState('');
  const [claimStart, setClaimStart] = useState('');
  const [updateClaimStart, setUpdateClaimStart] = useState('');
  const [claimInfoAmount, setClaimInfoAmount] = useState('');
  const [claimInfoAddress, setClaimInfoAddress] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimableAmount, setClaimableAmount] = useState('');
  const [stakeFromClaimingAmount, setStakeFromClaimingAmount] = useState('');
  const [durationFromClaiming, setDurationFromClaiming] = useState('');

  const [tokenBalance, setTokenBalance] = useState('');
  const [stakingEnabled, setStakingEnabled] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [stakingArray, setStakingArray] = useState([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // get staking amount
  useEffect(() => {
    setPage(1);
    getStakingArray();
  }, [isConnected, address, chainId]);

  useEffect(() => {
    getStakingArray();
  }, [page, limit]);

  // get staking enabled status, token decimals
  useEffect(() => {
    if (!isConnected) return;

    getStakingEnabled();
    getTokenDecimals();
    getClaimStart();
    getClaimContractOwner();
  }, [isConnected]);

  // get token balance, claimable amount
  useEffect(() => {
    if (!isConnected) return;

    getTokenBalance();
    getClaimableAmount();
  }, [isConnected, address, decimals]);

  async function getTokenDecimals() {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const TokenContract = new Contract(TokenAddress, TokenJSON.abi, signer);
    const tokenDecimals = await TokenContract.decimals();
    const symbol = await TokenContract.symbol();
    setDecimals(tokenDecimals);
    setSymbol(symbol);
  }

  async function getClaimableAmount() {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const ClaimingContract = new Contract(ClaimingAddress, ClaimingJSON.abi, signer);
    const amount = await ClaimingContract.getClaimableAmount(address);
    setClaimableAmount(formatUnits(amount, decimals));
  }

  async function getTokenBalance() {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const TokenContract = new Contract(TokenAddress, TokenJSON.abi, signer);
    const balance = await TokenContract.balanceOf(address);

    setTokenBalance(formatUnits(balance, decimals));
  }

  async function getClaimContractOwner() {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const ClaimingContract = new Contract(ClaimingAddress, ClaimingJSON.abi, signer);
    const owner = await ClaimingContract.owner();

    setClaimContractOwner(owner);
  }

  async function getClaimStart() {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const ClaimingContract = new Contract(ClaimingAddress, ClaimingJSON.abi, signer);
    const claimStart = await ClaimingContract.claimStart();

    setClaimStart(claimStart);
  }

  async function getStakingEnabled() {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const StakingContract = new Contract(StakingAddress, StakingJSON.abi, signer);
    const stakingEnabled = await StakingContract.stakingEnabled();
    setStakingEnabled(stakingEnabled);
  }

  async function getStakingArray() {
    if (!isConnected) {
      setStakingArray([]);
      return;
    }

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const StakingContract = new Contract(StakingAddress, StakingJSON.abi, signer);

    try {
      const fromIndex = (Number(page) - 1) * Number(limit);
      const toIndex = Number(page) * Number(limit) - 1;
      const data = await StakingContract.getStakeInfoArray(address, fromIndex, toIndex);

      setStakingArray(data || []);
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function claimToken() {
    if (!isConnected) {
      alert("Connect the wallet please");
      return;
    }

    if (claimAmount == 0) {
      alert("Input amount to claim");
      return;
    }

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const DECIMAL = Math.pow(Number(10), Number(decimals));
    let amount = Number(claimAmount) * DECIMAL;

    try {
      const ClaimingContract = new Contract(ClaimingAddress, ClaimingJSON.abi, signer);
      const trx = await ClaimingContract.claim(address, amount.toString());

      trx.wait().then(async receipt => {
        if (receipt && receipt.status == 1) {
          getClaimableAmount();
          getTokenBalance();
        }
      })
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function stakeFromClaiming() {
    if (!isConnected) {
      alert("Connect the wallet please");
      return;
    }

    if (stakeFromClaimingAmount == 0) {
      alert("Input staking amount");
      return;
    }

    if (durationFromClaiming == 0) {
      alert("Input duration in months");
      return;
    }

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const DECIMAL = Math.pow(Number(10), Number(decimals));
    let amount = Number(stakeFromClaimingAmount) * DECIMAL;

    try {
      const ClaimingContract = new Contract(ClaimingAddress, ClaimingJSON.abi, signer);
      const trx = await ClaimingContract.stake(amount.toString(), durationFromClaiming);

      trx.wait().then(async receipt => {
        if (receipt && receipt.status == 1) {
          getClaimableAmount();
          getStakingArray();

          const data = {
            user: address,
            duration: durationFromClaiming,
            apy: 10,
            trx_hash: receipt.hash
          }

          recordStakeInfo(address, data);
        }
      });
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function stakeToken() {
    if (!isConnected) {
      alert("Connect the wallet please");
      return;
    }

    if (stakeAmount == 0) {
      alert("Input staking amount");
      return;
    }

    if (duration == 0) {
      alert("Input duration in months");
      return;
    }

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    let amount;

    // The Contract object
    try {
      const TokenContract = new Contract(TokenAddress, TokenJSON.abi, signer);
      const StakingContract = new Contract(StakingAddress, StakingJSON.abi, signer);
      const DECIMAL = Math.pow(Number(10), Number(decimals));
      amount = Number(stakeAmount) * DECIMAL;

      const trx = await TokenContract.approve(StakingAddress, amount.toString());

      trx.wait().then(async receipt => {
        if (receipt && receipt.status) {
          const trx2 = await StakingContract.stake(amount.toString(), duration);
          trx2.wait().then(async receipt2 => {
            if (receipt2 && receipt2.status) {
              getTokenBalance();
              getStakingArray();
            }
          })
        }
      });
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function withdrawStake(index) {
    if (!isConnected) return;

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const StakingContract = new Contract(StakingAddress, StakingJSON.abi, signer);

    try {
      const trx = await StakingContract.withdraw(index);

      trx.wait().then(async receipt => {
        if (receipt && receipt.status == 1) {
          getTokenBalance();
          getStakingArray();
        }
      });
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function claimRewards(index) {
    if (!isConnected) return;

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const StakingContract = new Contract(StakingAddress, StakingJSON.abi, signer);

    try {
      const trx = await StakingContract.claimRewards(index);

      trx.wait().then(async receipt => {
        if (receipt && receipt.status) {
          getTokenBalance();
          getStakingArray();
        }
      });
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function updateClaimStartDate() {
    const data = Math.floor(new Date(updateClaimStart).getTime() / 1000);

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    try {
      const ClaimingContract = new Contract(ClaimingAddress, ClaimingJSON.abi, signer);
      const trx = await ClaimingContract.setClaimStart(data);

      trx.wait().then(async receipt => {
        if (receipt && receipt.status == 1) {
          getClaimStart();
        }
      });
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function setClaimInfo() {
    if (!isConnected) {
      alert("Please connect wallet");
      return;
    }

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    try {
      const ClaimingContract = new Contract(ClaimingAddress, ClaimingJSON.abi, signer);
      const trx = await ClaimingContract.setClaim(claimInfoAddress, parseUnits(String(claimInfoAmount), Number(decimals)));

      trx.wait().then(async receipt => {
        if (receipt && receipt.status == 1) {
          getClaimableAmount();
        }
      });
    } catch (error) {
      let message = error;
      if (error.reason) message = error.reason;

      alert(message);
      console.log(error);
    }
  }

  async function recordStakeInfo(user, data) {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const StakingContract = new Contract(StakingAddress, StakingJSON.abi, signer);

    try {
      const length = await StakingContract.numStakes(user);
      if (length == 0) throw "No staked data";

      const response = await StakingContract.getStakeInfo(user, Number(length) - 1);
      data.index = Number(length) - 1;
      data.amount = Number(response[0]);
      data.staked_on = Number(response[1]);
      data.rewards = Number(response[3]);
      const apiResponse = await createStake(data);
    } catch (error) {
      console.log("Failed to record stake info:", error);
    }
  }

  function claimStarted() {
    if (claimStart == 0) return false;

    const claimStartDate = new Date(Number(claimStart) * 1000);

    const currentDate = new Date();

    return currentDate >= claimStartDate;
  }

  function convertDate(x) {
    if (x == 0) return 'Not defined yet';

    x = new Date(Number(x) * 1000);
    const date = x.getDate().toString().padStart(2, 0);
    const month = (x.getMonth() + 1).toString().padStart(2, 0);
    const year = x.getFullYear().toString();

    const hours = x.getHours().toString().padStart(2, 0);
    const minutes = x.getMinutes().toString().padStart(2, 0);
    const seconds = x.getSeconds().toString().padStart(2, 0);
    return [date, month, year].join('/') + ' ' + [hours, minutes, seconds].join(':');
  }

  function calcRemainingLockDay(item) {
    const now = Math.floor(new Date().getTime() / 1000);
    const remain = Math.max(Number(item.lockEnd) - now, 0);
    if (remain == 0) return 'End';
    const remainDays = Math.floor(remain / 86400);
    const remainHours = Math.floor((remain - remainDays * 86400) / 3600);
    return (remainHours > 0 ? `${remainDays} days ` : '') + `${remainHours} hours`;
  }

  function getDurationMonth(item) {
    return Math.round((Number(item.lockEnd) - Number(item.lockOn)) / (30 * 86400));
  }

  function getAPYFromMonth(item) {
    const duration = Math.round((Number(item.lockEnd) - Number(item.lockOn)) / (30 * 86400));
    let apy = 0;
    switch (duration) {
      case 3:
        apy = 10;
        break;
      case 6:
        apy = 25;
        break;
      case 9:
        apy = 35;
        break;
      case 12:
        apy = 50;
        break;
      default:
        break;
    }
    return apy;
  }

  return (
    <main className="py-12 px-24">
      <div>
        <div className='flex items-center'>
          <div className={(claimStarted() ? `bg-green-800` : `bg-red-800`) + ` rounded-full w-4 h-4 mr-3`}></div>
          {claimStarted() ? <span className="text-lg font-bold">Claiming is enabled.</span> : <span className="text-lg font-bold">Claiming is Disabled</span>}
          <span className="mx-4">|</span>
          <div>Claiming is available from: <span className="font-bold">{convertDate(claimStart)}</span></div>
        </div>
        <div className='flex items-center mt-4'>
          <div>Claimable Amount: <span className="font-bold">{claimableAmount}</span> {symbol}</div>
        </div>
        <div className='flex mt-4'>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Claim Amount</label>
            <div className='flex'>
              <input
                type="number"
                className="block w-64 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
                onChange={e => setClaimAmount(e.target.value)}
                placeholder='Enter the amount of token to claim'
              />
              <button className="ml-4 py-2 px-4 bg-blue-700 hover:bg-blue-500 rounded text-white" onClick={claimToken}>Claim</button>
            </div>
          </div>
        </div>
        <div className='flex mt-4'>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Staking Amount</label>
            <input
              type="number"
              className="block w-64 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
              onChange={e => setStakeFromClaimingAmount(e.target.value)}
              placeholder="Enter the amount of token to stake"
            />
          </div>
          <div className='ml-2'>
            <label className="block mb-2 text-sm font-medium text-gray-900">Staking Duration</label>
            <div className='flex'>
              <select
                className="block w-48 p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                defaultValue="0"
                onChange={e => setDurationFromClaiming(e.target.value)}
              >
                <option value="0">Choose a Duration</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="9">9 Months</option>
                <option value="12">12 Months</option>
              </select>
              <button className="ml-4 py-2 px-4 bg-blue-700 hover:bg-blue-500 rounded text-white" onClick={stakeFromClaiming}>Stake</button>
            </div>
          </div>
        </div>
      </div>
      <hr className="my-5" />
      <div>
        <div className='flex items-center'>
          <div className={(stakingEnabled ? `bg-green-800` : `bg-red-800`) + ` rounded-full w-4 h-4 mr-3`}></div>
          {stakingEnabled ? <span className="text-lg font-bold">Staking is Enabled</span> : <span className="text-lg font-bold">Staking is Disabled</span>}
          <span className="mx-4">|</span>
          <div>Token Balance: <span className="font-bold">{tokenBalance !== undefined ? tokenBalance : ''}</span> {symbol}</div>
        </div>
        <div className='flex mt-4'>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Staking Amount</label>
            <input
              type="number"
              className="block w-64 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
              onChange={e => setStakeAmount(e.target.value)}
              placeholder="Enter the amount of token to stake"
            />
          </div>
          <div className='ml-2'>
            <label className="block mb-2 text-sm font-medium text-gray-900">Staking Duration</label>
            <div className='flex'>
              <select
                className="block w-48 p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                defaultValue="0"
                onChange={e => setDuration(e.target.value)}
              >
                <option value="0">Choose a Duration</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="9">9 Months</option>
                <option value="12">12 Months</option>
              </select>
              <button className="ml-4 py-2 px-4 bg-blue-700 hover:bg-blue-500 rounded text-white" onClick={stakeToken}>Stake</button>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <table className="w-full text-sm text-left rtl:text-right text-gray-400 dark:text-gray-400">
            <thead className="text-xs text-gray-900 uppercase bg-gray-200 text-center">
              <tr>
                <th scope="col" className="px-6 py-3">No</th>
                <th scope="col" className="px-6 py-3">Staked Amount</th>
                <th scope="col" className="px-6 py-3">Start Time</th>
                <th scope="col" className="px-6 py-3">Duration</th>
                <th scope="col" className="px-6 py-3">Remaining</th>
                <th scope="col" className="px-6 py-3">APY</th>
                <th scope="col" className="px-6 py-3">Reward</th>
                {/* <th scope="col" className="px-6 py-3">Trx Hash</th> */}
                <th scope="col" className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {
                stakingArray.length > 0 ? stakingArray.map((item, index) => {
                  return (
                    <tr className="bg-white border-b text-center font-medium text-gray-900 whitespace-nowrap" key={index}>
                      <td className="px-6 py-3">
                        {(Number(page) - 1) * Number(limit) + index + 1}
                      </td>
                      <td className="px-6 py-3">
                        {formatUnits(String(item.amount), decimals)} {symbol}
                      </td>
                      <td className="px-6 py-3">
                        {convertDate(item.lockOn)}
                      </td>
                      <td className="px-6 py-3">
                        {getDurationMonth(item)} Months
                      </td>
                      <td className="px-6 py-3">
                        {calcRemainingLockDay(item)}
                      </td>
                      <td className="px-6 py-3">
                        {getAPYFromMonth(item)} %
                      </td>
                      <td className="px-6 py-3">
                        {formatUnits(String(item.rewards), decimals)} {symbol}
                      </td>
                      {/* <td className="px-6 py-3">
                        { shortenAddress(item.trx_hash) }
                      </td> */}
                      <td className="px-6 py-3">
                        {
                          Number(item.amount) > 0 ? (
                            <button className='text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-xs px-2 py-1 text-center' onClick={() => withdrawStake((Number(page) - 1) * Number(limit) + index)}>Withdraw</button>
                          ) : <></>
                        }
                        {
                          Number(item.rewards) > 0 ? (
                            <button className='text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-xs px-2 py-1 text-center ml-1' onClick={() => claimRewards((Number(page) - 1) * Number(limit) + index)}>Rewards</button>
                          ) : <></>
                        }
                      </td>
                    </tr>
                  )
                }) : <tr><td colSpan="8" className="text-lg text-gray-900 text-center py-2 border-b-2">There is no data</td></tr>
              }
            </tbody>
          </table>
          <div className='flex mt-3 items-center justify-end'>
            <span>Page: </span> 
            <input
              type="number"
              className="block w-12 px-2 py-1 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 ml-1"
              onChange={e => setPage(e.target.value)}
              value={page}
            />
            <span className='ml-2'>Per page: </span> 
            <select
              className="block w-24 px-2 py-1 bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 ml-1"
              defaultValue="10"
              onChange={e => setLimit(e.target.value)}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      {
        claimContractOwner != '' && claimContractOwner == address ? (
          <>
            <hr className="my-5" />
            <div className="text-lg font-bold my-4">Claiming Contract Owner Functions</div>
            <div>
              <div className='flex mt-4'>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Set Claim Start</label>
                  <div className='flex'>
                    <input
                      className="block w-64 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
                      onChange={e => setUpdateClaimStart(e.target.value)}
                      placeholder='YYYY-MM-DD HH:MI:SS'
                    />
                    <button className="ml-4 py-2 px-4 bg-blue-700 hover:bg-blue-500 rounded text-white" onClick={updateClaimStartDate}>Update Claim Start</button>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex mt-4'>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Address to set claim info</label>
                <input
                  type="text"
                  className="block w-64 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
                  onChange={e => setClaimInfoAddress(e.target.value)}
                  placeholder="Enter the address"
                />
              </div>
              <div className='ml-2'>
                <label className="block mb-2 text-sm font-medium text-gray-900">Amount to set claim info</label>
                <div className='flex'>
                  <input
                    type="number"
                    className="block w-64 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
                    onChange={e => setClaimInfoAmount(e.target.value)}
                    placeholder="Enter the amount"
                  />
                  <button className="ml-4 py-2 px-4 bg-blue-700 hover:bg-blue-500 rounded text-white" onClick={setClaimInfo}>Set Claim Info</button>
                </div>
              </div>
            </div>
          </>
        ) : <></>
      }
    </main>
  )
}