import { Chain, RpcUrlMap } from 'types/Chain'
const chains: Chain[] = require('config/chains.json')

const INFURA_API_KEY = '84842078b09946638c03157f83405213'
const ETHERSCAN_API_KEY = 'HW16AN9RVY8BJFBZ3YCKYPY9YJ9934EU7Z'
const BSCSCAN_API_KEY = '2MEHB31RMJG3VT8S2HJDXYW1B48F4AKUA4'
const FTMSCAN_API_KEY = 'AT79A7U8Z6G73VXYVDBXH2R1ICDB65SC25'
const POLYGON_API_KEY = 'XAAEAPNJ93W8SWSICH1HK2MGM5TT55KSW7'

const chainsAbiApi: {[key: number]: string} = {
	1: `result https://api.etherscan.io/api?module=contract&action=getabi&address={ADDRESS}&apikey=${ETHERSCAN_API_KEY}`,
	3: `result https://api-ropsten.etherscan.io/api?module=contract&action=getabi&address={ADDRESS}&apikey=${ETHERSCAN_API_KEY}`,
	4: `result https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address={ADDRESS}&apikey=${ETHERSCAN_API_KEY}`,
	5: `result https://api-goerli.etherscan.io/api?module=contract&action=getabi&address={ADDRESS}&apikey=${ETHERSCAN_API_KEY}`,
	10: `result https://api-optimistic.etherscan.io/api?module=contract&action=getabi&address={ADDRESS}&apikey=${ETHERSCAN_API_KEY}`,
	42: `result https://api-kovan.etherscan.io/api?module=contract&action=getabi&address={ADDRESS}&apikey=${ETHERSCAN_API_KEY}`,
	56: `result https://api.bscscan.com/api?module=contract&action=getabi&address={ADDRESS}&apikey=${BSCSCAN_API_KEY}`,
	97: `result https://api-testnet.bscscan.com/api?module=contract&action=getabi&address={ADDRESS}&apikey=${ETHERSCAN_API_KEY}`,
	128: `result https://api.hecoinfo.com/api?module=contract&action=getabi&address={ADDRESS}&apikey=${ETHERSCAN_API_KEY}`,
	137: `result https://api.polygonscan.com/api?module=contract&action=getabi&address={ADDRESS}&apikey=${POLYGON_API_KEY}`,
	70: `result https://api.hooscan.com/api?module=contract&action=getabi&address={ADDRESS}&apikey=${ETHERSCAN_API_KEY}`,
	250: `result https://api.ftmscan.com/api?module=contract&action=getabi&address={ADDRESS}&apikey=${FTMSCAN_API_KEY}`,
	321: `data.0.contract_abi https://explorer.kcc.io/v2api/contract/getabi?address={ADDRESS}`,
	4002: `result https://api-testnet.ftmscan.com/api?module=contract&action=getabi&address={ADDRESS}&apikey=${ETHERSCAN_API_KEY}`,
	43113:
		`result https://api-testnet.snowtrace.io/api?module=contract&action=getabi&address={ADDRESS}&apikey=${ETHERSCAN_API_KEY}`,
	43114:
		`result https://api.snowtrace.io/api?module=contract&action=getabi&address={ADDRESS}&apikey=${ETHERSCAN_API_KEY}`,
	80001:
		`result https://api-mumbai.polygonscan.com/api?module=contract&action=getabi&address={ADDRESS}&apikey=${ETHERSCAN_API_KEY}`,
}

chains.forEach((chain) => {
	if (chainsAbiApi[chain.chainId] !== void 0) {
		chain.abi = chainsAbiApi[chain.chainId].replace('{ADDRESS}', '${ADDRESS}')
	}
})

const rpcs: RpcUrlMap = {}
const chainIds: number[] = []

if(chainIds.length === 0) {
  for(let chain of chains) {
    if (chain.rpc[0]) {
      rpcs[chain.chainId] = chain.rpc[0].replace('${INFURA_API_KEY}', INFURA_API_KEY)
      chainIds.push(chain.chainId)
    }
  }
}


export {
	chains,
	chainIds,
	rpcs
}