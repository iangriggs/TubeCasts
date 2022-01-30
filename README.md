# TubeCasts

This repository contains the source files for Tubecasts. Tubecasts is an entry into the 2021/22 Morialis/Avalanche Hackathon.

![Moralis/Avalanche Hackthon](/hackathon.png)

The solution makes ample use of the following technologies:

- Chainlink
- Filecoin/Web3.Storage/IPFS

and of course:

- Moralis
- Avalanche

## Elevator pitch

A large number of YouTube videos are still good to listen to without needing to watch the video. This makes them ideal to listen to in the same way you might a Podcast, particularly when driving or walking the dog.

Using the Tubecasts web UI a user can submit a shared link for a YouTube video. This video is downloaded, the audio extracted and saved such that the user can at any time hit 'play' in the web app and listen to the audio.

## How does it do it?

The web app UI submits the YouTube link to a smart contract running on Avalanche. This is turn causes Chainlink to pass the url to a custom Chainlink 'external adapter'.

The external adapter downloads the video, extracts the audio and then uploads that to Filecoin/IPFS. A cid is returned that references the audio file on IPFS.

The smart contract receives the cid and then emits a smart contract event. The event is picked up by a Moralis 'sync' configuration and the audio file details saved to a Moralis database.

The web app maintains a subscription to the Moralis database and therefore receives the event and updates the list of audio files available to be listened to.

## Repository structure

The repository is split into two difference areas:

- `chainlink` - the source code and artifacts to run the require Chainlink functionality on Avalanche. See `README.md` in `chainlink` folder for further information.
- `client` - a Next.js client that provides the Ux/Ui for the application. See `README.md` in `client` folder for further information.
