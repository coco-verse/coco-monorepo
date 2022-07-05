import { Text, Flex, Heading } from '@chakra-ui/react';
import { COLORS } from './../utils';

function HelpBox({ heading, pointsArr }) {
  return (
    <Flex flexDirection="column" padding={2} backgroundColor={COLORS.PRIMARY} borderRadius={8} marginBottom={4}>
      <Heading size={'sm'} marginBottom={1}>
        {heading}
      </Heading>
      {pointsArr.map((tx) => (
        <Text fontSize={15}>{tx}</Text>
      ))}
    </Flex>
  );
}

export default HelpBox;
