// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Admins is Ownable {
    struct Admin {
        uint256 id;
        bool exists;
    }

    // SHA256(wallet) => Admin
    mapping(bytes32 => Admin) private admins;

    // ID counter
    uint256 private nextAdminId = 1;

    // Core Events
    event AdminAdded(bytes32 indexed walletHash, uint256 id);
    event AdminRemoved(bytes32 indexed walletHash, uint256 id);

    // Debug/Trace Events
    event DebugHash(address wallet, bytes32 walletHash);
    event DebugAddAttempt(
        address wallet,
        uint256 proposedId,
        bool existsBefore
    );
    event DebugRemoveAttempt(address wallet, bool existsBefore);
    event DebugCurrentIdCounter(uint256 nextAdminId);

    constructor() Ownable(msg.sender) {}

    function _hash(address wallet) internal pure returns (bytes32) {
        return sha256(abi.encodePacked(wallet));
    }

    function addAdmin(address wallet) external onlyOwner {
        require(wallet != address(0), "Invalid address");

        bytes32 walletHash = _hash(wallet);
        emit DebugHash(wallet, walletHash);
        emit DebugAddAttempt(wallet, nextAdminId, admins[walletHash].exists);

        require(!admins[walletHash].exists, "Admin already exists");

        admins[walletHash] = Admin({id: nextAdminId, exists: true});
        emit AdminAdded(walletHash, nextAdminId);

        nextAdminId++;
        emit DebugCurrentIdCounter(nextAdminId);
    }

    function removeAdmin(address wallet) external onlyOwner {
        bytes32 walletHash = _hash(wallet);
        emit DebugHash(wallet, walletHash);
        emit DebugRemoveAttempt(wallet, admins[walletHash].exists);

        require(admins[walletHash].exists, "Admin not found");

        uint256 id = admins[walletHash].id;

        delete admins[walletHash];
        emit AdminRemoved(walletHash, id);
    }

    function isAdmin(address wallet) external view returns (bool) {
        bytes32 walletHash = _hash(wallet);
        return admins[walletHash].exists;
    }

    function getAdminId(address wallet) external view returns (uint256) {
        bytes32 walletHash = _hash(wallet);
        require(admins[walletHash].exists, "Admin not found");
        return admins[walletHash].id;
    }

    function getNextAdminId() external view returns (uint256) {
        return nextAdminId;
    }
}
