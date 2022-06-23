import { NumberInput, NumberInputField, Input, Flex, Text, HStack } from '@chakra-ui/react';
import { ZERO_BN } from '../utils';

function InputWithTitle(
  title,
  inputType,
  value,
  rValue,
  setValue,
  validationFn,
  inputOptions = {},
  userBalance = ZERO_BN,
  symbol = undefined,
  disabled = false
) {
  const { valid, expText } = validationHelper();

  function validationHelper() {
    let res = {
      valid: false,
      expText: 'Invalid input type',
    };
    if (inputType === 0 || inputType === 1) {
      res = validationFn(rValue);
    }
    if (inputType === 2) {
      res = validationFn(rValue, userBalance);
    }

    return res;
  }

  return (
    <Flex
      style={{
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <Text
        style={{
          width: '100%',
          marginTop: 5,
        }}
        fontSize={15}
      >
        {title}
      </Text>
      {inputType === 0 ? (
        <HStack>
          <Input
            disabled={disabled}
            {...inputOptions}
            style={{
              width: '100%',
              marginTop: 5,
            }}
            placeholder={title}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            value={value}
            fontSize={15}
          />
          {symbol !== undefined ? <Text fontSize={15}>{`${symbol}`}</Text> : undefined}
        </HStack>
      ) : undefined}
      {inputType === 1 || inputType === 2 ? (
        <HStack>
          <NumberInput
            disabled={disabled}
            {...inputOptions}
            style={{
              width: '100%',
              marginTop: 5,
            }}
            onChange={(val) => {
              setValue(val);
            }}
            value={value}
            fontSize={15}
          >
            <NumberInputField />
          </NumberInput>
          {symbol !== undefined ? <Text fontSize={15}>{`${symbol}`}</Text> : undefined}
        </HStack>
      ) : undefined}
      {valid === false ? (
        <Text
          style={{
            fontSize: 12,
            color: '#EB5757',
          }}
        >
          {expText}
        </Text>
      ) : undefined}
    </Flex>
  );
}

export default InputWithTitle;
