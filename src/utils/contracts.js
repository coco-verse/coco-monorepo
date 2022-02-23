import { addresses } from "./../contracts";
import { utils, Contract } from "ethers";
import GroupRouterAbi from "../contracts/abis/GroupRouter.json";
import GroupProxyFactoryAbi from "../contracts/abis/GroupProxyFactory.json"; // TODO change it GroupProxyFactoryAbi
import GroupAbi from "../contracts/abis/Group.json";
import ERC20Abi from "../contracts/abis/ERC20.json";

export const groupProxyFactoryInterface = new utils.Interface(
	GroupProxyFactoryAbi
);
export const erc20Interface = new utils.Interface(ERC20Abi);
export const groupInterface = new utils.Interface(GroupAbi);

export const groupProxyFactoryContract = new Contract(
	addresses.GroupProxyFactory,
	groupProxyFactoryInterface
);

export const groupRouterContract = new Contract(
	addresses.GroupRouter,
	new utils.Interface(GroupRouterAbi)
);

export const erc20Contract = (erc20Address) =>
	erc20Address ? new Contract(erc20Address, erc20Interface) : undefined;
export const groupContract = (address) =>
	address ? new Contract(address, groupInterface) : undefined;
