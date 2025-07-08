// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title RitualProof
 * @dev Smart contract for verifying ritual-based authentication in VaultTap
 */
contract RitualProof is Ownable {
    using ECDSA for bytes32;
    
    enum RitualType { Voice, Gesture, ElderConsensus, Biometric, Custom }
    
    struct Ritual {
        uint256 id;
        string name;
        RitualType ritualType;
        bool isActive;
        uint256 requiredSignatures;
        address[] authorizedVerifiers;
        mapping(address => bool) isVerifier;
    }
    
    struct RitualAttempt {
        uint256 ritualId;
        address user;
        uint256 timestamp;
        bytes proofData;
        bool isVerified;
        uint256 verificationCount;
        mapping(address => bool) verifierSigned;
    }
    
    mapping(uint256 => Ritual) public rituals;
    mapping(bytes32 => RitualAttempt) public ritualAttempts;
    mapping(address => bool) public elderVerifiers;
    mapping(address => uint256) public userTrustScore;
    
    uint256 public nextRitualId = 1;
    uint256 public constant MAX_TRUST_SCORE = 1000;
    uint256 public constant MIN_ELDER_TRUST_SCORE = 800;
    
    event RitualCreated(uint256 indexed ritualId, string name, RitualType ritualType);
    event RitualVerified(bytes32 indexed attemptId, address indexed user, uint256 indexed ritualId);
    event ElderVerifierAdded(address indexed elder);
    event ElderVerifierRemoved(address indexed elder);
    event TrustScoreUpdated(address indexed user, uint256 newScore);
    
    modifier onlyElderVerifier() {
        require(elderVerifiers[msg.sender], "Not an authorized elder verifier");
        _;
    }
    
    modifier ritualExists(uint256 ritualId) {
        require(rituals[ritualId].id != 0, "Ritual does not exist");
        _;
    }
    
    constructor() {
        // Initialize default rituals
        _createDefaultRituals();
    }
    
    /**
     * @dev Create a new ritual type
     */
    function createRitual(
        string memory name,
        RitualType ritualType,
        uint256 requiredSignatures,
        address[] memory authorizedVerifiers
    ) external onlyOwner returns (uint256) {
        uint256 ritualId = nextRitualId++;
        
        Ritual storage ritual = rituals[ritualId];
        ritual.id = ritualId;
        ritual.name = name;
        ritual.ritualType = ritualType;
        ritual.isActive = true;
        ritual.requiredSignatures = requiredSignatures;
        ritual.authorizedVerifiers = authorizedVerifiers;
        
        for (uint256 i = 0; i < authorizedVerifiers.length; i++) {
            ritual.isVerifier[authorizedVerifiers[i]] = true;
        }
        
        emit RitualCreated(ritualId, name, ritualType);
        return ritualId;
    }
    
    /**
     * @dev Submit ritual proof for verification
     */
    function submitRitualProof(
        uint256 ritualId,
        bytes memory proofData
    ) external ritualExists(ritualId) returns (bytes32) {
        require(rituals[ritualId].isActive, "Ritual is not active");
        
        bytes32 attemptId = keccak256(abi.encodePacked(
            ritualId,
            msg.sender,
            block.timestamp,
            proofData
        ));
        
        RitualAttempt storage attempt = ritualAttempts[attemptId];
        attempt.ritualId = ritualId;
        attempt.user = msg.sender;
        attempt.timestamp = block.timestamp;
        attempt.proofData = proofData;
        attempt.isVerified = false;
        attempt.verificationCount = 0;
        
        return attemptId;
    }
    
    /**
     * @dev Verify a ritual attempt (for elder verifiers)
     */
    function verifyRitualAttempt(bytes32 attemptId, bool isValid)
        external
        onlyElderVerifier
    {
        RitualAttempt storage attempt = ritualAttempts[attemptId];
        require(attempt.user != address(0), "Attempt does not exist");
        require(!attempt.verifierSigned[msg.sender], "Already verified by this elder");
        
        Ritual storage ritual = rituals[attempt.ritualId];
        require(ritual.isVerifier[msg.sender] || elderVerifiers[msg.sender], "Not authorized to verify this ritual");
        
        attempt.verifierSigned[msg.sender] = true;
        
        if (isValid) {
            attempt.verificationCount++;
            
            if (attempt.verificationCount >= ritual.requiredSignatures) {
                attempt.isVerified = true;
                _updateTrustScore(attempt.user, true);
                emit RitualVerified(attemptId, attempt.user, attempt.ritualId);
            }
        } else {
            _updateTrustScore(attempt.user, false);
        }
    }
    
    /**
     * @dev Verify ritual with proof data (external verification)
     */
    function verifyRitual(
        address user,
        string memory ritualType,
        string memory proofData
    ) external view returns (bool) {
        // This would integrate with external verification services
        // For now, we'll do basic validation
        
        if (keccak256(bytes(ritualType)) == keccak256(bytes("voice"))) {
            return _verifyVoiceRitual(user, proofData);
        } else if (keccak256(bytes(ritualType)) == keccak256(bytes("gesture"))) {
            return _verifyGestureRitual(user, proofData);
        } else if (keccak256(bytes(ritualType)) == keccak256(bytes("elder_consensus"))) {
            return _verifyElderConsensus(user, proofData);
        }
        
        return false;
    }
    
    /**
     * @dev Add elder verifier
     */
    function addElderVerifier(address elder) external onlyOwner {
        require(!elderVerifiers[elder], "Already an elder verifier");
        require(userTrustScore[elder] >= MIN_ELDER_TRUST_SCORE, "Trust score too low");
        
        elderVerifiers[elder] = true;
        emit ElderVerifierAdded(elder);
    }
    
    /**
     * @dev Remove elder verifier
     */
    function removeElderVerifier(address elder) external onlyOwner {
        require(elderVerifiers[elder], "Not an elder verifier");
        
        elderVerifiers[elder] = false;
        emit ElderVerifierRemoved(elder);
    }
    
    /**
     * @dev Update user trust score
     */
    function _updateTrustScore(address user, bool successful) internal {
        if (successful) {
            if (userTrustScore[user] < MAX_TRUST_SCORE) {
                userTrustScore[user] += 10;
                if (userTrustScore[user] > MAX_TRUST_SCORE) {
                    userTrustScore[user] = MAX_TRUST_SCORE;
                }
            }
        } else {
            if (userTrustScore[user] > 10) {
                userTrustScore[user] -= 10;
            } else {
                userTrustScore[user] = 0;
            }
        }
        
        emit TrustScoreUpdated(user, userTrustScore[user]);
    }
    
    /**
     * @dev Verify voice ritual (simplified)
     */
    function _verifyVoiceRitual(address user, string memory proofData) 
        internal 
        view 
        returns (bool) 
    {
        // In production, this would call external AI/ML services
        // For now, basic validation
        return bytes(proofData).length > 10 && userTrustScore[user] > 100;
    }
    
    /**
     * @dev Verify gesture ritual (simplified)
     */
    function _verifyGestureRitual(address user, string memory proofData) 
        internal 
        view 
        returns (bool) 
    {
        // In production, this would analyze gesture data
        return bytes(proofData).length > 5 && userTrustScore[user] > 50;
    }
    
    /**
     * @dev Verify elder consensus (simplified)
     */
    function _verifyElderConsensus(address user, string memory proofData) 
        internal 
        view 
        returns (bool) 
    {
        // In production, this would check elder signatures
        return userTrustScore[user] > 200;
    }
    
    /**
     * @dev Create default rituals
     */
    function _createDefaultRituals() internal {
        address[] memory defaultVerifiers = new address[](0);
        
        // Voice ritual
        createRitual("Voice Authentication", RitualType.Voice, 1, defaultVerifiers);
        
        // Gesture ritual
        createRitual("Gesture Authentication", RitualType.Gesture, 1, defaultVerifiers);
        
        // Elder consensus ritual
        createRitual("Elder Consensus", RitualType.ElderConsensus, 2, defaultVerifiers);
        
        // Biometric ritual
        createRitual("Biometric Authentication", RitualType.Biometric, 1, defaultVerifiers);
    }
    
    /**
     * @dev Get ritual information
     */
    function getRitual(uint256 ritualId) external view returns (
        uint256 id,
        string memory name,
        RitualType ritualType,
        bool isActive,
        uint256 requiredSignatures
    ) {
        Ritual storage ritual = rituals[ritualId];
        return (
            ritual.id,
            ritual.name,
            ritual.ritualType,
            ritual.isActive,
            ritual.requiredSignatures
        );
    }
    
    /**
     * @dev Get user trust score
     */
    function getTrustScore(address user) external view returns (uint256) {
        return userTrustScore[user];
    }
}
