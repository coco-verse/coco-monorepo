import { useContractCall } from "@usedapp/core/packages/core";
import { erc20Interface, groupInterface } from "../utils";

export function useERC20TokenBalance(account, erc20Address) {
	const [tokenBalance] =
		useContractCall(
			account &&
				erc20Address && {
					abi: erc20Interface,
					address: erc20Address,
					method: "balanceOf",
					args: [account],
				}
		) ?? [];
	return tokenBalance;
}

export function useERC20TokenAllowance(erc20Address, account, routerAddress) {
	const [allowance] =
		useContractCall(
			account &&
				erc20Address &&
				routerAddress && {
					abi: erc20Interface,
					address: erc20Address,
					method: "allowance",
					args: [account, routerAddress],
				}
		) ?? [];
	return allowance;
}

export function useERC1155ApprovalForAll(groupAddress, account, routerAddress) {
	const [approval] =
		useContractCall(
			account &&
				groupAddress &&
				routerAddress && {
					abi: groupInterface,
					address: groupAddress,
					method: "isApprovedForAll",
					args: [account, routerAddress],
				}
		) ?? [];
	return approval;
}
