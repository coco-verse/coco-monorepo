import { useContractFunction, useSendTransaction } from '@usedapp/core';
import { groupRouterContract, erc20Contract, groupContract } from '../utils';

export function useCreateAndChallengeMarket() {
  const { state, send } = useContractFunction(groupRouterContract, 'createAndChallengeMarket');
  return { state, send };
}

export function useChallenge() {
  const { state, send } = useContractFunction(groupRouterContract, 'challenge');
  return { state, send };
}

export function useBuyMinOutcomeTokensWithFixedAmount() {
  const { state, send } = useContractFunction(groupRouterContract, 'buyMinOutcomeTokensWithFixedAmount');
  return { state, send };
}

export function useRedeem(groupAddress) {
  const { state, send } = useContractFunction(groupContract(groupAddress), 'redeem');
  return { state, send };
}

export function useERC1155SetApprovalForAll(groupAddress) {
  const { state, send } = useContractFunction(groupContract(groupAddress), 'setApprovalForAll');

  return {
    state,
    send,
  };
}

export function useERC20Approve(erc20Address) {
  const { state, send } = useContractFunction(erc20Contract(erc20Address), 'approve');
  return {
    state,
    send,
  };
}

export function useDepositEthToWeth() {
  const { state, sendTransaction } = useSendTransaction({
    transactionName: 'Deposit ETH',
  });
  return { state, sendTransaction };
}
