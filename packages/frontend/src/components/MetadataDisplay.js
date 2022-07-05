import { Flex, Text } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { findUrlName, formatMetadata } from '../utils';

function MetadataDisplay({ metadata, url, onClick }) {
  if (!metadata) {
    return (
      <Flex>
        <Text
          marginRight={1}
          color="#337DCF"
          fontSize={13}
          onClick={() => {
            window.open(url);
          }}
          _hover={{
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Unable to find information on link. Vist link here
        </Text>
        <ExternalLinkIcon marginLeft={1} height={18} color="#337DCF" />
      </Flex>
    );
  }

  return (
    <Flex flexDirection={'column'}>
      <div onClick={onClick}>
        <Text
          _hover={{
            cursor: 'pointer',
          }}
          fontWeight={'semibold'}
          fontSize={13}
        >
          {findUrlName(formatMetadata(metadata).url)}
        </Text>
        <Text
          _hover={{
            cursor: 'pointer',
          }}
          fontSize={15}
          marginBottom={1}
        >
          {formatMetadata(metadata).title}
        </Text>
        <Text
          _hover={{
            cursor: 'pointer',
          }}
          fontSize={13}
        >
          {formatMetadata(metadata).description}
        </Text>
      </div>
      <Flex>
        <Text
          marginRight={1}
          color="#337DCF"
          fontSize={13}
          onClick={() => {
            window.open(url);
          }}
          _hover={{
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Visit link
        </Text>
        <ExternalLinkIcon marginLeft={1} height={18} color="#337DCF" />
      </Flex>
    </Flex>
  );
}

export default MetadataDisplay;
