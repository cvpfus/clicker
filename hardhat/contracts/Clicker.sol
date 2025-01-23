/*
  This is a simple clicker game where users can register, click, and claim rewards every 6 hours if they are in the top 50.

  You can play the game at https://clicker.assam.dev

  Developer: cvpfus
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Clicker is Ownable {
    event UserRegistered(address indexed user, string username);
    event Click(address indexed user, uint256 clicks);
    event LeaderboardReset(uint256 indexed timestamp, uint256 totalAmount);
    event RewardClaimed(address indexed user, uint256 amount);

    using Strings for uint256;

    uint256 public clickFee;
    uint256 public ownerPercentage;

    bytes32 private constant NO_REFERRER_HASH = keccak256(abi.encodePacked("noReferrer"));

    uint32 public totalUsers;

    uint256 public lastReset;
    uint256 public lastResetBlockNumber;

    struct UserInfo {
        string username;
        uint24 multiplier;
        uint16 totalReferrals;
        address userAddress;
    }

    struct LeaderBoardInfo {
        string username;
        address userAddress;
        uint256 clicks;
    }

    struct SortedUser {
        address userAddress;
        uint256 clicks;
    }

    mapping(address => uint256) public userClicks;

    uint256 private minTop50Clicks;

    uint256 private minTop50Index;

    uint256 private top50Length;

    mapping(address => bool) private isInTop50;

    mapping(address => uint256) private userTop50Index;

    address[50] public top50Addresses;

    mapping(address => uint256) public pendingRewards;
    uint256 public totalPendingRewards;

    mapping(address => UserInfo) public users;
    
    mapping(address => bool) public getRegisteredStatusByAddress;
    mapping(string => bool) public getRegisteredStatusByUsername;
    mapping(string => address) public getAddressByUsername;
    mapping(string => bool) public isUsernameTaken;

    struct LeaderboardHistory {
        LeaderBoardInfo[50] winners;
        uint256 timestamp;
        uint256 totalAmount;
    }
    LeaderboardHistory[] public leaderboardHistory;

    constructor() Ownable(msg.sender) {
      clickFee = 0.1 ether;
      ownerPercentage = 25;
    }

    /// @dev Function to format an amount of wei to 2 decimal places
    /// @param weiAmount The amount of wei to format
    /// @return The formatted amount
    function formatEther(uint256 weiAmount) public pure returns (string memory) {
        uint256 ethValue = weiAmount / 1e16; // Convert to 2 decimal places
        uint256 wholePart = ethValue / 100;
        uint256 decimalPart = ethValue % 100;
        
        return string.concat(
            Strings.toString(wholePart),
            ".",
            decimalPart < 10 ? "0" : "",
            Strings.toString(decimalPart)
        );
    }

    /// @dev Function to register a new user with a username
    /// @param _username The username to register
    function register(string memory _username, string memory _referrerUsername) external {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_referrerUsername).length > 0, "Referrer username cannot be empty");
        require(!isUsernameTaken[_username], "Username already taken");
        require(!getRegisteredStatusByAddress[msg.sender], "User already registered");
        require(keccak256(abi.encodePacked(_username)) != NO_REFERRER_HASH, "Username cannot be 'noReferrer'");

        uint24 multiplier = 1;

        // if user has a referrer, add 1 multiplier for both the referrer and the user
        if (keccak256(abi.encodePacked(_referrerUsername)) != NO_REFERRER_HASH) {
            require(getRegisteredStatusByUsername[_referrerUsername], "Referrer not registered");
            users[getAddressByUsername[_referrerUsername]].multiplier += 1;
            multiplier += 1;

            users[getAddressByUsername[_referrerUsername]].totalReferrals += 1;
        }

        UserInfo memory userInfo = UserInfo({
            username: _username,
            multiplier: multiplier,
            totalReferrals: 0,
            userAddress: msg.sender
        });

        users[msg.sender] = userInfo;

        getRegisteredStatusByAddress[msg.sender] = true;
        getRegisteredStatusByUsername[_username] = true;
        getAddressByUsername[_username] = msg.sender;
        isUsernameTaken[_username] = true;

        totalUsers++;

        emit UserRegistered(msg.sender, _username);
    }

    /// @dev Function to get user full data
    /// @param user The address of the user
    /// @return username The user's username
    /// @return multiplier The user's click multiplier
    /// @return referrals The user's total referrals
    /// @return clicks The user's total clicks
    function getUserFullData(address user) external view returns (
        string memory username,
        uint24 multiplier,
        uint16 referrals,
        uint256 clicks
    ) {
        UserInfo storage info = users[user];
        return (
            info.username,
            info.multiplier,
            info.totalReferrals,
            userClicks[user]
        );
    }

    /// @dev Function to get the claimable amount for a user
    /// @param user The address of the user
    /// @return The claimable amount
    function getClaimableAmount(address user) external view returns (uint256) {
        return pendingRewards[user];
    }

    /// @dev Function to set the click fee
    /// @param _clickFee The new click fee
    function setClickFee(uint256 _clickFee) external onlyOwner {
        require(_clickFee > 0.01 ether, "Click fee must be greater than 0.01 TEA");
        require(_clickFee % 0.01 ether == 0, "Click fee must have exactly two decimal places");
        clickFee = _clickFee;
    }

    /// @dev Function to increment click count for registered user
    function click() external payable {
        string memory clickFeeErrorMessage = string.concat("You must pay ", formatEther(clickFee), " TEA to click");

        require(msg.value == clickFee, clickFeeErrorMessage);
        require(getRegisteredStatusByAddress[msg.sender], "User not registered");

        userClicks[msg.sender] += users[msg.sender].multiplier;
        
        _updateTop50(msg.sender);
        emit Click(msg.sender, userClicks[msg.sender]);
    }

    /// @dev Internal function to update the top 50 users
    /// @param userAddress The address of the user to update
    function _updateTop50(address userAddress) internal {
        uint256 currentClicks = userClicks[userAddress];

        if (isInTop50[userAddress]) {
            // Update existing entry
            uint256 idx = userTop50Index[userAddress];
            top50Addresses[idx] = userAddress;
            
            // Update minimum if needed
            if (currentClicks < minTop50Clicks) {
                _findNewMin();
            }
        } else {
            if (top50Length < 50) {
                // Array not full - simple append
                _addToTop50(userAddress, top50Length);
                top50Length++;
                if (top50Length == 50) {
                    _findNewMin();
                }
            } else if (currentClicks > minTop50Clicks) {
                // Replace minimum entry
                _replaceMinEntry(userAddress);
                _findNewMin();
            }
        }
    }

    /// @dev Adds new user to top50 array
    /// @notice Handles mapping updates and initial min tracking
    /// @param userAddress The address of the user to add
    /// @param idx Index to insert at
    function _addToTop50(address userAddress, uint256 idx) private {
        top50Addresses[idx] = userAddress;
        isInTop50[userAddress] = true;
        userTop50Index[userAddress] = idx;
        
        // Track minimum until array is full
        if (idx == 0 || userClicks[userAddress] < minTop50Clicks) {
            minTop50Clicks = userClicks[userAddress];
            minTop50Index = idx;
        }
    }

    /// @dev Replaces minimum entry in top50
    /// @notice Updates mappings for both old and new users
    /// @param newUserAddress The address of the new user to insert
    function _replaceMinEntry(address newUserAddress) private {
        // Remove old user from mappings
        address oldUser = top50Addresses[minTop50Index];
        isInTop50[oldUser] = false;
        userTop50Index[oldUser] = 0;

        // Insert new user
        top50Addresses[minTop50Index] = newUserAddress;
        isInTop50[newUserAddress] = true;
        userTop50Index[newUserAddress] = minTop50Index;
    }

    /// @dev Finds new minimum value in top50 array
    function _findNewMin() private {
        minTop50Clicks = type(uint256).max;
        for (uint256 i = 0; i < 50; i++) {
            address userAddress = top50Addresses[i];
            if (userAddress == address(0)) continue;
            if (userClicks[userAddress] < minTop50Clicks) {
                minTop50Clicks = userClicks[userAddress];
                minTop50Index = i;
            }
        }
    }

    /// @dev Function to increase the multiplier for a registered user
    function increaseMultiplier() external payable {
      require(msg.value == 10 ether || msg.value == 25 ether || msg.value == 50 ether, "You must pay 10, 25, or 50 TEA to increase the multiplier");
      require(getRegisteredStatusByAddress[msg.sender], "User not registered");

      if (msg.value == 10 ether) {
        users[msg.sender].multiplier += 10;
      } else if (msg.value == 25 ether) {
        users[msg.sender].multiplier += 25;
      } else if (msg.value == 50 ether) {
        users[msg.sender].multiplier += 50;
      }
    }

    /// @dev Function to get the top 50 users
    /// @return The top 50 users
    function getUnsortedLeaderboard() external view returns (LeaderBoardInfo[50] memory) {
        LeaderBoardInfo[50] memory top50Users;
        for (uint8 i = 0; i < 50; i++) {
            top50Users[i] = LeaderBoardInfo({
                username: users[top50Addresses[i]].username,
                userAddress: top50Addresses[i],
                clicks: userClicks[top50Addresses[i]]
            });
        }

        return top50Users;
    }

    /// @dev Function to set the owner percentage
    /// @param _ownerPercentage The new owner percentage
    function setOwnerPercentage(uint256 _ownerPercentage) external onlyOwner {
      require(_ownerPercentage > 1 && _ownerPercentage <= 50, "Owner percentage must be between 1 and 50");
      ownerPercentage = _ownerPercentage;
    }

    /// @dev Owner function to reset leaderboard and calculate rewards every 6 hours
    function resetLeaderboard() external onlyOwner {
        require(block.timestamp - lastReset > (5 hours + 45 minutes), '5h45m cooldown');
        
        uint256 availableBalance = address(this).balance - totalPendingRewards;
        uint256 ownerPayment = availableBalance * ownerPercentage / 100;
        uint256 amountToDistribute = availableBalance * 50 / 100;
        
        // Send owner share immediately
        (bool success,) = owner().call{value: ownerPayment}("");
        require(success, "Owner transfer failed");

        // Create sortable array
        SortedUser[50] memory sortableUsers;
        
        // Populate sortable array from storage
        for (uint256 i = 0; i < 50; i++) {
            sortableUsers[i] = SortedUser({
                userAddress: top50Addresses[i],
                clicks: userClicks[top50Addresses[i]]
            });
        }

        // Sort using optimized in-memory algorithm
        _sortTop50(sortableUsers);

        // Calculate rewards using sorted array
        uint256[50] memory payments;
        payments[0] = amountToDistribute * 15 / 100;
        payments[1] = amountToDistribute * 12 / 100;
        payments[2] = amountToDistribute * 10 / 100;
        payments[3] = amountToDistribute * 8 / 100;
        payments[4] = amountToDistribute * 6 / 100;
        
        for (uint256 i = 5; i < 10; i++) payments[i] = amountToDistribute * 3 / 100;
        for (uint256 i = 10; i < 20; i++) payments[i] = amountToDistribute * 15 / 1000;
        for (uint256 i = 20; i < 30; i++) payments[i] = amountToDistribute / 100;
        for (uint256 i = 30; i < 50; i++) payments[i] = amountToDistribute * 45 / 10000;

        // Store sorted winners for history
        LeaderBoardInfo[50] memory sortedWinners;

        // Distribute pending rewards and track total pending rewards
        uint256 newPending;
        for (uint256 i = 0; i < 50; i++) {
            address user = sortableUsers[i].userAddress;
            if (user == address(0)) continue;

            // Add to pending rewards
            pendingRewards[user] += payments[i];
            newPending += payments[i];
            
            // Store in sorted winners array
            sortedWinners[i] = LeaderBoardInfo({
                username: users[user].username,
                userAddress: user,
                clicks: userClicks[user]
            });
        }
        totalPendingRewards += newPending;

        // Store historical data
        leaderboardHistory.push(LeaderboardHistory({
            winners: sortedWinners,
            timestamp: block.timestamp,
            totalAmount: amountToDistribute
        }));

        // Reset all clicks and leaderboard
        for (uint256 i = 0; i < 50; i++) {
            address user = top50Addresses[i];
            if (user != address(0)) {
                userClicks[user] = 0;
                isInTop50[user] = false;
                userTop50Index[user] = 0;
            }
        }
        top50Length = 0;
        delete top50Addresses;

        lastReset = block.timestamp;
        lastResetBlockNumber = block.number;

        emit LeaderboardReset(block.timestamp, amountToDistribute);
    }

    /// @dev Optimized in-memory sorting for top50
    function _sortTop50(SortedUser[50] memory data) internal pure {
        // Implementation of insertion sort optimized for small arrays
        for (uint256 i = 1; i < 50; i++) {
            SortedUser memory key = data[i];
            uint256 j = i;
            
            while (j > 0 && data[j-1].clicks < key.clicks) {
                data[j] = data[j-1];
                j--;
            }
            data[j] = key;
        }
    }

    /// @dev Allows users to claim their accumulated rewards
    function claimReward() external {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No rewards available");
        
        // Reset before transfer to prevent reentrancy
        pendingRewards[msg.sender] = 0;
        totalPendingRewards -= amount;  
        
        (bool sent,) = msg.sender.call{value: amount}("");
        require(sent, "Transfer failed");
        
        emit RewardClaimed(msg.sender, amount);
    }

    function getLast5LeaderboardHistory() external view returns (LeaderboardHistory[] memory) {
      uint16 totalLeaderboardHistory = uint16(leaderboardHistory.length);

      if (totalLeaderboardHistory < 5) {
        return leaderboardHistory;
      }

      uint16 start = totalLeaderboardHistory - 5;
      uint16 end = totalLeaderboardHistory;

      LeaderboardHistory[] memory last5LeaderboardHistory = new LeaderboardHistory[](5);
      for (uint16 i = start; i < end; i++) {
        last5LeaderboardHistory[i - start] = leaderboardHistory[i];
      }

      return last5LeaderboardHistory;
    }
}
