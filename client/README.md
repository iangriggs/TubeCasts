# Web Client

## Next.js Boilerplate

The client uses the official Moralis `Boilerplate` solution available from:

https://github.com/ethereum-boilerplate/ethereum-nextjs-boilerplate

Unused visual components were removed and a very simple UI retained.

The standard 'Authentication' function was retained that uses a Metamask wallet to login.

## Moralis SDK

The Moralis SDK was used throught to send transactions to the Avalanche contract.

Subscriptions were used to notify the web app that there were changes on the `AudioSavedEvents` database table/class. These events allowed the list of audio files shown to be updated to reflect the database table/class.

## Moralis Sync Events

The Moralis server was configured to monitor and sync smart contract events. The event carried the parameters of a new YouTube video that had been ddownloaded. The event parameters were therefore saved in a database table `AudioSavedEvents`.
