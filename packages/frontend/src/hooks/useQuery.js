import { useQuery } from "urql";

const QueryGroupsByManagers = `
	query ($managers: [Bytes!]!) {
		groups(where:{manager_in:$managers}){
			id
			groupFactory
			fee
			donBuffer
			resolutionBuffer
			isActive
			donReservesLimit
			collateralToken
			manager
			markets
		}
	}
`;

const QueryMarketsInResolutionByGroups = `
	query ($groups:[Bytes!]!, $timestamp: Int!){
		markets(where:{group_in:$groups, resolutionBufferEndsAt_gte:$timestamp}, orderBy:resolutionBufferEndsAt, orderDirection:asc){
			id
			marketIdentifier
			reserve0
			reserve1
			donBufferEndsAt
			donBuffer
			resolutionBufferEndsAt
			resolutionBuffer
			staker0
			staker1
			lastAmountStaked
			tokenC
			fee
			outcome
			donEscalationCount
		}
	}
`;

const QueryGroupById = `
	query ($groupId: ID!) {
		group(id: $groupId){
			id
			groupFactory
			fee
			donBuffer
			resolutionBuffer
			isActive
			donReservesLimit
			collateralToken
			manager
			markets
		}
	}
`;

const QueryMarketByMarketIdentifier = `
	query ($marketIdentifier: Bytes!) {
		market(id:$marketIdentifier){
			id
			group {
				id
				manager
			}
			marketIdentifier
			reserve0
			reserve1
			donBufferEndsAt
			donBuffer
			resolutionBufferEndsAt
			resolutionBuffer
			staker0
			staker1
			lastAmountStaked
			tokenC
			fee
			outcome
			donEscalationCount
			stakes {
				id
				user {
					id
				}
				donEscalationIndex
				amount
				outcome
			}
		}
	}
`;

const QueryUserPositionsByMarketIdentifier = `
	query($user: Bytes!, $marketIdentifier: Bytes!) {
		userPositions(where: {user: $user, market: $marketIdentifier}){
			id
			stakeId0
			stakeId1
			amount0
			amount1
		}
	}
`;

const QueryUserMarketsAndPositions = `
	query($user: Bytes!) {
		user(id: $user){
			markets{
				market{
					marketIdentifier
				}
			}
			positions{
				market{
					marketIdentifier
					outcome
					resolutionBufferEndsAt
					donBufferEndsAt
					staker0
					staker1
					reserve0
					reserve1
				}
				amount0
				amount1
			}
		}
	}
`;

const QueryBadMarketIdentifiers = `
	query{
		markets(where:{outcome:0}){
			marketIdentifier
		}
	}
`;

const QueryExploreMarkets = `
	query ($first: Int!, $skip: Int!, $timestamp: BigInt!) {
		markets(first: $first, skip: $skip, orderBy: totalVolume, orderDirection: desc, where:{timestamp_gt: $timestamp}){
			id
			creator
			eventIdentifier
			marketIdentifier
			outcomeReserve0
			outcomeReserve1
			probability0
			probability1
			stakingReserve0
			stakingReserve1
			tokenC
			feeNumerator
			feeDenominator
			fee
			expireAtBlock
			donBufferEndsAtBlock
			resolutionEndsAtBlock
			donBufferBlocks
			resolutionBufferBlocks
			donEscalationCount
			donEscalationLimit
			outcome
			stage
			staker0
			staker1
			lastAmountStaked
			lastOutcomeStaked
			timestamp
			tradeVolume
			stakeVolume
			totalVolume
			lastActionTimestamp
			oracle {
     			id
    		}
		}
	}
`;

const QueryMarketsByOracles = `
	query ($first: Int!, $skip: Int!, $oracles: [String!]!) {
		markets(first: $first, skip: $skip, where:{oracle_in: $oracles}, orderBy: timestamp, orderDirection: desc) {
			id
			creator
			eventIdentifier
			marketIdentifier
			outcomeReserve0
			outcomeReserve1
			probability0
			probability1
			stakingReserve0
			stakingReserve1
			tokenC
			feeNumerator
			feeDenominator
			fee
			expireAtBlock
			donBufferEndsAtBlock
			resolutionEndsAtBlock
			donBufferBlocks
			resolutionBufferBlocks
			donEscalationCount
			donEscalationLimit
			outcome
			stage
			staker0
			staker1
			lastAmountStaked
			lastOutcomeStaked
			timestamp
			oracle{
     			id
    		}
			tradeVolume
			stakeVolume
			totalVolume
		}
	}
`;

const QueryMarketsAtStage3ByOracles = `
	query ($oracles: [Bytes!]!) {
		markets(where: {oracle_in: $oracles, stage: 3}) {
			id
			creator
			eventIdentifier
			marketIdentifier
			outcomeReserve0
			outcomeReserve1
			probability0
			probability1
			stakingReserve0
			stakingReserve1
			tokenC
			feeNumerator
			feeDenominator
			fee
			expireAtBlock
			donBufferEndsAtBlock
			resolutionEndsAtBlock
			donBufferBlocks
			resolutionBufferBlocks
			donEscalationCount
			donEscalationLimit
			outcome
			stage
			staker0
			staker1
			lastAmountStaked
			lastOutcomeStaked
			timestamp
			oracle{
     			id
    		}
			oToken0Id
			oToken1Id
			sToken0Id
			sToken1Id
			tradeVolume
			stakeVolume
			totalVolume
		}
	}
`;

const QueryMarketTradeAndStakeInfoByUser = `
	query ($user: Bytes!, $marketIdentifier: Bytes!){
			tradeHistories(where:{user: $user, market: $marketIdentifier}, orderBy: tradeIndex, orderDirection: desc){
				id
				amount0
				amount1
				amountC
				buy
				timestamp
				tradeIndex
			}
			stakeHistories(where: {market: $marketIdentifier}, orderBy: stakeIndex, orderDirection: desc){
				id
				user {
					id
				}
				amountC
				outcomeStaked
				timestamp
				stakeIndex
			}

			tokenBalances(where:{user: $user, market: $marketIdentifier}){
				id
				user
				oracle
				market
				tokenId
				balance
			}
		}
`;

const QueryOraclesByManager = `
  query ($manager: Bytes!) {
	oracles(where:{manager: $manager}){
		id
		delegate
		manager
		collateralToken
		isActive
		feeNumerator
		feeDenominator
		donEscalationLimit
		expireBufferBlocks
		donBufferBlocks
		resolutionBufferBlocks
		factory
	}
  }
`;

const QueryMarketsByUserInteraction = `
  query ($user: Bytes!) {
	user(id: $user){
		markets(orderBy: timestamp, orderDirection: desc){
			market{
				id
				marketIdentifier
				creator
				eventIdentifier
				marketIdentifier
				outcomeReserve0
				outcomeReserve1
				probability0
				probability1
				stakingReserve0
				stakingReserve1
				tokenC
				feeNumerator
				feeDenominator
				fee
				expireAtBlock
				donBufferEndsAtBlock
				resolutionEndsAtBlock
				donBufferBlocks
				resolutionBufferBlocks
				donEscalationCount
				donEscalationLimit
				outcome
				stage
				staker0
				staker1
				lastAmountStaked
				lastOutcomeStaked
				timestamp
				oracle{
					id
				}
				oToken0Id
				oToken1Id
				sToken0Id
				sToken1Id
				tradeVolume
				stakeVolume
				totalVolume
			}
		}
	}
  }
`;

const QueryTokenApprovalsByUserAndOracle = `
  query ($user: Bytes!, $oracle: Bytes) {
	tokenApprovals(where:{user: $user, oracle: $oracle}){
		id
		user
		oracle
		operator
		approved
	}
  }
`;

const QueryTokenBalancesByUser = `
  query ($user: Bytes!) {
	  tokenBalances(where:{user: $user}){
		id
		user
		oracle
		market
		tokenId
		balance
	}
  }
`;

const QueryAllOracles = `
  query {
    oracles{
        id
    }
  }
`;

const QueryOracleByDelegate = `
  query ($delegate: Bytes!) {
    oracles(where:{delegate: $delegate }){
        id,
        delegate
    }
  }
`;

const QueryOracleById = `
  query ($id: String!){
    oracle(id:$id){
		id
		delegate
		manager
		collateralToken
		isActive
		feeNumerator
		feeDenominator
		donEscalationLimit
		expireBufferBlocks
		donBufferBlocks
		resolutionBufferBlocks
		tokenBalances
		factory
    }
  }
`;

const QueryFeedByModeratorList = `
  query ($moderators: [Bytes!]!){
    markets(where:{creator_in:$moderators}) {
        id
        factory {
        id
        }
        creator
        oracle
      }
    }
`;

export function useQueryGroupsByManagers(managers, pause) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryGroupsByManagers,
		variables: {
			managers,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryMarketsInResolutionByGroups(groups, timestamp, pause) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryMarketsInResolutionByGroups,
		variables: {
			groups,
			timestamp,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryUserMarketsAndPositions(user, pause) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryUserMarketsAndPositions,
		variables: {
			user,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryGroupById(groupId, pause) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryGroupById,
		variables: {
			groupId,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryBadMarketIdentifiers(pause) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryBadMarketIdentifiers,
		variables: {},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryUserPositionsByMarketIdentifier(
	user,
	marketIdentifier,
	pause
) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryUserPositionsByMarketIdentifier,
		variables: {
			user,
			marketIdentifier,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryExploreMarkets(first, skip, timestamp, pause) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryExploreMarkets,
		variables: {
			first,
			skip,
			timestamp,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryMarketByOracles(first, skip, oracles, pause) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryMarketsByOracles,
		variables: {
			first,
			skip,
			oracles,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryMarketsOrderedByLatest() {
	const [result, reexecuteQuery] = useQuery({
		query: QueryExploreMarkets,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryMarketByMarketIdentifier(
	marketIdentifier,
	pause = false
) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryMarketByMarketIdentifier,
		variables: {
			marketIdentifier,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryMarketTradeAndStakeInfoByUser(
	marketIdentifier,
	user,
	pause = false
) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryMarketTradeAndStakeInfoByUser,
		variables: {
			user,
			marketIdentifier,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryTokenApprovalsByUserAndOracle(
	user,
	oracle,
	pause = false
) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryTokenApprovalsByUserAndOracle,
		variables: {
			user,
			oracle,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryOraclesByManager(manager, pause = false) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryOraclesByManager,
		variables: { manager },
		pause,
	});
	return { result, reexecuteQuery };
}

export function useQueryMarketsAtStage3ByOracles(oracles, pause = false) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryMarketsAtStage3ByOracles,
		variables: { oracles },
		pause,
	});
	return { result, reexecuteQuery };
}

export function useQueryMarketsByUserInteraction(user, pause = false) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryMarketsByUserInteraction,
		variables: { user },
		pause,
	});
	return { result, reexecuteQuery };
}
export function useQueryTokenBalancesByUser(user, pause = false) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryTokenBalancesByUser,
		variables: { user },
		pause,
	});
	return { result, reexecuteQuery };
}

export function useQueryOracleById(id, pause = false) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryOracleById,
		variables: { id },
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

/**
 * Below are the old ones
 */

export function useQueryAllOracles() {
	const [result, reexecuteQuery] = useQuery({
		query: QueryAllOracles,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryOracleByDelegate(delegateAddress) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryOracleByDelegate,
		variables: { delegate: delegateAddress },
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryFeedByModeratorList(moderators, pause = false) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryFeedByModeratorList,
		variables: { moderators },
	});
	return {
		result,
		reexecuteQuery,
	};
}
