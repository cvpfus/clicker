/*
  This is a simple clicker game where users can register, click, and see the top 10 users.

  You can play the game at https://clicker.assam.dev
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Clicker is Ownable {
    event UserRegistered(address indexed user, string username);
    event Click(address indexed user, uint256 clicks);
    event Withdraw(uint256 indexed timestamp, uint256 totalAmount);

    uint32 public totalUsers;

    uint256 public lastWithdraw;
    uint256 public lastWithdrawBlockNumber;

    struct UserInfo {
        string username;
        uint256 clicks;
        uint16 multiplier;
        uint16 totalReferrals;
    }

    UserInfo[50] public top50Users;

    mapping(address => UserInfo) public users;
    
    mapping(address => bool) public getRegisteredStatusByAddress;
    mapping(string => bool) public getRegisteredStatusByUsername;
    mapping(string => address) public getAddressByUsername;
    mapping(string => bool) public isUsernameTaken;

    struct WithdrawalHistory {
        UserInfo[50] winners;
        uint256 timestamp;
        uint256 totalAmount;
    }
    WithdrawalHistory[] public withdrawalHistory;

    constructor() Ownable(msg.sender) {}

    /// @dev Function to register a new user with a username
    /// @param _username The username to register
    function register(string memory _username, string memory _referrerUsername) external {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(!isUsernameTaken[_username], "Username already taken");
        require(!getRegisteredStatusByAddress[msg.sender], "User already registered");
        require(keccak256(abi.encodePacked(_username)) != keccak256(abi.encodePacked("noReferrer")), "Username cannot be 'noReferrer'");

        uint16 multiplier = 1;

        // if user has a referrer, add 1 multiplier for both the referrer and the user
        if (keccak256(abi.encodePacked(_referrerUsername)) != keccak256(abi.encodePacked("noReferrer"))) {
            require(getRegisteredStatusByUsername[_referrerUsername], "Referrer not registered");
            users[getAddressByUsername[_referrerUsername]].multiplier += 1;
            multiplier += 1;

            users[getAddressByUsername[_referrerUsername]].totalReferrals += 1;
        }

        UserInfo memory userInfo = UserInfo({
            username: _username,
            clicks: 0,
            multiplier: multiplier,
            totalReferrals: 0
        });

        users[msg.sender] = userInfo;

        getRegisteredStatusByAddress[msg.sender] = true;
        getRegisteredStatusByUsername[_username] = true;
        getAddressByUsername[_username] = msg.sender;
        isUsernameTaken[_username] = true;

        totalUsers++;

        emit UserRegistered(msg.sender, _username);
    }

    /// @dev Function to increment click count for registered user
    function click() external payable {
        require(msg.value == 0.000001 ether, "You must pay 0.000001 TEA to click");
        require(getRegisteredStatusByAddress[msg.sender], "User not registered");

        users[msg.sender].clicks += users[msg.sender].multiplier;

        _updateTop10(msg.sender);

        emit Click(msg.sender, users[msg.sender].clicks);
    }

    /// @dev Internal function to update the top 50 users
    /// @param userAddress The address of the user to update
    function _updateTop10(address userAddress) internal {
        UserInfo memory currentUser = users[userAddress];

        // Check if user is already in the top 50 and update if necessary
        for (uint256 i = 0; i < 50; i++) {
            if (keccak256(abi.encodePacked(top50Users[i].username)) == keccak256(abi.encodePacked(currentUser.username))) {
                top50Users[i] = currentUser;
                _sortTop50();
                return;
            }
        }

        // If user is not in the top 10, check if they qualify to enter
        for (uint256 i = 0; i < 50; i++) {
            if (top50Users[i].clicks < currentUser.clicks) {
                // Shift lower-ranked users down
                for (uint256 j = 49; j > i; j--) {
                    top50Users[j] = top50Users[j - 1];
                }
                top50Users[i] = currentUser;
                break;
            }
        }
    }

    /// @dev Internal function to sort the top 50 users
    function _sortTop50() internal {
        for (uint256 i = 0; i < 50; i++) {
            for (uint256 j = i + 1; j < 50; j++) {
                if (top50Users[j].clicks > top50Users[i].clicks) {
                    UserInfo memory temp = top50Users[i];
                    top50Users[i] = top50Users[j];
                    top50Users[j] = temp;
                }
            }
        }
    }

    /// @dev Function to increase the multiplier for a registered user
    function increaseMultiplier() external payable {
      require(msg.value == 0.0001 ether || msg.value == 0.00025 ether || msg.value == 0.0005 ether, "You must pay 0.0001, 0.00025, or 0.0005 TEA to increase the multiplier");
      require(getRegisteredStatusByAddress[msg.sender], "User not registered");


      if (msg.value == 0.0001 ether) {
        users[msg.sender].multiplier += 10;
      } else if (msg.value == 0.00025 ether) {
        users[msg.sender].multiplier += 25;
      } else if (msg.value == 0.0005 ether) {
        users[msg.sender].multiplier += 50;
      }
    }

    /// @dev Function to get the top 10 users
    /// @return The top 10 users
    function getLeaderboard() external view returns (UserInfo[50] memory) {
        return top50Users;
    }

    /// @dev Function to distribute the contract balance to the top 50 users and the owner every 6 hours
    function withdraw() external onlyOwner {
        require(block.timestamp - lastWithdraw > 6 hours, 'Need to wait 6 hours');

        uint256 totalBalance = address(this).balance;
        uint256 amountToDistribute = totalBalance / 2; // 50% of total balance
        
        // Store current top50 before distributing
        UserInfo[50] memory currentTop50 = top50Users;

        // Top 5 individual rewards
        if (bytes(top50Users[0].username).length > 0) {
            (bool s0,) = getAddressByUsername[top50Users[0].username].call{value: amountToDistribute * 15 / 100}("");
            require(s0, "Transfer failed for rank 1");
        }
        if (bytes(top50Users[1].username).length > 0) {
            (bool s1,) = getAddressByUsername[top50Users[1].username].call{value: amountToDistribute * 12 / 100}("");
            require(s1, "Transfer failed for rank 2"); 
        }
        if (bytes(top50Users[2].username).length > 0) {
            (bool s2,) = getAddressByUsername[top50Users[2].username].call{value: amountToDistribute * 10 / 100}("");
            require(s2, "Transfer failed for rank 3");
        }
        if (bytes(top50Users[3].username).length > 0) {
            (bool s3,) = getAddressByUsername[top50Users[3].username].call{value: amountToDistribute * 8 / 100}("");
            require(s3, "Transfer failed for rank 4");
        }
        if (bytes(top50Users[4].username).length > 0) {
            (bool s4,) = getAddressByUsername[top50Users[4].username].call{value: amountToDistribute * 6 / 100}("");
            require(s4, "Transfer failed for rank 5");
        }

        // Ranks 6-10 (3% each)
        for (uint256 i = 5; i < 10; i++) {
            if (bytes(top50Users[i].username).length > 0) {
                (bool s,) = getAddressByUsername[top50Users[i].username].call{value: amountToDistribute * 3 / 100}("");
                require(s, "Transfer failed for rank 6-10");
            }
        }

        // Ranks 11-20 (1.5% each)
        for (uint256 i = 10; i < 20; i++) {
            if (bytes(top50Users[i].username).length > 0) {
                (bool s,) = getAddressByUsername[top50Users[i].username].call{value: amountToDistribute * 15 / 1000}("");
                require(s, "Transfer failed for rank 11-20");
            }
        }

        // Ranks 21-30 (1% each)
        for (uint256 i = 20; i < 30; i++) {
            if (bytes(top50Users[i].username).length > 0) {
                (bool s,) = getAddressByUsername[top50Users[i].username].call{value: amountToDistribute / 100}("");
                require(s, "Transfer failed for rank 21-30");
            }
        }

        // Ranks 31-50 (0.45% each)
        for (uint256 i = 30; i < 50; i++) {
            if (bytes(top50Users[i].username).length > 0) {
                (bool s,) = getAddressByUsername[top50Users[i].username].call{value: amountToDistribute * 45 / 10000}("");
                require(s, "Transfer failed for rank 31-50");
            }
        }

        // Send 40% to owner
        (bool success,) = owner().call{value: totalBalance * 40 / 100}("");
        require(success, "Owner transfer failed");

        // Store withdrawal history
        withdrawalHistory.push(WithdrawalHistory({
            winners: currentTop50,
            timestamp: block.timestamp,
            totalAmount: amountToDistribute
        }));

        // Reset clicks for all users in top50
        for (uint256 i = 0; i < 50; i++) {
            if (bytes(top50Users[i].username).length > 0) {
                address userAddress = getAddressByUsername[top50Users[i].username];
                users[userAddress].clicks = 0;
            }
        }

        // Reset top50Users
        delete top50Users;

        lastWithdraw = block.timestamp;

        lastWithdrawBlockNumber = block.number;
        
        emit Withdraw(block.timestamp, amountToDistribute);
    }

    /// @dev Function to get withdrawal history
    /// @param page The page number
    /// @param pageSize The page size
    /// @return The withdrawal history
    function getWithdrawalHistory(uint16 page, uint16 pageSize) external view returns (uint16, WithdrawalHistory[] memory) {
        uint16 totalWithdrawalHistory = uint16(withdrawalHistory.length);

        require(page > 0, "Page must be greater than 0");

        uint16 start = (page - 1) * pageSize;
        uint16 end = start + pageSize;

        if (end > totalWithdrawalHistory) {
            end = totalWithdrawalHistory;
        }

        require(start < end, "Start must be less than end");

        WithdrawalHistory[] memory _withdrawalHistory = new WithdrawalHistory[](end - start);

        for (uint16 i = start; i < end; i++) {
            _withdrawalHistory[i - start] = withdrawalHistory[i];
        }

        return (totalWithdrawalHistory, _withdrawalHistory);
   }

    /// @dev Function to get withdrawal history
    /// @param startRow The start row of the withdrawal history
    /// @param endRow The end row of the withdrawal history
    /// @return The withdrawal history
    function getWithdrawalHistory2(uint16 startRow, uint16 endRow) external view returns (uint16, WithdrawalHistory[] memory) {
        uint16 totalWithdrawalHistory = uint16(withdrawalHistory.length);

        require(startRow < endRow, "Start row must be less than end row");

        uint16 end = endRow;

        if (end > totalWithdrawalHistory) {
            end = totalWithdrawalHistory;
        }

        WithdrawalHistory[] memory _withdrawalHistory = new WithdrawalHistory[](end - startRow);

        for (uint16 i = startRow; i < end; i++) {
            _withdrawalHistory[i - startRow] = withdrawalHistory[i];
        }

        return (totalWithdrawalHistory, _withdrawalHistory);
    }
}
