import { useCall } from "@usedapp/core";
import {
	erc20Contract,
	groupContract,
} from "../utils";

export function useERC20TokenBalance(account, erc20Address) {
	const { value } =
		useCall(
			account &&
				erc20Address && {
					contract: erc20Contract(erc20Address),
					method: "balanceOf",
					args: [account],
				}
		) ?? {};
	return value ? value[0] : undefined;
}

export function useERC20TokenAllowance(erc20Address, account, routerAddress) {
	const { value } =
		useCall(
			account &&
				erc20Address &&
				routerAddress && {
					contract: erc20Contract(erc20Address),
					method: "allowance",
					args: [account, routerAddress],
				}
		) ?? {};
	return value ? value[0] : undefined;
}

export function useERC1155ApprovalForAll(groupAddress, account, routerAddress) {
	const { value } =
		useCall(
			account &&
				groupAddress &&
				routerAddress && {
					contract: groupContract(groupAddress),
					method: "isApprovedForAll",
					args: [account, routerAddress],
				}
		) ?? {};
	return value ? value[0] : undefined;
}
