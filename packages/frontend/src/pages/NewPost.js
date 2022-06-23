import { useState } from 'react';
import { useToast, Flex, Heading, Text } from '@chakra-ui/react';

import {
  newPost,
  CREATION_AMOUNT,
  postSignTypedDataV4Helper,
  ONE_BN,
  COLORS,
  validateLinkURL,
  getMarketIdentifierOfUrl,
  findUrlsInfo,
  QUERY_STATUS,
} from './../utils';
import { useERC20TokenAllowanceWrapper, useERC20TokenBalance } from './../hooks';
import { useEthers } from '@usedapp/core';
import InputWithTitle from '../components/InputWithTitle';
import PrimaryButton from '../components/PrimaryButton';
import ApprovalInterface from '../components/ApprovalInterface';
import { configs } from '../contracts';
import HelpBox from '../components/HelpBox';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router';
import MetadataDisplay from '../components/MetadataDisplay';

function Page() {
  const urlParams = useParams();
  const navigate = useNavigate();
  const { account } = useEthers();

  const toast = useToast();

  const wEthTokenBalance = useERC20TokenBalance(account, configs.Token);
  const wETHTokenAllowance = useERC20TokenAllowanceWrapper(
    configs.Token,
    account,
    configs.GroupRouter,
    CREATION_AMOUNT.add(ONE_BN)
  );

  const [link, setLink] = useState(urlParams.url ? decodeURIComponent(urlParams.url) : '');
  const [urlInfo, setUrlInfo] = useState(undefined);

  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [newPostLoading, setNewPostLoading] = useState(false);

  async function postHelper() {
    try {
      // throw error if user isn't authenticated
      if (!account) {
        toast({
          title: 'Please connect you wallet!',
          status: 'error',
          isClosable: true,
        });
        throw Error();
      }

      // start new post loading
      setNewPostLoading(true);

      // validate title
      if (!configs.Group || configs.Group === '' || urlInfo === undefined) {
        toast({
          title: 'Invalid Input!',
          status: 'error',
          isClosable: true,
        });
        throw Error();
      }

      // checks that token approval is given
      if (wETHTokenAllowance === false) {
        toast({
          title: 'Please give WETH approval to app before proceeding!',
          status: 'error',
          isClosable: true,
        });
        throw Error();
      }

      // checks that sufficient balance if present
      if (CREATION_AMOUNT.add(ONE_BN).gt(wEthTokenBalance)) {
        toast({
          title: `min. of 0.05 ${configs.TokenSymbol} required! Refer to rules on the side`,
          status: 'error',
          isClosable: true,
        });
        throw Error();
      }

      const marketIdentifier = getMarketIdentifierOfUrl(urlInfo.url);

      // signature for on-chain market
      const { marketData, dataToSign } = postSignTypedDataV4Helper(
        configs.Group,
        marketIdentifier,
        CREATION_AMOUNT.toString(),
        configs.chainId
      );
      const accounts = await window.ethereum.enable();
      const marketSignature = await window.ethereum.request({
        method: 'eth_signTypedData_v3',
        params: [accounts[0], dataToSign],
      });

      // create new post request body
      const body = {
        creatorAddress: account.toLowerCase(),
        url: urlInfo.url,
        groupAddress: configs.Group.toLowerCase(),
        marketSignature,
        marketData: JSON.stringify(marketData),
      };

      const res = await newPost(body);
      if (res === undefined) {
        toast({
          title: 'Something went wrong!',
          status: 'error',
          isClosable: true,
        });
        throw Error();
      }

      setNewPostLoading(false);

      // TODO NAVIGATE TO POST PAGE
      navigate(`/post/${marketIdentifier}`);
    } catch (e) {
      console.log(e, ' error in the end');
      setNewPostLoading(false);
    }
  }

  async function getLinkMetadata() {
    if (validateLinkURL(link).valid === false) {
      return;
    }

    setLoadingMetadata(true);

    const res = await findUrlsInfo([link]);
    if (res === undefined || res.urlsInfo.length === 0) {
      return;
    }

    setUrlInfo(res.urlsInfo[0]);

    setLoadingMetadata(false);
  }

  return (
    <Flex width={'100%'}>
      <Flex width={'70%'} padding={5} flexDirection={'column'}>
        <Flex
          padding={2}
          backgroundColor={COLORS.PRIMARY}
          borderRadius={8}
          justifyContent="flex-start"
          marginBottom={4}
        >
          <Heading size="md">Add new link</Heading>
        </Flex>
        <Flex padding={2} backgroundColor={COLORS.PRIMARY} borderRadius={8} flexDirection={'column'} marginBottom={4}>
          {InputWithTitle('Link', 0, link, link, setLink, validateLinkURL, {})}

          <PrimaryButton
            title={'Find Link'}
            isLoading={loadingMetadata}
            loadingText="Finding..."
            onClick={getLinkMetadata}
            style={{
              marginTop: 5,
              // flexDirection: "row",
            }}
          />
        </Flex>
        <Flex padding={2} backgroundColor={COLORS.PRIMARY} borderRadius={8} flexDirection={'column'}>
          {urlInfo === undefined ? <Text>Nothing found...</Text> : undefined}
          {urlInfo !== undefined ? (
            <>
              <MetadataDisplay metadata={urlInfo.metadata} url={urlInfo.url} />
              {urlInfo.qStatus === QUERY_STATUS.FOUND ? (
                <Flex justifyContent="center" paddingTop={5} alignItems="center">
                  <Text
                    marginRight={1}
                    color="#337DCF"
                    fontSize={15}
                    onClick={() => {
                      window.open(`/post/${urlInfo.post.marketIdentifier}`);
                    }}
                    _hover={{
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Link already added. Vist on COCO
                  </Text>
                  <ExternalLinkIcon marginLeft={1} height={18} color="#337DCF" />
                </Flex>
              ) : undefined}
              {urlInfo.qStatus === QUERY_STATUS.NOT_FOUND ? (
                <PrimaryButton
                  title={'Add link'}
                  isLoading={newPostLoading}
                  loadingText="Adding..."
                  onClick={postHelper}
                  style={{
                    marginTop: 5,
                  }}
                />
              ) : undefined}
            </>
          ) : undefined}
          <ApprovalInterface
            marginTop={5}
            tokenType={0}
            erc20Address={configs.Token}
            erc20AmountBn={CREATION_AMOUNT.add(ONE_BN)}
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
        </Flex>
      </Flex>
      <Flex width="30%" paddingTop={5} flexDirection={'column'}>
        <HelpBox
          heading={'Rules for adding link'}
          pointsArr={[
            "1. Only post links that don't contain misinformation/factually incorrect information.",
            `2. To post, you need to sign a message that says "Here's 0.05 ${configs.TokenSymbol} that I putting in for YES (i.e. the link does not violates point (1)). If someone thinks otherwise feel free to challenge me."`,
            `3. Don't worry, as long as no one challenges you (i.e. you don't post any bad link) no amount will be deducted from your account.`,
            `4. Read "COCO rules" before procedding.`,
          ]}
        />
        <HelpBox
          heading={'COCO rules'}
          pointsArr={[
            `1. Any link posted to COCO should not contain misinformation/factually incorrect information.`,
            `2. Every link posted is supported with initial challenge of amount 0.05 ${configs.TokenSymbol} in favour of "YES" (i.e. the contents of the link follow point (1)). This acts as an incentive for someone that thinks otherwise to challenge the link.`,
            `3. If you think a link violates point (1), then challenge it by favouring "NO" (i.e. link violates point (1)). If you are right, you can potentailly win initial amount put in by link poster.`,
            `4. Subsequent challenges are allowed, as long as they are made before challenge period expires and amount put in is 2x the amount put in the last challenge.`,
            `5. If a challenge does not receives a challenge before time period expired, then the outcome favoured by the challenge is set as the final outcome`,
            `6. If total volume put in for challenges related to a link reach 50 ${configs.TokenSymbol}, the moderation committee steps in to declare the final outcome`,
            `7. Once final outcome is set, the last one to challenge in favour of final outcome wins the entire amount put in against the final outcome.`,
            `8. Anyone that had put in amount in favour of final outcome, irrespective of whether they were the last one to do so, get their amount back.`,
          ]}
        />
      </Flex>
    </Flex>
  );
}

export default Page;
