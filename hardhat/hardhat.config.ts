// import { HardhatUserConfig, vars } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox";

// const TEA_TESTNET_PRIVATE_KEY = vars.get("TEA_TESTNET_PRIVATE_KEY");

// const config: HardhatUserConfig = {
//   solidity: {
//     version: "0.8.28",
//     settings: {
//       viaIR: true,
//       optimizer: {
//         enabled: true,
//         details: {
//           yulDetails: {
//             optimizerSteps: "u",
//           },
//         },
//       },
//     },
//   },
//   networks: {
//     teaTestnet: {
//       url: "https://assam-rpc.tea.xyz",
//       accounts: [TEA_TESTNET_PRIVATE_KEY],
//     },
//   },
//   etherscan: {
//     apiKey: {
//       teaTestnet: "just-random-api-key",
//     },
//     customChains: [
//       {
//         network: "teaTestnet",
//         chainId: 93384,
//         urls: {
//           apiURL: "https://assam.tea.xyz/api",
//           browserURL: "https://assam.tea.xyz",
//         },
//       },
//     ],
//   },
//   sourcify: {
//     enabled: false,
//   },
// };

// export default config;


import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");
const TESTNET_PRIVATE_KEY = vars.get("TEA_TESTNET_PRIVATE_KEY");
const BSCSCAN_API_KEY = vars.get("BSCSCAN_API_KEY");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        details: {
          yulDetails: {
            optimizerSteps: "u",
          },
        },
      },
    },
  },
  networks: {
    bscTestnet: {
      url: `https://bnb-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [TESTNET_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: BSCSCAN_API_KEY,
    },
  },
  sourcify: {
    enabled: false,
  },
};

export default config;