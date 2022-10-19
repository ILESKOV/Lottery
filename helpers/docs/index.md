# Solidity API

## LOT

### constructor

```solidity
constructor() public
```

## Lottery

_Lottery ticket is ERC721 token standard and could be bought with LOT ERC-20 tokens_

### LOTTERY_STATE

```solidity
enum LOTTERY_STATE {
  OPEN,
  CLOSED,
  CALCULATING_WINNER
}
```

### _coordinator

```solidity
contract VRFCoordinatorV2Interface _coordinator
```

### _lotCoin

```solidity
contract IERC20 _lotCoin
```

### _lotteryState

```solidity
enum Lottery.LOTTERY_STATE _lotteryState
```

### _vrfCoordinator

```solidity
address _vrfCoordinator
```

### _keyHash

```solidity
bytes32 _keyHash
```

### _numberOfTicket

```solidity
uint256 _numberOfTicket
```

### _ticketPrice

```solidity
uint256 _ticketPrice
```

### _lotteryBalance

```solidity
uint256 _lotteryBalance
```

### _lotteryId

```solidity
uint256 _lotteryId
```

### _percentageWinner

```solidity
uint256 _percentageWinner
```

### _percentageOwner

```solidity
uint256 _percentageOwner
```

### _subscriptionId

```solidity
uint64 _subscriptionId
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

### requestId

```solidity
uint256 requestId
```

### _randomWord

```solidity
uint256[] _randomWord
```

### _userTickets

```solidity
mapping(uint256 => address) _userTickets
```

### _lotteryWinners

```solidity
mapping(uint256 => address) _lotteryWinners
```

### RequestedRandomness

```solidity
event RequestedRandomness(uint256 requestId)
```

_Emitted when new request to VRF coordinator sended_

| Name | Type | Description |
| ---- | ---- | ----------- |
| requestId | uint256 | id of generate randomness request |

### ReceivedRandomness

```solidity
event ReceivedRandomness(uint256 requestId, uint256 number)
```

_Emitted when VRF coordinator returns a new random word_

| Name | Type | Description |
| ---- | ---- | ----------- |
| requestId | uint256 | id of generate randomness request |
| number | uint256 | random number returned from VRF coordinator contract |

### NewLotteryStarted

```solidity
event NewLotteryStarted(uint256 lotteryId)
```

_Emitted when new lottery started_

| Name | Type | Description |
| ---- | ---- | ----------- |
| lotteryId | uint256 | id of lottery |

### LotteryEnded

```solidity
event LotteryEnded(uint256 lotteryId, address winner)
```

_Emitted when lottery ended_

| Name | Type | Description |
| ---- | ---- | ----------- |
| lotteryId | uint256 | id of lottery |
| winner | address | of this lottery |

### PercentagesChanged

```solidity
event PercentagesChanged(uint256 percentageWinner_, uint256 percentageOwner_)
```

_Emitted when new percentages of the total balance paid for the
winner and owner setted_

| Name | Type | Description |
| ---- | ---- | ----------- |
| percentageWinner_ | uint256 | percentage paid for the winner |
| percentageOwner_ | uint256 | percentage paid for the owner |

### SubscriptionChanged

```solidity
event SubscriptionChanged(uint64 subscriptionId)
```

_Emitted when a new subscriptionId setted_

### ParticipationFeeUpdated

```solidity
event ParticipationFeeUpdated(uint256 usdParticipationFee)
```

_Emitted when a new participation fee is established_

### NewParticipant

```solidity
event NewParticipant(address participant, uint256 lotteryId)
```

_Emitted when a new participant appears_

### constructor

```solidity
constructor(uint64 subscriptionId_, address vrfCoordinator_, bytes32 keyHash_, address token_, uint256 percentageWinner_, uint256 percentageOwner_, uint256 ticketPrice_) public
```

_vrfCoordinator_ and keyHash_ can be obtained
from here: https://docs.chain.link/docs/vrf-contracts/

Requirements:

- `subscriptionId_` cannot be zero.
- `keyHash_` cannot be address zero.
- `vrfCoordinator_` cannot be address zero.
- `token_` cannot be address zero.
- The sum of `percentageWinner_` and `percentageOwner_` must be 100(percent)._

| Name | Type | Description |
| ---- | ---- | ----------- |
| subscriptionId_ | uint64 | can be obtained from here: https://vrf.chain.link |
| vrfCoordinator_ | address | VRF coordinator contract address |
| keyHash_ | bytes32 | The gas lane key hash value, which is the maximum gas price you are willing to pay for a request in wei |
| token_ | address | 'LOT' tokem contract address |
| percentageWinner_ | uint256 | percentage paid for the winner |
| percentageOwner_ | uint256 | percentage paid for the owner |
| ticketPrice_ | uint256 | price in 'LOT' tokens for one ticket in order to participate |

### startLottery

```solidity
function startLottery() external
```

Start new lottery and allow players to buy tickets
Only owner could call this function

_The state of previous lottery is reseted

Requirements:

- `_lotteryState` must be in `CLOSED` state.

Emits a {NewLotteryStarted} event._

### participate

```solidity
function participate() external
```

ticket price is based on 'LOT' ERC20 standard token
Every user could buy multiple tickets

_Each ticket is ERC721 token

Requirements:

- It's required to approve _ticketPrice amount of tokens for this contract
in order to participate.
- `_lotteryState` must be in `OPEN` state.

Emits a {NewParticipant} event._

### endLottery

```solidity
function endLottery() external
```

End lottery function, which calculates the winner and pay the prize
Only owner could call this function

_endLottery() calls _pickWinner(), which in turn calls the
requestRandomWords function from VRFv2

Requirements:

- At least one participant is required to allow owner call this function.
- `_lotteryState` must be in `OPEN` state.
- `_lotteryBalance` must be equal to or greater than 100 tokens.

Emits a {RequestedRandomness} event._

### _pickWinner

```solidity
function _pickWinner() private
```

Function to calculate the winner
Only owner could call this function

_Will revert if subscription is not set and funded

Emits a {RequestedRandomness} event._

### fulfillRandomWords

```solidity
function fulfillRandomWords(uint256 reqId_, uint256[] random_) internal
```

Get random number, pick winner and sent prize to winner

_Function can be fulfilled only from _vrfcoordinator_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reqId_ | uint256 | requestId for generating random number |
| random_ | uint256[] | received number from VRFv2 Requirements: - The first random word must be higher than zero. Emits a {ReceivedRandomness} event. Emits a {LotteryEnded} event. |

### updatePercentages

```solidity
function updatePercentages(uint256 percentageWinner_, uint256 percentageOwner_) external
```

Update the percentages of the total balance paid for the winner and owner

Requirements:

- The sum of `percentageWinner_` and `percentageOwner_` must be 100(percent).

| Name | Type | Description |
| ---- | ---- | ----------- |
| percentageWinner_ | uint256 | new percentage for the winner |
| percentageOwner_ | uint256 | new percentage for the owner Emits a {PercentagesChanged} event. |

### updateSubscriptionId

```solidity
function updateSubscriptionId(uint64 newSubscriptionId_) external
```

Update _subscriptionId

| Name | Type | Description |
| ---- | ---- | ----------- |
| newSubscriptionId_ | uint64 | new _subscriptionId Emits a {SubscriptionChanged} event. |

### updateTicketPrice

```solidity
function updateTicketPrice(uint64 newTicketPrice_) external
```

Update Participation Fee

| Name | Type | Description |
| ---- | ---- | ----------- |
| newTicketPrice_ | uint64 | new price of ticket in 'LOT' tokens Emits a {ParticipationFeeUpdated} event. |

### getPercentages

```solidity
function getPercentages() external view returns (uint256, uint256)
```

_Returns the percentage of the total balance paid for the winner and owner_

### getLotteryBalance

```solidity
function getLotteryBalance() external view returns (uint256)
```

_Returns lottery balance of current lottery_

### getSubscriptionId

```solidity
function getSubscriptionId() external view returns (uint64)
```

_Returns subscription Id_

### getTicketPrice

```solidity
function getTicketPrice() external view returns (uint256)
```

_Returns current ticket price_

### getUserFromTicket

```solidity
function getUserFromTicket(uint256 userTicket_) external view returns (address)
```

_Returns address of the ticket owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| userTicket_ | uint256 | number of ticket in actual lottery |

### getlotteryWinner

```solidity
function getlotteryWinner(uint256 lotteryId_) external view returns (address)
```

_Returns the winner's address for a specific lottery_

| Name | Type | Description |
| ---- | ---- | ----------- |
| lotteryId_ | uint256 | number of lottery |

### currentNumberOfTickets

```solidity
function currentNumberOfTickets() external view returns (uint256)
```

_Returns number of tickets from current lottery_

### currentLotteryState

```solidity
function currentLotteryState() external view returns (enum Lottery.LOTTERY_STATE)
```

_Returns current lottery state_

### currentLotteryId

```solidity
function currentLotteryId() external view returns (uint256)
```

_Returns current lottery ID_

### currentRandomWord

```solidity
function currentRandomWord() external view returns (uint256[])
```

_Returns current Random Word_

### getLength

```solidity
function getLength() external view returns (uint256)
```

_Returns length of _randomWord array_

