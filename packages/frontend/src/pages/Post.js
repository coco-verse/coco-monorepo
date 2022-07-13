/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Text, Flex, Spacer, NumberInput, NumberInputField, useToast, Heading } from '@chakra-ui/react';

import { useEthers } from '@usedapp/core';
import { useEffect, useMemo } from 'react';
import { useState } from 'react';
import {
  useChallenge,
  useCreateAndChallengeMarket,
  useERC20TokenAllowanceWrapper,
  useERC20TokenBalance,
  useQueryMarketByMarketIdentifier,
  useQueryUserPositionsByMarketIdentifier,
  useRedeem,
} from '../hooks';
import {
  formatTimeInSeconds,
  ZERO_BN,
  useBNInput,
  formatBNToDecimalCurr,
  formatBNToDecimal,
  TWO_BN,
  ONE_BN,
  parseDecimalToBN,
  formatMarketData,
  calculateRedeemObj,
  COLORS,
  GRAPH_BUFFER_MS,
  findSubmissionsByIdentifiers,
  SUBMISSION_STATUS,
  CREATION_AMOUNT,
  initialiseSubmission,
  postSignTypedDataV4Helper,
} from '../utils';
import { useParams } from 'react-router';
import PrimaryButton from '../components/PrimaryButton';
import ChallengeHistoryTable from '../components/ChallengeHistoryTable';
import { configs } from '../contracts';
import ApprovalInterface from '../components/ApprovalInterface';
import TwoColTitleInfo from '../components/TwoColTitleInfo';
import HelpBox from '../components/HelpBox';
import parse from 'html-react-parser';

function Page() {
  const urlParams = useParams();
  const postId = urlParams.postId ? urlParams.postId : undefined;
  // const postId =
  // "0x2253b09d76641e6205c4ed36f448154a23dbeeb60ed3259edcf9adb23a0363a0";

  const { account } = useEthers();

  const toast = useToast();

  // TODO: - You might need to trigger this
  const { result: rUserPositions, reexecuteQuery: reUserPositions } = useQueryUserPositionsByMarketIdentifier(
    account ? account.toLowerCase() : undefined,
    postId,
    false
  );

  const [post, setPost] = useState(null);
  // main market data
  // contains a flag whether it is on-chain or off-chain
  const [marketData, setMarketData] = useState(null);

  // state of the market
  // 0 -> hasn't been created
  // 1 -> buffer period
  // 2 -> resolution period
  // 3 -> expired
  const [marketState, setMarketState] = useState(0);

  // challenge states
  const [groupAddress, setGroupAddress] = useState(null);
  const [marketIdentifier, setMarketIdentifier] = useState(null);
  const [temporaryOutcome, setTemporaryOutcome] = useState(1);
  const [currentAmountBn, setCurrentAmountBn] = useState(ZERO_BN);
  const [timeLeftToChallenge, setTimeLeftToChallenge] = useState(null);
  const [timeLeftToResolve, setTimeLeftToResolve] = useState(null);

  // state for redeem
  // user's stakes
  const [userPositions, setUserPositions] = useState(null);

  // State for set outcome propose tx,
  // if user is one of the moderators
  // const [chosenOutcome, setChosenOutcome] = useState(null);

  // stake history
  const [stakes, setStakes] = useState([]);

  const { input, bnValue, setInput, err, errText } = useBNInput(validateInput);

  // contract function calls
  const { send: sendCreateAndChallenge, state: stateCreateAndChallenge } = useCreateAndChallengeMarket();
  const { send: sendChallenge, state: stateChallenge } = useChallenge();
  const { send: sendRedeem, state: stateRedeem } = useRedeem(groupAddress);

  const { result, reexecuteQuery } = useQueryMarketByMarketIdentifier(postId, false);

  // check WETH balance and allowance
  const wETHTokenBalance = useERC20TokenBalance(account, configs.Token);
  const wETHTokenAllowance = useERC20TokenAllowanceWrapper(
    configs.Token,
    account,
    configs.GroupRouter,
    bnValue.isZero() ? CREATION_AMOUNT : bnValue
  );

  // get safes & groups managed by the user
  // const { safes, groupIds } = useGetSafesAndGroupsManagedByUser(account);

  // flag indicates whether post's
  // groupAddress is managed
  // by the user
  // const isUserAnOwner =
  // 	groupIds.find(
  // 		(id) =>
  // 			post != undefined &&
  // 			id.toLowerCase() == post.groupAddress.toLowerCase()
  // 	) != undefined
  // 		? true
  // 		: false;

  // loading state of contract fn calls
  const [contractFnCallLoading, setContractFnCallLoading] = useState(false);
  const [intialiseLoading, setInitialiseLoading] = useState(false);

  // Should run whenever result or post info updates.
  useEffect(() => {
    // return if initial challenge isn't present
    if (
      post == undefined ||
      post.initStatus == undefined ||
      post.initStatus == SUBMISSION_STATUS.UNINITIALIZED ||
      post.initStatus == SUBMISSION_STATUS.DUMPED
    ) {
      // uninitialized or dumped
      setMarketState(0);
      return;
    }
    if (result.data && result.data.market) {
      // check whether market exists on chain
      // market exists on chain
      const _marketData = formatMarketData(result.data.market, true);

      setGroupAddress(_marketData.group.id);
      setMarketIdentifier(_marketData.marketIdentifier);
      setTemporaryOutcome(_marketData.outcome);
      setCurrentAmountBn(_marketData.lastAmountStaked);

      // set market state and, if applicable, time left for either challenge or resolution
      const timestamp = new Date() / 1000;

      if (_marketData.donBufferEndsAt - timestamp > 0) {
        // state is in buffer period
        setMarketState(2);
        setTimeLeftToChallenge(_marketData.donBufferEndsAt - timestamp);
      } else if (_marketData.resolutionBufferEndsAt - timestamp > 0) {
        // state is in resolution period
        setMarketState(3);
        setTimeLeftToResolve(_marketData.resolutionBufferEndsAt - timestamp);
      } else {
        // state expired
        setMarketState(4);
      }

      // set stakes history
      setStakes(_marketData.stakes);

      // set min amount to challenge as input amount
      setInput(formatBNToDecimal(_marketData.lastAmountStaked.mul(TWO_BN)));

      // set market data
      setMarketData({
        ..._marketData,
        onChain: true,
      });
    } else if (post != null) {
      // market does not exists on chain
      // populate challenge using creator's market data obj
      const _marketData = formatMarketData(JSON.parse(post.challengeData), false);

      setGroupAddress(_marketData.group);
      setMarketIdentifier(_marketData.marketIdentifier);
      setTemporaryOutcome(1);
      setCurrentAmountBn(_marketData.amount1);

      // set market state to 1
      setMarketState(1);

      // set min amount to challenge as input amount
      setInput(formatBNToDecimal(_marketData.amount1.mul(TWO_BN)));

      // set market data
      setMarketData({
        ..._marketData,
        onChain: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, post]);

  // set user postions
  useEffect(() => {
    if (rUserPositions.data && rUserPositions.data.userPositions.length != 0) {
      setUserPositions({
        ...rUserPositions.data.userPositions[0],
        amount0: parseDecimalToBN(rUserPositions.data.userPositions[0].amount0),
        amount1: parseDecimalToBN(rUserPositions.data.userPositions[0].amount1),
      });
    }
  }, [rUserPositions]);

  // get post details using postId;
  // note: postId == marketIdentifier
  useEffect(() => {
    (async () => {
      const res = await findSubmissionsByIdentifiers([postId]);
      if (res == undefined || res.submissions.length == 0) {
        // TODO set error
        return;
      }

      setPost(res.submissions[0]);
      // setLinkMetadata(res.posts[0].metadata);
    })();
  }, [postId]);

  // tracks loading state of contract fn calls
  useMemo(() => {
    if (
      stateCreateAndChallenge.status == 'Success' ||
      stateChallenge.status == 'Success' ||
      stateRedeem.status == 'Success'
    ) {
      setTimeout(() => {
        setContractFnCallLoading(false);
        window.location.reload();
      }, GRAPH_BUFFER_MS);
    } else if (
      stateCreateAndChallenge.status == 'Fail' ||
      stateChallenge.status == 'Fail' ||
      stateRedeem.status == 'Fail' ||
      stateCreateAndChallenge.status == 'Exception' ||
      stateChallenge.status == 'Exception' ||
      stateRedeem.status == 'Exception'
    ) {
      toast({
        title: 'Metamask err!',
        status: 'error',
        isClosable: true,
      });
      setContractFnCallLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateCreateAndChallenge, stateChallenge, stateRedeem]);

  // whenever wEthBalance changes, refresh the input
  useEffect(() => {
    if (wETHTokenBalance != undefined) {
      setInput(input);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wETHTokenBalance]);

  function validateInput(bnValue) {
    // check bnValue is not zero
    if (bnValue.isZero()) {
      return {
        valid: false,
        expStr: 'Challenge amount should be greater than 0',
      };
    }

    // check bnValue is gte currentAmountBn * 2
    if (!bnValue.gte(currentAmountBn.mul(TWO_BN))) {
      return {
        valid: false,
        expStr: `Challenge amount should be atleast ${formatBNToDecimalCurr(currentAmountBn.mul(TWO_BN))}`,
      };
    }

    // check bnValue is lte tokenBalance
    if (wETHTokenBalance == undefined || !bnValue.lte(wETHTokenBalance)) {
      return {
        valid: false,
        expStr: 'Insufficient Balance',
      };
    }

    return {
      valid: true,
      expStr: '',
    };
  }

  // async function setOutcomeHelper() {
  // 	// throw if user isn't authenticated
  // 	if (!account || isUserAnOwner == false) {
  // 		toast({
  // 			title: "Invalid request!",
  // 			status: "error",
  // 			isClosable: true,
  // 		});
  // 		return;
  // 	}

  // 	// throw if outcome to delare is not chosen
  // 	if (
  // 		chosenOutcome == undefined ||
  // 		chosenOutcome < 0 ||
  // 		chosenOutcome > 1
  // 	) {
  // 		toast({
  // 			title: "Please chose an outcome!",
  // 			status: "error",
  // 			isClosable: true,
  // 		});
  // 		return;
  // 	}

  // 	// throw if any of necessary values are missing
  // 	if (
  // 		marketData.onChain == false ||
  // 		marketData.group.id == undefined ||
  // 		marketData.group.manager == undefined ||
  // 		account == undefined
  // 	) {
  // 		toast({
  // 			title: "Invalid Inputs!",
  // 			status: "error",
  // 			isClosable: true,
  // 		});
  // 		return;
  // 	}

  // 	const calldata = createSetOutcomeTx(chosenOutcome, marketData.id);

  // 	await createSafeTx(
  // 		marketData.group.id,
  // 		calldata,
  // 		0,
  // 		marketData.group.manager,
  // 		account
  // 	);
  // }

  function constructIFrame(url) {
    return `<iframe id="reddit-embed" src="${url}?ref_source=embed&amp;ref=share&amp;embed=true" sandbox="allow-scripts allow-same-origin allow-popups" style="border: none;" height="600" width="600" scrolling="no"></iframe>`;
  }

  async function initialiseMarket() {
    setInitialiseLoading(true);

    try {
      // validate that necessary data is present
      if (post == undefined || account == undefined) {
        toast({
          title: 'Something went wrong!',
          status: 'error',
          isClosable: true,
        });
        throw Error();
      }

      // validate that user has given
      // sufficient token allowance to
      // GroupRouter
      if (wETHTokenAllowance == false) {
        toast({
          title: 'Please give WETH approval to app before proceeding!',
          status: 'error',
          isClosable: true,
        });
        throw Error();
      }

      // validate user has enough balance
      if (wETHTokenBalance == undefined || wETHTokenBalance.lt(CREATION_AMOUNT.add(ONE_BN))) {
        toast({
          title: `min. of 0.05 ${configs.TokenSymbol} required!`,
          status: 'error',
          isClosable: true,
        });
        throw Error();
      }

      // signature for on-chain market
      const { marketData, dataToSign } = postSignTypedDataV4Helper(
        configs.Group,
        post.marketIdentifier,
        CREATION_AMOUNT.toString(),
        configs.chainId
      );
      const accounts = await window.ethereum.enable();
      const marketSignature = await window.ethereum.request({
        method: 'eth_signTypedData_v3',
        params: [accounts[0], dataToSign],
      });

      // initialise the submission
      const res = await initialiseSubmission(
        post.marketIdentifier,
        JSON.stringify(marketData),
        marketSignature,
        configs.Group
      );
      if (res == undefined) {
        toast({
          title: 'Something went wrong!',
          status: 'error',
          isClosable: true,
        });
        throw Error();
      }

      // reload page
      window.location.reload();
    } catch (e) {
      //console.log('initialiseMarket error with - ', e);
      setInitialiseLoading(false);
    }
  }

  return (
    <Flex width={'100%'}>
      <Flex width="70%" flexDirection={'column'} padding={5}>
        {/* {loadingMarket == true ? <Loader /> : undefined} */}
        {/* <PostDisplay post={post} /> */}
        <Flex
          // flexDirection={"column"}
          padding={2}
          backgroundColor={COLORS.PRIMARY}
          borderRadius={8}
          marginBottom={4}
        >
          <Spacer>
            {post && post.submissionPermalink != undefined
              ? parse(constructIFrame(`https://www.redditmedia.com${post.submissionPermalink}`))
              : undefined}
          </Spacer>
        </Flex>
        <ChallengeHistoryTable stakes={stakes} />
      </Flex>
      <Flex width="30%" flexDirection={'column'} paddingTop={5}>
        <Flex flexDirection={'column'} padding={2} backgroundColor={COLORS.PRIMARY} borderRadius={8} marginBottom={4}>
          {post && post.initStatus == SUBMISSION_STATUS.DUMPED ? (
            <Text>Your failed to initialize in time</Text>
          ) : undefined}
          {post && post.initStatus == SUBMISSION_STATUS.UNINITIALIZED ? (
            <>
              <Heading size="sm" marginBottom={2}>
                Initialize Submission
              </Heading>
              <PrimaryButton
                loadingText="Processing..."
                isLoading={intialiseLoading}
                disabled={!account || !wETHTokenAllowance}
                onClick={initialiseMarket}
                title="Initialize"
                style={{
                  marginTop: 5,
                }}
              />
            </>
          ) : undefined}

          {marketState == 1 || marketState == 2 ? (
            <>
              <Heading size="sm" marginBottom={2}>
                Challenge
              </Heading>
              <TwoColTitleInfo title={'Temporary outcome:'} info={temporaryOutcome == 1 ? 'YES' : 'NO'} />
              <TwoColTitleInfo
                title={'Min. Amount to Challenge:'}
                info={`${formatBNToDecimalCurr(currentAmountBn.mul(TWO_BN))}`}
              />
              {timeLeftToChallenge != undefined ? (
                <TwoColTitleInfo
                  title={'Time left to challenge:'}
                  info={`${formatTimeInSeconds(timeLeftToChallenge)}`}
                />
              ) : undefined}
              <NumberInput
                onChange={(val) => {
                  setInput(val);
                }}
                placeholder="Amount"
                fontSize={14}
                value={input}
                marginTop={3}
              >
                <NumberInputField />
              </NumberInput>
              {err == true ? (
                <Text marginTop="1" marginBottom="1" fontSize="10" fontWeight="bold" color="red.300">
                  {errText}
                </Text>
              ) : undefined}
              <PrimaryButton
                loadingText="Processing..."
                isLoading={contractFnCallLoading}
                disabled={!account || !wETHTokenAllowance}
                onClick={() => {
                  if (!account || !wETHTokenAllowance) {
                    return;
                  }

                  const newOutcome = 1 - temporaryOutcome;

                  // validate values
                  if (
                    !validateInput(bnValue).valid ||
                    groupAddress == undefined ||
                    newOutcome > 1 ||
                    newOutcome < 0 ||
                    marketIdentifier == undefined ||
                    marketData == undefined
                  ) {
                    // TODO throw error
                    return;
                  }

                  if (marketData.onChain == true) {
                    // call challenge
                    sendChallenge(groupAddress, marketIdentifier, newOutcome, bnValue);
                  } else {
                    sendCreateAndChallenge(
                      [marketData.group, marketData.marketIdentifier, marketData.amount1],
                      post.challengeDataSignature,
                      0,
                      bnValue
                    );
                  }

                  setContractFnCallLoading(true);
                }}
                title="Challenge"
                style={{
                  marginTop: 5,
                }}
              />
            </>
          ) : undefined}
          {marketState == 3 ? (
            <>
              <Heading size="sm" marginBottom={2}>
                Submission is under review
              </Heading>
              <TwoColTitleInfo title={'Time left for review:'} info={`${formatTimeInSeconds(timeLeftToResolve)}`} />
            </>
          ) : undefined}
          {marketState == 4 ? (
            <>
              <Heading size="sm" marginBottom={2}>
                Submission Resolved
              </Heading>
              <TwoColTitleInfo
                title={'Final outcome:'}
                info={`${temporaryOutcome == 0 ? 'NO' : 'YES'}`}
                marginBottom={1}
              />

              <Text fontSize={14} fontWeight="bold">
                Your challenges
              </Text>
              <TwoColTitleInfo
                title={'In favour of YES:'}
                info={`${formatBNToDecimalCurr(userPositions != undefined ? userPositions.amount1 : ZERO_BN)}`}
              />
              <TwoColTitleInfo
                title={'In favour of NO:'}
                info={`${formatBNToDecimalCurr(userPositions != undefined ? userPositions.amount0 : ZERO_BN)}`}
                marginBottom={1}
              />
              <TwoColTitleInfo
                title={'You win:'}
                info={`${formatBNToDecimalCurr(calculateRedeemObj(marketData, account, userPositions).wins)}`}
              />
              <TwoColTitleInfo
                title={'You get back in total:'}
                info={`${formatBNToDecimalCurr(calculateRedeemObj(marketData, account, userPositions).total)}`}
                marginBottom={1}
              />

              <PrimaryButton
                loadingText="Processing..."
                disabled={!account || calculateRedeemObj(marketData, account, userPositions).total.eq(ZERO_BN)}
                isLoading={contractFnCallLoading}
                onClick={() => {
                  if (!account || calculateRedeemObj(marketData, account, userPositions).total.eq(ZERO_BN)) {
                    return;
                  }

                  if (marketIdentifier == undefined) {
                    return;
                  }

                  sendRedeem(marketIdentifier, account);
                  setContractFnCallLoading(true);
                }}
                title="Redeeem"
                style={{
                  marginTop: 5,
                }}
              />
            </>
          ) : undefined}
        </Flex>
        <ApprovalInterface
          tokenType={0}
          erc20Address={configs.Token}
          erc20AmountBn={bnValue.isZero() ? CREATION_AMOUNT : bnValue}
          onSuccess={() => {
            toast({
              title: 'Success!',
              status: 'success',
              isClosable: true,
            });
          }}
          onFail={() => {
            toast({
              title: 'Metamask err!',
              status: 'error',
              isClosable: true,
            });
          }}
        />

        <HelpBox
          heading={'COCO rules'}
          pointsArr={[
            `1. Reddit submission should always adhere to r/CryptoCurrency rules`,
            `2. Every link posted is supported with initial challenge of amount 0.05 ${configs.TokenSymbol} in favour of "YES" (i.e. the contents of the link follow point (1)). This acts as an incentive for someone that thinks otherwise to challenge the link.`,
            `3. If you think a link violates point (1), then challenge it by favouring "NO" (i.e. link violates point (1)). If you are right, you can potentailly win initial amount put in by link poster.`,
            `4. Subsequent challenges are allowed, as long as they are made before challenge period expires and amount put in is 2x the amount put in the last challenge.`,
            `5. If a challenge does not receives a challenge before time period expired, then the outcome favoured by the challenge is set as the final outcome`,
            `6. If total volume put in for challenges related to a link reach 50 WETH, the moderation committee steps in to declare the final outcome`,
            `7. Once final outcome is set, the last one to challenge in favour of final outcome wins the entire amount put in against the final outcome.`,
            `8. Anyone that had put in amount in favour of final outcome, irrespective of whether they were the last one to do so, get their amount back.`,
          ]}
        />
      </Flex>
    </Flex>
  );
}

export default Page;
