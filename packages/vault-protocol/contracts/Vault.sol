// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./RitualProof.sol";

/**
 * @title Vault
 * @dev Smart contract for VaultTap vault management with ritual-based authentication
 */
contract Vault is ReentrancyGuard, Ownable, Pausable {
    RitualProof public ritualProof;
    
    enum VaultType { Personal, Cooperative, Community }
    
    struct VaultInfo {
        uint256 id;
        address owner;
        VaultType vaultType;
        uint256 balance;
        uint256 yieldRate; // basis points (100 = 1%)
        bool isLocked;
        uint256 lockUntil;
        string name;
        string description;
        address[] participants;
        uint256 minimumConsensus; // percentage for cooperative/community vaults
    }
    
    struct UnlockCondition {
        bool requiresRitual;
        string ritualType;
        bool requiresConsensus;
        uint256 consensusThreshold;
        bool requiresTimelock;
        uint256 timelockDuration;
    }
    
    mapping(uint256 => VaultInfo) public vaults;
    mapping(uint256 => UnlockCondition) public unlockConditions;
    mapping(uint256 => mapping(address => bool)) public vaultParticipants;
    mapping(uint256 => mapping(address => bool)) public consensusVotes;
    mapping(address => uint256[]) public userVaults;
    
    uint256 public nextVaultId = 1;
    uint256 public constant MAX_YIELD_RATE = 10000; // 100%
    uint256 public constant YIELD_CALCULATION_PERIOD = 365 days;
    
    event VaultCreated(
        uint256 indexed vaultId,
        address indexed owner,
        VaultType vaultType,
        uint256 initialDeposit
    );
    
    event Deposit(uint256 indexed vaultId, address indexed user, uint256 amount);
    event Withdrawal(uint256 indexed vaultId, address indexed user, uint256 amount);
    event VaultLocked(uint256 indexed vaultId, uint256 lockUntil);
    event VaultUnlocked(uint256 indexed vaultId);
    event YieldDistributed(uint256 indexed vaultId, uint256 totalYield);
    event ConsensusVote(uint256 indexed vaultId, address indexed voter, bool vote);
    
    modifier vaultExists(uint256 vaultId) {
        require(vaults[vaultId].id != 0, "Vault does not exist");
        _;
    }
    
    modifier vaultOwner(uint256 vaultId) {
        require(vaults[vaultId].owner == msg.sender, "Not vault owner");
        _;
    }
    
    modifier vaultParticipant(uint256 vaultId) {
        require(
            vaults[vaultId].owner == msg.sender || 
            vaultParticipants[vaultId][msg.sender],
            "Not a vault participant"
        );
        _;
    }
    
    modifier vaultUnlocked(uint256 vaultId) {
        require(!vaults[vaultId].isLocked || block.timestamp >= vaults[vaultId].lockUntil, "Vault is locked");
        _;
    }
    
    constructor(address _ritualProof) {
        ritualProof = RitualProof(_ritualProof);
    }
    
    /**
     * @dev Create a new vault
     */
    function createVault(
        VaultType _vaultType,
        string memory _name,
        string memory _description,
        uint256 _yieldRate,
        UnlockCondition memory _unlockCondition
    ) external payable whenNotPaused returns (uint256) {
        require(msg.value > 0, "Initial deposit required");
        require(_yieldRate <= MAX_YIELD_RATE, "Yield rate too high");
        require(bytes(_name).length > 0, "Name required");
        
        uint256 vaultId = nextVaultId++;
        
        VaultInfo storage vault = vaults[vaultId];
        vault.id = vaultId;
        vault.owner = msg.sender;
        vault.vaultType = _vaultType;
        vault.balance = msg.value;
        vault.yieldRate = _yieldRate;
        vault.isLocked = false;
        vault.name = _name;
        vault.description = _description;
        vault.participants.push(msg.sender);
        
        if (_vaultType == VaultType.Cooperative) {
            vault.minimumConsensus = 60; // 60% consensus required
        } else if (_vaultType == VaultType.Community) {
            vault.minimumConsensus = 51; // 51% consensus required
        }
        
        vaultParticipants[vaultId][msg.sender] = true;
        unlockConditions[vaultId] = _unlockCondition;
        userVaults[msg.sender].push(vaultId);
        
        emit VaultCreated(vaultId, msg.sender, _vaultType, msg.value);
        emit Deposit(vaultId, msg.sender, msg.value);
        
        return vaultId;
    }
    
    /**
     * @dev Deposit funds into a vault
     */
    function deposit(uint256 vaultId) 
        external 
        payable 
        vaultExists(vaultId) 
        vaultParticipant(vaultId)
        vaultUnlocked(vaultId)
        whenNotPaused 
    {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        vaults[vaultId].balance += msg.value;
        emit Deposit(vaultId, msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw funds from a vault
     */
    function withdraw(uint256 vaultId, uint256 amount, string memory ritualProofData)
        external
        vaultExists(vaultId)
        vaultParticipant(vaultId)
        vaultUnlocked(vaultId)
        nonReentrant
        whenNotPaused
    {
        VaultInfo storage vault = vaults[vaultId];
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(vault.balance >= amount, "Insufficient vault balance");
        
        // Check unlock conditions
        UnlockCondition memory condition = unlockConditions[vaultId];
        
        if (condition.requiresRitual) {
            require(
                ritualProof.verifyRitual(msg.sender, condition.ritualType, ritualProofData),
                "Ritual verification failed"
            );
        }
        
        if (condition.requiresConsensus && vault.vaultType != VaultType.Personal) {
            require(_hasConsensus(vaultId), "Consensus required for withdrawal");
        }
        
        vault.balance -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawal(vaultId, msg.sender, amount);
    }
    
    /**
     * @dev Lock a vault with specific conditions
     */
    function lockVault(uint256 vaultId, uint256 lockDuration)
        external
        vaultExists(vaultId)
        vaultOwner(vaultId)
        whenNotPaused
    {
        VaultInfo storage vault = vaults[vaultId];
        vault.isLocked = true;
        vault.lockUntil = block.timestamp + lockDuration;
        
        emit VaultLocked(vaultId, vault.lockUntil);
    }
    
    /**
     * @dev Unlock a vault with ritual verification
     */
    function unlockVault(uint256 vaultId, string memory ritualProofData)
        external
        vaultExists(vaultId)
        vaultOwner(vaultId)
        whenNotPaused
    {
        VaultInfo storage vault = vaults[vaultId];
        require(vault.isLocked, "Vault is not locked");
        
        UnlockCondition memory condition = unlockConditions[vaultId];
        
        if (condition.requiresRitual) {
            require(
                ritualProof.verifyRitual(msg.sender, condition.ritualType, ritualProofData),
                "Ritual verification failed"
            );
        }
        
        if (condition.requiresTimelock) {
            require(block.timestamp >= vault.lockUntil, "Timelock not expired");
        }
        
        vault.isLocked = false;
        vault.lockUntil = 0;
        
        emit VaultUnlocked(vaultId);
    }
    
    /**
     * @dev Add participant to cooperative or community vault
     */
    function addParticipant(uint256 vaultId, address participant)
        external
        vaultExists(vaultId)
        vaultOwner(vaultId)
        whenNotPaused
    {
        require(vaults[vaultId].vaultType != VaultType.Personal, "Cannot add participants to personal vault");
        require(!vaultParticipants[vaultId][participant], "Already a participant");
        
        vaults[vaultId].participants.push(participant);
        vaultParticipants[vaultId][participant] = true;
        userVaults[participant].push(vaultId);
    }
    
    /**
     * @dev Vote for consensus in cooperative/community vaults
     */
    function voteConsensus(uint256 vaultId, bool vote)
        external
        vaultExists(vaultId)
        vaultParticipant(vaultId)
        whenNotPaused
    {
        require(vaults[vaultId].vaultType != VaultType.Personal, "Personal vaults don't require consensus");
        
        consensusVotes[vaultId][msg.sender] = vote;
        emit ConsensusVote(vaultId, msg.sender, vote);
    }
    
    /**
     * @dev Distribute yield to vault participants
     */
    function distributeYield(uint256 vaultId)
        external
        vaultExists(vaultId)
        whenNotPaused
    {
        VaultInfo storage vault = vaults[vaultId];
        uint256 yieldAmount = _calculateYield(vaultId);
        
        if (yieldAmount > 0) {
            vault.balance += yieldAmount;
            emit YieldDistributed(vaultId, yieldAmount);
        }
    }
    
    /**
     * @dev Check if a vault has consensus for actions
     */
    function _hasConsensus(uint256 vaultId) internal view returns (bool) {
        VaultInfo memory vault = vaults[vaultId];
        uint256 participantCount = vault.participants.length;
        uint256 yesVotes = 0;
        
        for (uint256 i = 0; i < participantCount; i++) {
            if (consensusVotes[vaultId][vault.participants[i]]) {
                yesVotes++;
            }
        }
        
        return (yesVotes * 100) >= (participantCount * vault.minimumConsensus);
    }
    
    /**
     * @dev Calculate yield for a vault
     */
    function _calculateYield(uint256 vaultId) internal view returns (uint256) {
        VaultInfo memory vault = vaults[vaultId];
        // Simplified yield calculation - in production, this would be more sophisticated
        return (vault.balance * vault.yieldRate) / (10000 * YIELD_CALCULATION_PERIOD);
    }
    
    /**
     * @dev Get vault information
     */
    function getVault(uint256 vaultId) external view returns (VaultInfo memory) {
        return vaults[vaultId];
    }
    
    /**
     * @dev Get user's vaults
     */
    function getUserVaults(address user) external view returns (uint256[] memory) {
        return userVaults[user];
    }
    
    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
