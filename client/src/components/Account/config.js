import Metamask from "./WalletIcons/metamaskWallet.png";
import Coin98 from "./WalletIcons/Coin98.png";
import WalletConnect from "./WalletIcons/wallet-connect.svg";
import MathWallet from "./WalletIcons/MathWallet.svg";
import TokenPocket from "./WalletIcons/TokenPocket.svg";
import SafePal from "./WalletIcons/SafePal.svg";
import TrustWallet from "./WalletIcons/TrustWallet.png";

export const connectors = [
  {
    title: "Metamask",
    icon: "/walleticons/metamaskWallet.png",
    connectorId: "injected",
    priority: 1,
  },
  {
    title: "WalletConnect",
    icon: "/walleticons/wallet-connect.svg",
    connectorId: "walletconnect",
    priority: 2,
  },
  {
    title: "Trust Wallet",
    icon: "/walleticons/TrustWallet.png",
    connectorId: "injected",
    priority: 3,
  },
  {
    title: "MathWallet",
    icon: "/walleticons/MathWallet.svg",
    connectorId: "injected",
    priority: 999,
  },
  {
    title: "TokenPocket",
    icon: "/walleticons/TokenPocket.svg",
    connectorId: "injected",
    priority: 999,
  },
  {
    title: "SafePal",
    icon: "/walleticons/SafePal.svg",
    connectorId: "injected",
    priority: 999,
  },
  {
    title: "Coin98",
    icon: "/walleticons/Coin98.png",
    connectorId: "injected",
    priority: 999,
  },
];
