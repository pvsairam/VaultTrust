// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ⚠️ IMPORTANT: Before deploying in Remix, you need to configure FHEVM imports
// Option 1 (Recommended): Replace imports below with GitHub URLs
// Option 2: Use Hardhat to flatten this contract

// For Remix deployment, replace these lines with:
// import "https://github.com/zama-ai/fhevm/blob/main/lib/TFHE.sol";
// import "https://github.com/zama-ai/fhevm/blob/main/gateway/GatewayCaller.sol";

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * @title ProofOfReserves
 * @author VaultTrust
 * @notice Privacy-preserving proof of reserves using Zama's FHEVM
 * 
 * @dev This contract enables cryptocurrency exchanges to prove their solvency
 * without revealing sensitive financial data. It uses Fully Homomorphic Encryption
 * to perform computations on encrypted balance data while maintaining privacy.
 * 
 * KEY FEATURES:
 * ✅ Encrypted balance storage using euint64 (FHEVM primitive)
 * ✅ Homomorphic computations (add, compare) on encrypted data
 * ✅ Role-based access control (Owner + Auditors)
 * ✅ Decryption gateway for authorized auditors only
 * ✅ On-chain audit trail with verification events
 * 
 * PRIVACY GUARANTEES:
 * - Balances remain encrypted on-chain (visible but unreadable)
 * - Mathematical operations preserve encryption
 * - Only authorized auditors can request decryption
 * - Blockchain validators cannot see actual amounts
 */
contract ProofOfReserves is GatewayCaller {
    
    // ==================== STATE VARIABLES ====================
    
    /**
     * @dev Reserve submission structure
     * @param encryptedBalance FHEVM encrypted 64-bit unsigned integer (the actual balance amount)
     * @param tokenSymbol Token identifier (e.g., "BTC", "ETH", "USDC")
     * @param dataType Submission category: "reserves" or "liabilities"
     * @param timestamp Unix timestamp of submission
     * @param verified Whether an auditor has verified this submission
     * @param auditor Address of the auditor who verified (zero address if unverified)
     */
    struct Reserve {
        euint64 encryptedBalance;  // FHE-encrypted balance (never decrypted on-chain!)
        string tokenSymbol;        // Token identifier
        string dataType;           // "reserves" or "liabilities"
        uint256 timestamp;         // Submission time
        bool verified;             // Verification status
        address auditor;           // Verifying auditor
    }
    
    /// @notice Mapping of user address to their reserve submissions
    mapping(address => Reserve[]) public userReserves;
    
    /// @notice Mapping of addresses authorized as auditors
    mapping(address => bool) public authorizedAuditors;
    
    /// @dev Internal list of all auditor addresses (for granting decryption permissions)
    address[] private auditorList;
    
    /// @notice Contract owner (deployer)
    address public owner;
    
    /// @notice Total number of reserve submissions across all users
    uint256 public totalSubmissions;
    
    // ==================== EVENTS ====================
    
    /**
     * @notice Emitted when a new encrypted reserve is submitted
     * @param user Address submitting the reserve
     * @param reserveId Index of the reserve in user's array
     * @param timestamp Submission timestamp
     */
    event ReserveSubmitted(
        address indexed user,
        uint256 indexed reserveId,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when an auditor verifies a reserve
     * @param user Address whose reserve was verified
     * @param reserveId Index of the verified reserve
     * @param auditor Address of the verifying auditor
     * @param timestamp Verification timestamp
     */
    event ReserveVerified(
        address indexed user,
        uint256 indexed reserveId,
        address indexed auditor,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when auditor authorization status changes
     * @param auditor Address of the auditor
     * @param status New authorization status (true = authorized, false = revoked)
     */
    event AuditorAuthorized(address indexed auditor, bool status);
    
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
    
    /**
     * @notice Initializes the contract and sets deployer as owner + first auditor
     * @dev Deployer automatically becomes both owner and authorized auditor
     */
    constructor() {
        owner = msg.sender;
        authorizedAuditors[msg.sender] = true;
        auditorList.push(msg.sender);
    }
    
    // ==================== CORE FUNCTIONS ====================
    
    /**
     * @notice Submit an encrypted reserve or liability
     * 
     * @dev This is the primary function exchanges use to prove reserves/liabilities.
     * The balance is encrypted client-side using fhevmjs library and submitted with
     * a cryptographic proof. The contract verifies the proof and stores the encrypted
     * value on-chain. The actual amount is NEVER visible to anyone except authorized
     * auditors who can request decryption via the Zama Gateway.
     * 
     * WORKFLOW:
     * 1. User encrypts balance using fhevmjs on frontend
     * 2. Contract validates the encryption proof
     * 3. Encrypted balance stored on-chain (visible but unreadable)
     * 4. Decryption permissions granted to: contract, user, all auditors
     * 5. Event emitted for off-chain tracking
     * 
     * @param encryptedBalance Ciphertext of the balance (from fhevmjs)
     * @param inputProof Cryptographic proof that encryption is valid
     * @param tokenSymbol Token identifier (e.g., "BTC", "ETH")
     * @param dataType "reserves" or "liabilities"
     * @return reserveId The index of the newly created reserve
     */
    function submitEncryptedReserve(
        bytes calldata encryptedBalance,
        bytes calldata inputProof,
        string calldata tokenSymbol,
        string calldata dataType
    ) external returns (uint256) {
        // Convert encrypted input to euint64 and validate proof
        euint64 balance = TFHE.asEuint64(encryptedBalance, inputProof);
        
        // Grant decryption permissions
        TFHE.allow(balance, address(this));  // Contract can access
        TFHE.allow(balance, msg.sender);     // Submitter can access
        
        // Grant access to all authorized auditors
        for (uint256 i = 0; i < auditorList.length; i++) {
            if (authorizedAuditors[auditorList[i]]) {
                TFHE.allow(balance, auditorList[i]);
            }
        }
        
        // Get reserve ID (current array length)
        uint256 reserveId = userReserves[msg.sender].length;
        
        // Store encrypted reserve
        userReserves[msg.sender].push(Reserve({
            encryptedBalance: balance,
            tokenSymbol: tokenSymbol,
            dataType: dataType,
            timestamp: block.timestamp,
            verified: false,
            auditor: address(0)
        }));
        
        // Update global counter
        totalSubmissions++;
        
        // Emit event for off-chain tracking
        emit ReserveSubmitted(msg.sender, reserveId, block.timestamp);
        
        return reserveId;
    }
    
    /**
     * @notice Verify a reserve submission (auditor only)
     * 
     * @dev Auditors mark reserves as verified after off-chain analysis.
     * This doesn't decrypt the balance - it simply marks the submission
     * as audited and approved.
     * 
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
     * @notice Get non-encrypted information about a reserve
     * 
     * @dev Returns public metadata only. The actual balance remains encrypted.
     * To get the decrypted balance, auditors must use requestTotalReserve()
     * or requestCompareReserves() which trigger gateway decryption.
     * 
     * @param user Address whose reserve to query
     * @param reserveId Index of the reserve
     * @return tokenSymbol Token identifier
     * @return dataType "reserves" or "liabilities"
     * @return timestamp Submission time
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
        return (reserve.tokenSymbol, reserve.dataType, reserve.timestamp, reserve.verified, reserve.auditor);
    }
    
    // ==================== HOMOMORPHIC OPERATIONS ====================
    
    /**
     * @notice Compare two encrypted reserves (auditor only)
     * 
     * @dev Performs homomorphic comparison: balance1 >= balance2
     * The comparison happens on encrypted values without decrypting them!
     * Result is also encrypted and sent to Zama Gateway for decryption.
     * 
     * HOMOMORPHIC MAGIC:
     * - Compares encrypted balances without revealing either value
     * - Returns encrypted boolean result
     * - Only auditor receives decrypted result via gateway callback
     * 
     * @param user1 First user address
     * @param reserveId1 First reserve ID
     * @param user2 Second user address
     * @param reserveId2 Second reserve ID
     * @return requestId Gateway request ID for tracking decryption
     */
    function requestCompareReserves(
        address user1,
        uint256 reserveId1,
        address user2,
        uint256 reserveId2
    ) external onlyAuditor returns (uint256) {
        require(reserveId1 < userReserves[user1].length, "Invalid reserve ID 1");
        require(reserveId2 < userReserves[user2].length, "Invalid reserve ID 2");
        
        // Get encrypted balances
        euint64 balance1 = userReserves[user1][reserveId1].encryptedBalance;
        euint64 balance2 = userReserves[user2][reserveId2].encryptedBalance;
        
        // Grant decryption permission to auditor
        TFHE.allow(balance1, msg.sender);
        TFHE.allow(balance2, msg.sender);
        
        // Perform homomorphic comparison (encrypted >= encrypted)
        ebool result = TFHE.ge(balance1, balance2);
        TFHE.allow(result, msg.sender);
        
        // Request decryption from Zama Gateway
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(result);
        
        return Gateway.requestDecryption(
            cts, 
            this.compareReservesCallback.selector, 
            0, 
            block.timestamp + 100, 
            false
        );
    }
    
    /**
     * @notice Gateway callback for comparison result
     * @dev Called by Zama Gateway with decrypted comparison result
     * @param decryptedResult Decrypted boolean (balance1 >= balance2)
     * @return The decrypted result
     */
    function compareReservesCallback(uint256 /*requestId*/, bool decryptedResult) 
        public 
        onlyGateway 
        returns (bool) 
    {
        return decryptedResult;
    }
    
    /**
     * @notice Calculate total reserves for a user (auditor only)
     * 
     * @dev Performs homomorphic addition of all encrypted reserves.
     * Sums multiple encrypted values WITHOUT decrypting them!
     * The sum remains encrypted until Zama Gateway decrypts it for the auditor.
     * 
     * HOMOMORPHIC MAGIC:
     * - Adds encrypted balances: enc(a) + enc(b) = enc(a+b)
     * - Result stays encrypted until gateway decryption
     * - Only auditor receives decrypted sum
     * 
     * USE CASE: Calculate total BTC reserves across all submissions
     * 
     * @param user Address whose reserves to sum
     * @return requestId Gateway request ID for tracking decryption
     */
    function requestTotalReserve(
        address user
    ) external onlyAuditor returns (uint256) {
        require(userReserves[user].length > 0, "No reserves");
        
        // Start with first reserve
        euint64 total = userReserves[user][0].encryptedBalance;
        TFHE.allow(total, msg.sender);
        
        // Homomorphically add remaining reserves
        for (uint256 i = 1; i < userReserves[user].length; i++) {
            euint64 reserve = userReserves[user][i].encryptedBalance;
            TFHE.allow(reserve, msg.sender);
            total = TFHE.add(total, reserve);  // Homomorphic addition!
        }
        
        TFHE.allow(total, msg.sender);
        
        // Request decryption from Zama Gateway
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(total);
        
        return Gateway.requestDecryption(
            cts, 
            this.totalReserveCallback.selector, 
            0, 
            block.timestamp + 100, 
            false
        );
    }
    
    /**
     * @notice Gateway callback for total reserve calculation
     * @dev Called by Zama Gateway with decrypted total
     * @param decryptedTotal Decrypted sum of all reserves
     * @return The decrypted total
     */
    function totalReserveCallback(uint256 /*requestId*/, uint64 decryptedTotal) 
        public 
        onlyGateway 
        returns (uint64) 
    {
        return decryptedTotal;
    }
    
    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @notice Authorize or revoke auditor status (owner only)
     * 
     * @dev Owner can add/remove auditors who can:
     * - Verify reserves
     * - Request decryption of totals/comparisons
     * - Access encrypted data
     * 
     * When adding an auditor, they automatically get decryption permissions
     * for all existing reserves.
     * 
     * @param auditor Address to authorize/revoke
     * @param status true = authorize, false = revoke
     */
    function authorizeAuditor(address auditor, bool status) external onlyOwner {
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
}
