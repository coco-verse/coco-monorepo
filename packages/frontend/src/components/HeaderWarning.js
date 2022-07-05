import { Text, Flex, Spacer } from '@chakra-ui/react';
import { useEthers } from '@usedapp/core';
import { useState } from 'react';
import { CloseIcon } from '@chakra-ui/icons';
import { configs } from '../contracts';
function Component() {
  const { chainId } = useEthers();

  const [close, setClose] = useState(false);

  // FIXME
  console.log(chainId, configs.chainId, 'ERROR!');
  if (chainId !== configs.chainId && !close) {
    return (
      <Flex alignItems="center" bg="red.200" paddingRight={1}>
        <Spacer />
        <Text fontSize={20}>Please connect to Reddit-Arbitrum Network</Text>
        <Spacer />
        <CloseIcon
          fontSize={12}
          onClick={() => {
            setClose(true);
          }}
        />
      </Flex>
    );
  } else {
    return <div />;
  }
}

export default Component;
