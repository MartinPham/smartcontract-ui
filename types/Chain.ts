export type Chain = {
  name: string
  rpc: string[]
  faucets: string[]
  nativeCurrency: ChainCurrency
  chainId: number
  explorers: ChainExplorer[]
	abi?: string
};

export type ChainCurrency = {
  name: string
  symbol: string
  decimals: number
};

export type ChainExplorer = {
  name: string
  url: string
  standard: string
};

export type RpcUrlMap = { 
  [chainId: number]: string 
};