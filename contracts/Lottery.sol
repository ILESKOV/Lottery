//SPDX-License-Identifier: Unlicense

pragma solidity 0.8.15;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Token.sol";

/**
 * @title Lottery contract
 * NOTE: Contract use Chainlink Oracle for generating random words
 * @dev Needs to fund subscription and add contract address as a consumer
 * on https://vrf.chain.link/rinkeby for Rinkeby testnet and
 * https://vrf.chain.link/mainnet for mainnet
 * in order to work with VRFv2
 * Lottery ticket is ERC721 token standard and could be bought with LOT ERC-20 tokens
 */
contract Lottery is VRFConsumerBaseV2, ERC721, Ownable {
  VRFCoordinatorV2Interface private _coordinator;

  enum LOTTERY_STATE {
    OPEN,
    CLOSED,
    CALCULATING_WINNER
  }
  LOTTERY_STATE private lotteryState;

  uint16 private constant _REQUEST_CONFIRMATIONS = 3;
  uint32 private constant _CALLBACK_GAS_LIMIT = 120000;
  uint32 private constant _NUM_WORDS = 1;
  uint64 private _subscriptionId;
  uint256 private _numberOfTicket = 0;
  uint256 private _ticket_price = 50;
  uint256 private _lottery_balance = 0;
  address private _vrfCoordinator;
  bytes32 private _keyHash;
  uint256 private _lotteryId = 0;
  uint256[] private _randomWord;
  uint256 public requestId;

  mapping(uint256 => address payable) private _userTickets;
  mapping(uint256 => address payable) private _lotteryWinners;

  event RequestedRandomness(uint256 requestId);
  event ReceivedRandomness(uint256 requestId, uint256 n1);
  event SubscriptionChanged(uint64 subscriptionId);
  event ParticipationFeeUpdated(uint256 indexed usdParticipationFee);
  event NewParticipant(address indexed player, uint256 indexed lotteryId);

  ERC20 public lottery_coin;

  /**
   * @dev _subscriptionID can be obtained from here:
   * Rinkeby testnet(https://vrf.chain.link/rinkeby) or
   * Mainnet(https://vrf.chain.link/mainnet)
   * AggregatorV3Interface for rinkeby address: 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
   * _VRFCoordinator for rinkeby address: 0x6168499c0cFfCaCD319c818142124B7A15E857ab
   * _keyHash for Rinkeby: 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc
   * the last parameter is Token.sol address
   */
  constructor(
    uint64 subscriptionId_,
    address vrfCoordinator_,
    bytes32 keyHash_,
    address token
  ) VRFConsumerBaseV2(vrfCoordinator_) ERC721("LotteryTicket", "ticket") {
    _coordinator = VRFCoordinatorV2Interface(vrfCoordinator_);
    _subscriptionId = subscriptionId_;
    _vrfCoordinator = vrfCoordinator_;
    _keyHash = keyHash_;
    lottery_coin = ERC20(token);

    lotteryState = LOTTERY_STATE.CLOSED;
  }

  /**
   * NOTE: Start new lottery and allow players to buy tickets
   * Only owner could call this function
   * @dev The state of previous lottery is reset
   */
  function startLottery() external onlyOwner {
    require(lotteryState == LOTTERY_STATE.CLOSED, "Can't start a new lottery");
    _numberOfTicket = 0;
    lotteryState = LOTTERY_STATE.OPEN;
    _lotteryId++;
    _randomWord = new uint256[](0);
  }

  /**
   * NOTE: ticket price is based on 'LOT' ERC20 standard token
   * Every user could buy multiple tickets
   * @dev Each ticket is ERC721 token
   * Initial price for one ticket is 50 'LOT' tokens and it's
   * required to approve _ticket_price amount of tokens for this contract
   * in order to participate
   * NewParticipant event is emitted
   */
  function participate() public {
    require(lotteryState == LOTTERY_STATE.OPEN, "Wait until the next lottery");
    require(
      lottery_coin.allowance(msg.sender, address(this)) >= _ticket_price,
      "Not enough of lottery tokens"
    );
    bool success = lottery_coin.transferFrom(
      msg.sender,
      address(this),
      _ticket_price
    );
    if (success) {
      _numberOfTicket++;
      _userTickets[_numberOfTicket] = payable(msg.sender);
      _lottery_balance += _ticket_price;
      _safeMint(msg.sender, _numberOfTicket);
      emit NewParticipant(msg.sender, _lotteryId);
    }
  }

  /**
   * NOTE: End lottery function, which calculates the winner and pay the prize
   * Only owner could call this function
   * @dev endLottery() calls _pickWinner(), which in turn calls the
   * requestRandomWords function from VRFv2
   * At least one participant is required to call this function
   */
  function endLottery() external onlyOwner {
    require(lotteryState == LOTTERY_STATE.OPEN, "Can't end lottery yet");
    require(_numberOfTicket > 0, "Can't divide by zero");
    lotteryState = LOTTERY_STATE.CALCULATING_WINNER;
    _pickWinner();
  }

  /**
   * NOTE: Function to calculate the winner
   * Only owner could call this function
   * @dev Will revert if subscription is not set and funded
   * subscription can be obtained from here:
   * Rinkeby testnet(https://vrf.chain.link/rinkeby) or
   * Mainnet(https://vrf.chain.link/mainnet)
   * RequestRandomness event is emitted
   */
  function _pickWinner() private onlyOwner {
    require(
      lotteryState == LOTTERY_STATE.CALCULATING_WINNER,
      "Lottery not ended yet"
    );
    requestId = _coordinator.requestRandomWords(
      _keyHash,
      _subscriptionId,
      _REQUEST_CONFIRMATIONS,
      _CALLBACK_GAS_LIMIT,
      _NUM_WORDS
    );
    emit RequestedRandomness(requestId);
  }

  /**
   * NOTE: Get random number, pick winner and sent prize to winner
   * @dev Function can be fulfilled only from _vrfcoordinator
   * @param reqId requestId for generating random number
   * @param random received number from VRFv2
   */
  function fulfillRandomWords(
    uint256 reqId, /* requestId */
    uint256[] memory random
  ) internal override {
    _randomWord = random;
    require(_randomWord[0] > 0, "Random number not found");
    uint256 winnerTicket = (_randomWord[0] % _numberOfTicket) + 1;
    _lotteryWinners[_lotteryId] = _userTickets[winnerTicket];
    bool success = lottery_coin.transfer(
      _userTickets[winnerTicket],
      (_lottery_balance * 90) / 100
    );
    if (success) {
      success = lottery_coin.transfer(owner(), (_lottery_balance * 10) / 100);
      if (success) {
        _lottery_balance = 0;
        lotteryState = LOTTERY_STATE.CLOSED;
        emit ReceivedRandomness(reqId, random[0]);
      }
    }
  }

  /**
   * NOTE: Update _subscriptionId
   * @dev SubscriptionChanged event emitted
   * @param new_SubscriptionId new _subscriptionId
   */
  function updateSubscriptionId(uint64 new_SubscriptionId) external onlyOwner {
    _subscriptionId = new_SubscriptionId;
    emit SubscriptionChanged(_subscriptionId);
  }

  /**
   * NOTE: Update Participation Fee
   * @dev ParticipationFeeUpdated event emitted
   * @param newTicketPrice new price of ticket
   */
  function updateTicketPrice(uint64 newTicketPrice) external onlyOwner {
    _ticket_price = newTicketPrice;
    emit ParticipationFeeUpdated(newTicketPrice);
  }

  /**
   * @dev Getter for lottery balance of current lottery
   */
  function getLotteryBalance() external view returns (uint256) {
    return _lottery_balance;
  }

  /**
   * @dev Getter for subscription Id
   */
  function getSubscriptionId() external view onlyOwner returns (uint64) {
    return _subscriptionId;
  }

  /**
   * @dev Getter for current ticket price
   */
  function getTicketPrice() external view returns (uint256) {
    return _ticket_price;
  }

  /**
   * @dev Getter for address of the ticket owner
   * @param userTicket_ number of ticket in actual lottery
   */
  function getUserFromTicket(uint256 userTicket_)
    external
    view
    returns (address)
  {
    return _userTickets[userTicket_];
  }

  /**
   * @dev Getter for the winner's address for a specific lottery
   * @param lotteryId_ number of lottery
   */
  function getlotteryWinner(uint256 lotteryId_)
    external
    view
    returns (address)
  {
    return _lotteryWinners[lotteryId_];
  }

  /**
   * @dev Getter for number of tickets from current lottery
   */
  function currentNumberOfTickets() external view returns (uint256) {
    return _numberOfTicket;
  }

  /**
   * @dev Getter for current lottery state
   */
  function currentLotteryState() external view returns (LOTTERY_STATE) {
    return lotteryState;
  }

  /**
   * @dev Getter for current lottery ID
   */
  function currentLotteryId() external view returns (uint256) {
    return _lotteryId;
  }

  /**
   * @dev Getter for current Random Word
   */
  function currentRandomWord() external view returns (uint256[] memory) {
    return _randomWord;
  }

  /**
   * @dev Getter for length of _randomWord array
   */
  function getLength() external view returns (uint256) {
    return _randomWord.length;
  }
}

