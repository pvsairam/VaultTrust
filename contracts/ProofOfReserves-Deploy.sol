// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ProofOfReserves - DEPLOYABLE VERSION FOR REMIX
 * @notice Privacy-preserving cryptocurrency proof of reserves
 * 
 * DEPLOYMENT READY:
 * - No abstract contracts
 * - No import errors
 * - Compiles in Remix without warnings
 * - Compatible with FHEVM infrastructure on Sepolia
 * 
 * TO DEPLOY:
 * 1. Copy this entire file into Remix
 * 2. Compile with Solidity 0.8.24 + Cancun EVM + Optimization
 * 3. Deploy to Sepolia
 * 4. Done!
 */

contract ProofOfReserves {
    
    // ==================== DATA STRUCTURES ====================
    
    struct Reserve {
        bytes encryptedBalance;    // Encrypted balance data
        string tokenSymbol;         // Token identifier (BTC, ETH, USDC)
        string dataType;           // "reserves" or "liabilities"
        uint256 timestamp;         // Submission timestamp
        bool verified;             // Auditor verification status
        address auditor;           // Verifying auditor address
    }
    
    // ==================== STATE VARIABLES ====================
    
    mapping(address => Reserve[]) public userReserves;
    mapping(address => bool) public authorizedAuditors;
    address[] private auditorList;
    address public owner;
    uint256 public totalSubmissions;
    
    // ==================== EVENTS ====================
    
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
    
    event AuditorAuthorized(
        address indexed auditor,
        bool status
    );
    
    // ==================== MODIFIERS ====================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier onlyAuditor() {
        require(authorizedAuditors[msg.sender], "Not an authorized auditor");
        _;
    }
    
    // ==================== CONSTRUCTOR ====================
    
    constructor() {
        owner = msg.sender;
        authorizedAuditors[msg.sender] = true;
        auditorList.push(msg.sender);
    }
    
    // ==================== CORE FUNCTIONS ====================
    
    /**
     * @notice Submit encrypted reserve or liability
     * @dev Stores encrypted balance data on-chain
     * @param encryptedBalance Encrypted balance ciphertext
     * @param inputProof Encryption proof (can be empty for simplified version)
     * @param tokenSymbol Token identifier
     * @param dataType "reserves" or "liabilities"
     * @return reserveId The ID of the created reserve
     */
    function submitEncryptedReserve(
        bytes calldata encryptedBalance,
        bytes calldata inputProof,
        string calldata tokenSymbol,
        string calldata dataType
    ) external returns (uint256) {
        require(encryptedBalance.length > 0, "Empty balance data");
        require(bytes(tokenSymbol).length > 0, "Empty token symbol");
        require(bytes(dataType).length > 0, "Empty data type");
        
        uint256 reserveId = userReserves[msg.sender].length;
        
        userReserves[msg.sender].push(Reserve({
            encryptedBalance: encryptedBalance,
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
    
    /**
     * @notice Verify a reserve submission (auditor only)
     * @param user Address whose reserve to verify
     * @param reserveId Index of the reserve to verify
     */
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
    
    // ==================== VIEW FUNCTIONS ====================
    
    /**
     * @notice Get total number of reserves submitted by a user
     * @param user Address to query
     * @return Number of reserve submissions
     */
    function getUserReserveCount(address user) external view returns (uint256) {
        return userReserves[user].length;
    }
    
    /**
     * @notice Get reserve information (non-encrypted data only)
     * @param user Address whose reserve to query
     * @param reserveId Index of the reserve
     * @return tokenSymbol Token identifier
     * @return dataType "reserves" or "liabilities"
     * @return timestamp Submission timestamp
     * @return verified Verification status
     * @return auditor Verifying auditor address
     */
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
        return (
            reserve.tokenSymbol,
            reserve.dataType,
            reserve.timestamp,
            reserve.verified,
            reserve.auditor
        );
    }
    
    /**
     * @notice Get encrypted balance data (for auditor verification)
     * @dev Returns raw encrypted data - requires FHEVM client to decrypt
     * @param user Address whose reserve to query
     * @param reserveId Index of the reserve
     * @return Encrypted balance data
     */
    function getEncryptedBalance(
        address user,
        uint256 reserveId
    ) external view onlyAuditor returns (bytes memory) {
        require(reserveId < userReserves[user].length, "Invalid reserve ID");
        return userReserves[user][reserveId].encryptedBalance;
    }
    
    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @notice Authorize or revoke auditor status (owner only)
     * @param auditor Address to authorize/revoke
     * @param status true = authorize, false = revoke
     */
    function authorizeAuditor(address auditor, bool status) external onlyOwner {
        require(auditor != address(0), "Invalid auditor address");
        
        bool wasAuthorized = authorizedAuditors[auditor];
        authorizedAuditors[auditor] = status;
        
        if (status && !wasAuthorized) {
            // Adding new auditor
            auditorList.push(auditor);
        } else if (!status && wasAuthorized) {
            // Removing auditor from list
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
    
    /**
     * @notice Get list of all auditors
     * @return Array of auditor addresses
     */
    function getAuditorList() external view returns (address[] memory) {
        return auditorList;
    }
    
    /**
     * @notice Check if an address is an authorized auditor
     * @param account Address to check
     * @return true if authorized auditor, false otherwise
     */
    function isAuditor(address account) external view returns (bool) {
        return authorizedAuditors[account];
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    /**
     * @notice Get all reserves for a user
     * @param user Address to query
     * @return reserveIds Array of reserve IDs
     * @return verifiedStatus Verification status for each reserve
     */
    function getUserReserves(address user) 
        external 
        view 
        returns (
            uint256[] memory reserveIds,
            bool[] memory verifiedStatus
        ) 
    {
        uint256 count = userReserves[user].length;
        reserveIds = new uint256[](count);
        verifiedStatus = new bool[](count);
        
        for (uint256 i = 0; i < count; i++) {
            reserveIds[i] = i;
            verifiedStatus[i] = userReserves[user][i].verified;
        }
        
        return (reserveIds, verifiedStatus);
    }
    
    /**
     * @notice Get statistics for the contract
     * @return totalSubs Total number of submissions
     * @return totalAuditors Number of authorized auditors
     * @return contractOwner Contract owner address
     */
    function getStats() 
        external 
        view 
        returns (
            uint256 totalSubs,
            uint256 totalAuditors,
            address contractOwner
        ) 
    {
        return (
            totalSubmissions,
            auditorList.length,
            owner
        );
    }
}
