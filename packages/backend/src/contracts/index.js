import dotenv from 'dotenv';
dotenv.config();
import log from 'loglevel';
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'trace');
import { ethers } from 'ethers';
import addresses_test from './addresses-test.json';

// TODO make this env dependent
export const addresses = addresses_test;

export const web3Provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_URL);

// abis
const groupContractAbi = [
  {
    type: 'constructor',
    inputs: [],
  },
  {
    type: 'function',
    name: 'S_ID',
    inputs: [],
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'cReserves',
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'challenge',
    inputs: [
      {
        internalType: 'uint8',
        name: '_for',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: 'marketIdentifier',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'collateralToken',
    inputs: [],
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'createMarket',
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketIdentifier',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'challenger',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'donReservesLimit',
    inputs: [],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getStakingIds',
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketIdentifier',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_of',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'bytes32',
        name: 'sId0',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'sId1',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'globalConfig',
    inputs: [],
    outputs: [
      {
        internalType: 'uint64',
        name: 'fee',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'donBuffer',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'resolutionBuffer',
        type: 'uint64',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'manager',
    inputs: [],
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'marketDetails',
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        internalType: 'address',
        name: 'tokenC',
        type: 'address',
      },
      {
        internalType: 'uint64',
        name: 'fee',
        type: 'uint64',
      },
      {
        internalType: 'uint8',
        name: 'outcome',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'marketReserves',
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        name: 'reserve0',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'reserve1',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'marketStakeInfo',
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        internalType: 'address',
        name: 'staker0',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'staker1',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'lastAmountStaked',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'marketStates',
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        internalType: 'uint64',
        name: 'donBufferEndsAt',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'resolutionBufferEndsAt',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'donBuffer',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'resolutionBuffer',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'redeem',
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketIdentifier',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setOutcome',
    inputs: [
      {
        internalType: 'uint8',
        name: 'outcome',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: 'marketIdentifier',
        type: 'bytes32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'stakes',
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'updateCollateralToken',
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateDonReservesLimit',
    inputs: [
      {
        internalType: 'uint256',
        name: 'newLimit',
        type: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateGlobalConfig',
    inputs: [
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
      {
        internalType: 'uint64',
        name: 'fee',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'donBuffer',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'resolutionBuffer',
        type: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateManager',
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'Challenged',
    inputs: [
      {
        name: 'marketIdentifier',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'by',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'outcome',
        type: 'uint8',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ConfigUpdated',
    inputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MarketCreated',
    inputs: [
      {
        name: 'marketIdentifier',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'creator',
        type: 'address',
        indexed: false,
      },
      {
        name: 'challenger',
        type: 'address',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OutcomeSet',
    inputs: [
      {
        name: 'marketIdentifier',
        type: 'bytes32',
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Redeemed',
    inputs: [
      {
        name: 'marketIdentifier',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'by',
        type: 'address',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AmountNotDouble',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BalanceError',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CreateMarketAmountsMismatch',
    inputs: [],
  },
  {
    type: 'error',
    name: 'GroupInActive',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidChallengeCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidFee',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidOutcome',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidRedeemCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidSetOutcomeCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MarketExists',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OutcomeNotSet',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UnAuthenticated',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroAmount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroManagerAddress',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroPeriodBuffer',
    inputs: [],
  },
];

export function getGroupContractInstance(groupAddress) {
  return new ethers.Contract(groupAddress, groupContractAbi, web3Provider);
}

export async function getMarketState(groupAddress, marketIdentifier) {
  try {
    const groupContract = await getGroupContractInstance(groupAddress);
    const marketStateArr = await groupContract.marketStates(marketIdentifier);

    return {
      donBufferEndsAt: new Date(Number(marketStateArr[0].toString()) * 1000),
      resolutionBufferEndsAt: new Date(Number(marketStateArr[1].toString()) * 1000),
      donBuffer: marketStateArr[2].toString(),
      resolutionBuffer: marketStateArr[3].toString(),
    };
  } catch (e) {
    log.debug(
      `[ERROR] [getMarketState] groupAddress=${groupAddress} marketIdentifier=${marketIdentifier}; fetch market state failed with error=${e}`
    );
  }
}

export async function getMarketDetails(groupAddress, marketIdentifier) {
  try {
    const groupContract = await getGroupContractInstance(groupAddress);
    const marketDetailsArr = await groupContract.marketDetails(marketIdentifier);
    return {
      cToken: marketDetailsArr[0],
      fee: ethers.utils.formatUnits(marketDetailsArr[1], 18),
      outcome: marketDetailsArr[2].toString(),
    };
  } catch (e) {
    log.debug(
      `[ERROR] [getMarketDetails] groupAddress=${groupAddress} marketIdentifier=${marketIdentifier}; fetch market details failed with error=${e}`
    );
  }
}
