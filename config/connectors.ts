import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
// import { LedgerConnector } from '@web3-react/ledger-connector'
// import { LatticeConnector } from '@web3-react/lattice-connector'
// import { FrameConnector } from '@web3-react/frame-connector'
// import { AuthereumConnector } from '@web3-react/authereum-connector'
// import { TorusConnector } from '@web3-react/torus-connector'
import { Chain, RpcUrlMap } from 'types/Chain'

export const chains: Chain[] = require('config/chains.json')

const INFURA_API_KEY = '84842078b09946638c03157f83405213'

const RPC_URLS: RpcUrlMap = {}
const CHAIN_IDS: number[] = []

if(CHAIN_IDS.length === 0) {
  for(let chain of chains) {
    if (chain.rpc[0]) {
      RPC_URLS[chain.chainId] = chain.rpc[0].replace('${INFURA_API_KEY}', INFURA_API_KEY)
      CHAIN_IDS.push(chain.chainId)
    }
  }
}


export const injected = new InjectedConnector({ supportedChainIds: CHAIN_IDS })

export const network = new NetworkConnector({
  urls: RPC_URLS,
  defaultChainId: 1
})

export const walletconnect = new WalletConnectConnector({
  rpc: RPC_URLS,
  qrcode: true
})

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: 'smartcontract-ui',
  supportedChainIds: CHAIN_IDS
})

// export const ledger = new LedgerConnector({ 
//   chainId: 1, 
//   url: RPC_URLS[1], 
//   pollingInterval: POLLING_INTERVAL 
// })


// export const lattice = new LatticeConnector({
//   chainId: 4,
//   appName: 'web3-react',
//   url: RPC_URLS[4]
// })

// export const frame = new FrameConnector({ supportedChainIds: CHAIN_IDS })

// export const authereum = new AuthereumConnector({ chainId: 42 })

// export const torus = new TorusConnector({ chainId: 1 })
