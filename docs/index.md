# Solidity API

## Lottery

_Needs to fund subscription and add contract address as a consumer
on https://vrf.chain.link/rinkeby for Rinkeby testnet and
https://vrf.chain.link/mainnet for mainnet
in order to work with VRFv2
Lottery ticket is ERC721 token standard and could be bought with LOT ERC-20 tokens_

### _coordinator

```solidity
contract VRFCoordinatorV2Interface _coordinator
```

### LOTTERY_STATE

```solidity
enum LOTTERY_STATE {
  OPEN,
  CLOSED,
  CALCULATING_WINNER
}
```

### lotteryState

```solidity
enum Lottery.LOTTERY_STATE lotteryState
```

### _REQUEST_CONFIRMATIONS

```solidity
uint16 _REQUEST_CONFIRMATIONS
```

### _CALLBACK_GAS_LIMIT

```solidity
uint32 _CALLBACK_GAS_LIMIT
```

### _NUM_WORDS

```solidity
uint32 _NUM_WORDS
```

### _subscriptionId

```solidity
uint64 _subscriptionId
```

### _numberOfTicket

```solidity
uint256 _numberOfTicket
```

### _ticket_price

```solidity
uint256 _ticket_price
```

### _lottery_balance

```solidity
uint256 _lottery_balance
```

### _vrfCoordinator

```solidity
address _vrfCoordinator
```

### _keyHash

```solidity
bytes32 _keyHash
```

### _lotteryId

```solidity
uint256 _lotteryId
```

### _randomWord

```solidity
uint256[] _randomWord
```

### requestId

```solidity
uint256 requestId
```

### _userTickets

```solidity
mapping(uint256 => address payable) _userTickets
```

### _lotteryWinners

```solidity
mapping(uint256 => address payable) _lotteryWinners
```

### RequestedRandomness

```solidity
event RequestedRandomness(uint256 requestId)
```

### ReceivedRandomness

```solidity
event ReceivedRandomness(uint256 requestId, uint256 n1)
```

### SubscriptionChanged

```solidity
event SubscriptionChanged(uint64 subscriptionId)
```

### ParticipationFeeUpdated

```solidity
event ParticipationFeeUpdated(uint256 usdParticipationFee)
```

### NewParticipant

```solidity
event NewParticipant(address player, uint256 lotteryId)
```

### lottery_coin

```solidity
contract ERC20 lottery_coin
```

### constructor

```solidity
constructor(uint64 subscriptionId_, address vrfCoordinator_, bytes32 keyHash_, address token) public
```

__subscriptionID can be obtained from here:
Rinkeby testnet(https://vrf.chain.link/rinkeby) or
Mainnet(https://vrf.chain.link/mainnet)
AggregatorV3Interface for rinkeby address: 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
_VRFCoordinator for rinkeby address: 0x6168499c0cFfCaCD319c818142124B7A15E857ab
_keyHash for Rinkeby: 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc
the last parameter is Token.sol address_

### startLottery

```solidity
function startLottery() external
```

NOTE: Start new lottery and allow players to buy tickets
Only owner could call this function

_The state of previous lottery is reset_

### participate

```solidity
function participate() public payable
```

NOTE: ticket price is based on 'LOT' ERC20 standard token
Every user could buy multiple tickets

_Each ticket is ERC721 token
Initial price for one ticket is 50 'LOT' tokens and it's
required to approve _ticket_price amount of tokens for this contract
in order to participate
NewParticipant event is emitted_

### endLottery

```solidity
function endLottery() external
```

NOTE: End lottery function, which calculates the winner and pay the prize
Only owner could call this function

_endLottery() calls _pickWinner(), which in turn calls the
requestRandomWords function from VRFv2
At least one participant is required to call this function_

### _pickWinner

```solidity
function _pickWinner() private
```

NOTE: Function to calculate the winner
Only owner could call this function

_Will revert if subscription is not set and funded
subscription can be obtained from here:
Rinkeby testnet(https://vrf.chain.link/rinkeby) or
Mainnet(https://vrf.chain.link/mainnet)
RequestRandomness event is emitted_

### fulfillRandomWords

```solidity
function fulfillRandomWords(uint256 reqId, uint256[] random) internal
```

NOTE: Get random number, pick winner and sent prize to winner

_Function can be fulfilled only from _vrfcoordinator_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reqId | uint256 | requestId for generating random number |
| random | uint256[] | received number from VRFv2 |

### updateSubscriptionId

```solidity
function updateSubscriptionId(uint64 new_SubscriptionId) external
```

NOTE: Update _subscriptionId

_SubscriptionChanged event emitted_

| Name | Type | Description |
| ---- | ---- | ----------- |
| new_SubscriptionId | uint64 | new _subscriptionId |

### updateTicketPrice

```solidity
function updateTicketPrice(uint64 newTicketPrice) external
```

NOTE: Update Participation Fee

_ParticipationFeeUpdated event emitted_

| Name | Type | Description |
| ---- | ---- | ----------- |
| newTicketPrice | uint64 | new price of ticket |

### getLotteryBalance

```solidity
function getLotteryBalance() external view returns (uint256)
```

_Getter for lottery balance of current lottery_

### getSubscriptionId

```solidity
function getSubscriptionId() external view returns (uint64)
```

_Getter for subscription Id_

### getTicketPrice

```solidity
function getTicketPrice() external view returns (uint256)
```

_Getter for current ticket price_

### getUserFromTicket

```solidity
function getUserFromTicket(uint256 userTicket_) external view returns (address)
```

_Getter for address of the ticket owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| userTicket_ | uint256 | number of ticket in actual lottery |

### getlotteryWinner

```solidity
function getlotteryWinner(uint256 lotteryId_) external view returns (address)
```

_Getter for the winner's address for a specific lottery_

| Name | Type | Description |
| ---- | ---- | ----------- |
| lotteryId_ | uint256 | number of lottery |

### currentNumberOfTickets

```solidity
function currentNumberOfTickets() external view returns (uint256)
```

_Getter for number of tickets from current lottery_

### currentLotteryState

```solidity
function currentLotteryState() external view returns (enum Lottery.LOTTERY_STATE)
```

_Getter for current lottery state_

### currentLotteryId

```solidity
function currentLotteryId() external view returns (uint256)
```

_Getter for current lottery ID_

### currentRandomWord

```solidity
function currentRandomWord() external view returns (uint256[])
```

_Getter for current Random Word_

### getLength

```solidity
function getLength() external view returns (uint256)
```

_Getter for length of _randomWord array_

## LOTcoin

### constructor

```solidity
constructor() public
```

## MockV3Aggregator

Based on the FluxAggregator contract
Use this contract when you need to test
other contract's ability to read data from an
aggregator contract, but how the aggregator got
its answer is unimportant

### version

```solidity
uint256 version
```

### decimals

```solidity
uint8 decimals
```

### latestAnswer

```solidity
int256 latestAnswer
```

### latestTimestamp

```solidity
uint256 latestTimestamp
```

### latestRound

```solidity
uint256 latestRound
```

### getAnswer

```solidity
mapping(uint256 => int256) getAnswer
```

### getTimestamp

```solidity
mapping(uint256 => uint256) getTimestamp
```

### getStartedAt

```solidity
mapping(uint256 => uint256) getStartedAt
```

### constructor

```solidity
constructor(uint8 _decimals, int256 _initialAnswer) public
```

### updateAnswer

```solidity
function updateAnswer(int256 _answer) public
```

### updateRoundData

```solidity
function updateRoundData(uint80 _roundId, int256 _answer, uint256 _timestamp, uint256 _startedAt) public
```

### getRoundData

```solidity
function getRoundData(uint80 _roundId) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
```

### latestRoundData

```solidity
function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
```

### description

```solidity
function description() external pure returns (string)
```

