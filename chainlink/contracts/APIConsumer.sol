// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract APIConsumer is ChainlinkClient {
    using Chainlink for Chainlink.Request;
 
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    struct AudioFile {
        bytes32 title;
        bytes32 cid;
        bytes32 thumbnail;
        bytes32 uploadDate;
        uint256 duration;
        bytes32 youtubeUrl;
    }

    mapping (bytes32 => address) requestIdToAddress;

    event AudioSaved(address indexed sender, string title, string cid, string thumbnail, string uploadDate, uint256 duration, string youtubeUrl);
    
    constructor() {
        setChainlinkToken(0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846);
        oracle = 0xE52F4aedAb0581df41fB5aBA4d46dda213C962f3;
        setChainlinkOracle(oracle);
        jobId = "a7f442c13a74453f85d444316ebfdbf2";
        fee = 0.1 * 10 ** 18;
    }
    
    function requestYouTubeAudioData(string memory youTubeUrl) public returns (bytes32) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        request.add("youtube_url", youTubeUrl);
        bytes32 requestId = sendChainlinkRequest(request, fee);
        requestIdToAddress[requestId] = msg.sender;
        return requestId;
    }
    
    function fulfill(bytes32 requestId, bytes memory title, bytes memory cid, bytes memory thumbnail, bytes memory uploadDate, uint256 duration, bytes memory youtubeUrl) public recordChainlinkFulfillment(requestId)
    {
        address sender = requestIdToAddress[requestId];
        emit AudioSaved(sender, string(title), string(cid), string(thumbnail), string(uploadDate), duration, string(youtubeUrl));
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}
