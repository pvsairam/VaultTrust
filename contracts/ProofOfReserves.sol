// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

contract ProofOfReserves is GatewayCaller {
    struct Reserve {
        euint64 encryptedBalance;
        string tokenSymbol;
        string dataType;
        uint256 timestamp;
        bool verified;
        address auditor;
    }

    mapping(address => Reserve[]) public userReserves;
    mapping(address => bool) public authorizedAuditors;
    address[] private auditorList;
    
    address public owner;
    uint256 public totalSubmissions;
    
    event ReserveSubmitted(
        address indexed user,
        uint256 indexed reserveId,
        uint256 timestamp
    );
    
    event ReserveVerified(
        address indexed user,
        uint256 indexed reserveId,
        address indexed auditor,
        uint256 timestamp
    );
    
    event AuditorAuthorized(address indexed auditor, bool status);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier onlyAuditor() {
        require(authorizedAuditors[msg.sender], "Not an authorized auditor");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedAuditors[msg.sender] = true;
        auditorList.push(msg.sender);
    }
    
    function submitEncryptedReserve(
        bytes calldata encryptedBalance,
        bytes calldata inputProof,
        string calldata tokenSymbol,
        string calldata dataType
    ) external returns (uint256) {
        euint64 balance = TFHE.asEuint64(encryptedBalance, inputProof);
        
        TFHE.allow(balance, address(this));
        TFHE.allow(balance, msg.sender);
        
        for (uint256 i = 0; i < auditorList.length; i++) {
            if (authorizedAuditors[auditorList[i]]) {
                TFHE.allow(balance, auditorList[i]);
            }
        }
        
        uint256 reserveId = userReserves[msg.sender].length;
        
        userReserves[msg.sender].push(Reserve({
            encryptedBalance: balance,
            tokenSymbol: tokenSymbol,
            dataType: dataType,
            timestamp: block.timestamp,
            verified: false,
            auditor: address(0)
        }));
        
        totalSubmissions++;
        
        emit ReserveSubmitted(msg.sender, reserveId, block.timestamp);
        
        return reserveId;
    }
    
    function verifyReserve(
        address user,
        uint256 reserveId
    ) external onlyAuditor {
        require(reserveId < userReserves[user].length, "Invalid reserve ID");
        require(!userReserves[user][reserveId].verified, "Already verified");
        
        userReserves[user][reserveId].verified = true;
        userReserves[user][reserveId].auditor = msg.sender;
        
        emit ReserveVerified(user, reserveId, msg.sender, block.timestamp);
    }
    
    function getUserReserveCount(address user) external view returns (uint256) {
        return userReserves[user].length;
    }
    
    function getReserveInfo(
        address user,
        uint256 reserveId
    ) external view returns (
        string memory tokenSymbol,
        string memory dataType,
        uint256 timestamp,
        bool verified,
        address auditor
    ) {
        require(reserveId < userReserves[user].length, "Invalid reserve ID");
        
        Reserve memory reserve = userReserves[user][reserveId];
        return (reserve.tokenSymbol, reserve.dataType, reserve.timestamp, reserve.verified, reserve.auditor);
    }
    
    function requestCompareReserves(
        address user1,
        uint256 reserveId1,
        address user2,
        uint256 reserveId2
    ) external onlyAuditor returns (uint256) {
        require(reserveId1 < userReserves[user1].length, "Invalid reserve ID 1");
        require(reserveId2 < userReserves[user2].length, "Invalid reserve ID 2");
        
        euint64 balance1 = userReserves[user1][reserveId1].encryptedBalance;
        euint64 balance2 = userReserves[user2][reserveId2].encryptedBalance;
        
        TFHE.allow(balance1, msg.sender);
        TFHE.allow(balance2, msg.sender);
        
        ebool result = TFHE.ge(balance1, balance2);
        TFHE.allow(result, msg.sender);
        
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(result);
        
        return Gateway.requestDecryption(cts, this.compareReservesCallback.selector, 0, block.timestamp + 100, false);
    }
    
    function compareReservesCallback(uint256 /*requestId*/, bool decryptedResult) public onlyGateway returns (bool) {
        return decryptedResult;
    }
    
    function requestTotalReserve(
        address user
    ) external onlyAuditor returns (uint256) {
        require(userReserves[user].length > 0, "No reserves");
        
        euint64 total = userReserves[user][0].encryptedBalance;
        TFHE.allow(total, msg.sender);
        
        for (uint256 i = 1; i < userReserves[user].length; i++) {
            euint64 reserve = userReserves[user][i].encryptedBalance;
            TFHE.allow(reserve, msg.sender);
            total = TFHE.add(total, reserve);
        }
        
        TFHE.allow(total, msg.sender);
        
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(total);
        
        return Gateway.requestDecryption(cts, this.totalReserveCallback.selector, 0, block.timestamp + 100, false);
    }
    
    function totalReserveCallback(uint256 /*requestId*/, uint64 decryptedTotal) public onlyGateway returns (uint64) {
        return decryptedTotal;
    }
    
    function authorizeAuditor(address auditor, bool status) external onlyOwner {
        bool wasAuthorized = authorizedAuditors[auditor];
        authorizedAuditors[auditor] = status;
        
        if (status && !wasAuthorized) {
            auditorList.push(auditor);
        } else if (!status && wasAuthorized) {
            for (uint256 i = 0; i < auditorList.length; i++) {
                if (auditorList[i] == auditor) {
                    auditorList[i] = auditorList[auditorList.length - 1];
                    auditorList.pop();
                    break;
                }
            }
        }
        
        emit AuditorAuthorized(auditor, status);
    }
    
    function getAuditorList() external view returns (address[] memory) {
        return auditorList;
    }
    
    function isAuditor(address account) external view returns (bool) {
        return authorizedAuditors[account];
    }
}
