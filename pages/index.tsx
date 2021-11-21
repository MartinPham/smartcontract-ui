import { useState, useEffect, useCallback } from 'react'
import { useImmer } from 'use-immer'
import { callWeb3Function } from 'utils/contracts'
import { useRouter } from 'next/router'
import { Function } from 'types/Function'
import { Chain } from 'types/Chain'
import { useWeb3React } from '@web3-react/core'
import { NetworkConnector } from '@web3-react/network-connector'
import { chains } from 'config/chains'
import { network, injected, walletconnect } from 'config/connectors'
import { Contract } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'
import { isAddress } from '@ethersproject/address'
import { useEagerConnect } from 'hooks/useEagerConnect'
import { useInactiveListener } from 'hooks/useInactiveListener'
import Avatar from '@mui/material/Avatar'
import CssBaseline from '@mui/material/CssBaseline'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import { SourceBrowser } from 'components/SourceBrowser'
import { ContractSelector } from 'components/ContractSelector'
import { FunctionComposer } from 'components/FunctionComposer'
import { ResultDialog } from 'components/ResultDialog'
import { ReadResult, WriteResult } from 'types/Result'
import LinearProgress from '@mui/material/LinearProgress'
import { useHistory } from 'hooks/useHistory'
import { HistoryEntry } from 'types/History'
import { log, warn, fatal } from 'utils/logger'
import ReplayIcon from '@mui/icons-material/Replay'
import { signers } from 'config/signers'
import { Signer } from 'types/Signer'

export default function Page() {
	// snackbar
	const { enqueueSnackbar } = useSnackbar()

	// Error feedback
	const showError = useCallback((error) => {
		fatal(error)
		let message = ''
		if (error['data'] && error['data']['message']) {
			message = error['data']['message']
		} else if (error['message']) {
			message = error['message']
		} else {
			message = error as string
		}
		enqueueSnackbar(message, {
			variant: 'error',
		})
	}, [])

	// import 
	const importAbi = useCallback((abi) => {
		toggleParamsLock(false)

		setSource(JSON.stringify(abi))

		setAbi(abi)

		const newFunctions = []
		for (let item of abi) {
			if (item['type'] === 'function') {
				const func = item as Function
				newFunctions.push(func)
			}
		}
		setFunctions(newFunctions)

		return newFunctions
	}, [])

	// history
	const [history, recordEntry] = useHistory()
	const openHistoryEntry = useCallback((entry: HistoryEntry) => {


		const newFunctions = importAbi(entry.abi)

		const chain = chains.find(chain => chain.chainId == entry.network)
		if (chain) {
			log('history -> set chain')
			selectChain(chain)
		}

		log('history -> address')
		setAddress(entry.address)

		const func = newFunctions.find(f => f.name === entry.function)
		if (func) {
			log('history -> function')
			selectFunction(func)
		}

		log('history -> args')
		for (let key in entry.args) {
			setFunctionArguments((draft: any) => {
				draft[key] = entry.args[key]
			})
		}

		log('history -> eth')
		setFunctionEth(entry.eth)


	}, [])

	// w3
	const w3React = useWeb3React<Web3Provider>()
	const [w3ReactInited, initW3React] = useState(false)
	// global.w3 = w3React


	const [activatingConnector, setActivatingConnector] = useState(undefined)
	useEffect(() => {
		if (activatingConnector && activatingConnector === w3React.connector) {
			setActivatingConnector(undefined)
		}
	}, [
		activatingConnector,
		w3React.connector
	])

	const triedEager = useEagerConnect()
	useInactiveListener(!triedEager || !!activatingConnector)


	const switchW3Chain = useCallback(async (chain: Chain) => {
		if (!chain) return
		log('switch w3 chain', chain)

		if (w3React.connector === network) {
			log('switch w3 chain on network');

			(w3React.connector as NetworkConnector).changeChainId(Number(chain.chainId))
		} else if (w3React.connector === injected) {
			log('switch w3 chain on injected')
			const ethereum = (global as { [key: string]: any })['ethereum']

			if (ethereum) {
				const chainId = '0x' + Number(chain.chainId).toString(16)
				try {
					await ethereum.request({
						method: 'wallet_switchEthereumChain',
						params: [{
							chainId
						}],
					})
				} catch (switchError: any) {
					if (switchError['code'] === 4902) {
						try {
							if (chain.rpc && chain.rpc.length > 0) {
								await ethereum.request({
									method: 'wallet_addEthereumChain',
									params: [{
										chainId,
										chainName: chain.name,
										nativeCurrency: chain.nativeCurrency,
										rpcUrls: chain.rpc
									}],
								})
							} else {
								throw new Error(`Chain ${chain.name} is not supported for now...`)
							}
						} catch (addError: any) {
							throw addError
						}
					} else {
						throw switchError
					}
				}
			} else {
				throw new Error(`Unable to switch into ${chain.name}`)
			}
		}
	}, [
		w3React.connector
	])

	useEffect(() => {
		if (w3React.active && w3React.chainId) {
			if (!w3ReactInited) {
				warn('w3 ready', w3React.chainId, w3React.connector)
				initW3React(true)
			}

			warn('w3 update state', w3React.chainId, w3React.connector)
			const chain = chains.find(chain => chain.chainId == w3React.chainId)
			if (chain) {
				log('w3.chainId -> set chain dropdown to', w3React.chainId)

				selectChain(chain)

				if (w3React.connector === network) {
					setSigner(signers[0])
				} else if (w3React.connector === injected) {
					setSigner(signers[1])
				} else if (w3React.connector === walletconnect) {
					setSigner(signers[2])
				}
			}
		}
	}, [
		w3React.active,
		w3React.chainId
	])

	useEffect(() => {
		warn('w3 connector change', w3React.connector)
		if (w3React.connector === network) {
			setSigner(signers[0])
		} else if (w3React.connector === injected) {
			setSigner(signers[1])
		} else if (w3React.connector === walletconnect) {
			setSigner(signers[2])
		}
	}, [
		w3React.connector
	])


	const router = useRouter()

	// handle JSON
	const [url, setUrl] = useState('')
	useEffect(() => {
		if (router.query.json) {

			if (w3ReactInited) {
				log('set urljson from url')
				setUrl(router.query.json as string)
			}
		}
	}, [
		router.query.json,
		w3ReactInited
	])

	const [source, setSource] = useState('')
	useEffect(() => {
		if (url) {
			(async () => {
				try {
					const jsonContent = await (await fetch(url)).json()

					log('url -> set source')
					setSource(url)

					log('url -> set json')
					setJson(jsonContent)
				} catch (err) {
					showError(err)
				}
			})()
		}
	}, [
		url
	])

	const readBrowsedFile = useCallback((event) => {
		const file = event.target.files?.item(0)
		if (file) {
			log('file -> set source')
			setSource(file.name)
			const reader = new FileReader()
			reader.readAsText(file, 'UTF-8')
			reader.onload = (evt) => {
				if (evt.target) {
					try {
						const jsonContent = JSON.parse(String(evt.target.result))

						log('file -> set json')
						setJson(jsonContent)
						toggleParamsLock(false)
					} catch (err) {
						showError(err)
					}
				}
			}
			reader.onerror = (err: any) => {
				showError(err)
			}
		}
	}, [])

	const [json, setJson] = useState<any>(null)
	useEffect(() => {
		if (json) {
			log('json provided')
			if (json['abi']) {
				// truffle
				const newFunctions = []
				for (let abi of json['abi']) {
					if (abi['type'] === 'function') {
						const func = abi as Function
						newFunctions.push(func)
					}
				}

				log('json (truffle) -> set function list')
				setFunctions(newFunctions)

				log('json (truffle) -> set abi')
				setAbi(json['abi'])
			} else if (typeof json === 'object' && json.length > 0 && json[0]['type']) {
				// array of functions
				const newFunctions = []
				for (let abi of json) {
					if (abi['type'] === 'function') {
						const func = abi as Function
						newFunctions.push(func)
					}
				}


				log('json (abi) -> set function list')
				setFunctions(newFunctions)

				log('json (abi) -> set abi')
				setAbi(json)
			} else {
				log('json (invalid) -> empty function list')
				setFunctions([])

				log('json (invalid) -> empty abi')
				setAbi([])
			}


		}
	}, [
		json
	])

	// chain
	const [selectedChain, selectChain] = useState<Chain | null | undefined>(null)
	const [signer, setSigner] = useState<Signer>(signers[0])

	const [address, setAddress] = useState('')
	const [paramsAreLocked, toggleParamsLock] = useState<boolean>(false)

	const selectSigner = useCallback(async (signer: Signer) => {
		try {
			warn('select signer', signer)
			if (signer.id === 'anonymous') {
				await w3React.activate(network, undefined, true)
			} else if (signer.id === 'browser') {
				await w3React.activate(injected, undefined, true)
			} else if (signer.id === 'walletconnect') {
				await w3React.activate(walletconnect, undefined, true)
			} else {
				throw new Error('Importing Private Key / Mnemonic is disabled for now')
			}
		} catch (err) {
			showError(err)
		}

		// setSigner(signer)
	}, [])

	useEffect(() => {
		let shoudlLockParams = false



		if (
			router.query.network
			|| router.query.func
			|| router.query.address
		) {
			shoudlLockParams = true
		} else {
			for (let key in router.query) {
				if (key.startsWith('args.')) {
					shoudlLockParams = true
					break
				}
			}
		}

		if (shoudlLockParams) {
			log('lock params')
			toggleParamsLock(true)
		}
	}, [
		router.query
	])

	useEffect(() => {
		if (w3ReactInited) {
			if (paramsAreLocked) {
				const chain = chains.find(chain => String(chain.chainId) == router.query.network)
				if (chain) {
					log('set network from url')

					switchW3Chain(chain)
						.catch(showError)

				}
			}
		}
	}, [
		w3ReactInited,
		paramsAreLocked,
		router.query.network
	])

	useEffect(() => {
		if (!paramsAreLocked || !router.query.network) {
			if (json) {
				if (json['networks']) {
					for (let networkId in json['networks']) {
						if (json['networks'][networkId]['address']) {
							const chain = chains.find(chain => String(chain.chainId) == networkId)
							if (chain) {
								log('json (truffle) -> set network')

								switchW3Chain(chain)
									.catch(showError)

								return
							}
						}
					}
				}
			}
		}
	}, [
		json,
		paramsAreLocked,
		router.query.network,
		w3React.connector
	])


	useEffect(() => {
		if (!paramsAreLocked || !router.query.address) {
			if (selectedChain && json) {
				if (json['networks'] && json['networks'][String(selectedChain.chainId)]) {
					log('set address from selectedChain')
					setAddress(json['networks'][String(selectedChain.chainId)]['address'] as string)
				}
			}
		}
	}, [
		router.query.address,
		paramsAreLocked,
		selectedChain,
		json
	])



	const [functions, setFunctions] = useState<Function[]>([])
	const [selectedFunction, selectFunction] = useState<Function | null | undefined>(null)

	const [functionArgs, setFunctionArguments] = useImmer<{ [name: string]: any }>({})
	const [functionEth, setFunctionEth] = useState<string>('')
	const [abi, setAbi] = useState<any[]>([])

	// global.functionArgs = functionArgs
	// global.functionEth = functionEth

	useEffect(() => {
		if (w3ReactInited) {
			if (paramsAreLocked) {
				if (router.query.func) {

					if (functions.length > 0) {
						const func = functions.find(f => f.name === router.query.func)

						if (func) {
							log('set function from url')
							selectFunction(func)
						}
					}
				}
			}
		}
	}, [
		w3ReactInited,
		paramsAreLocked,
		functions,
		router.query.func
	])

	useEffect(() => {
		if (w3ReactInited) {
			if (paramsAreLocked) {
				if (router.query.address) {
					log('set address from url')
					setAddress(router.query.address as string)
				}
			}
		}
	}, [
		w3ReactInited,
		paramsAreLocked,
		router.query.address
	])

	useEffect(() => {
		if (router.query) {
			if (paramsAreLocked) {
				log('set args from url')
				for (let key in router.query) {
					if (key.startsWith('args.')) {
						const argKey = key.substr(5)
						if (argKey.length > 0) {
							setFunctionArguments((draft: any) => {
								draft[argKey] = router.query[key]
							})
						}
					}
				}
			}
		}
	}, [
		w3ReactInited,
		paramsAreLocked,
		router.query
	])

	useEffect(() => {
		if (w3ReactInited) {
			if (paramsAreLocked) {
				if (router.query.eth) {
					log('set eth from url')
					setFunctionEth(router.query.eth as string)
				}
			}
		}
	}, [
		w3ReactInited,
		paramsAreLocked,
		router.query.eth
	])


	// interactive with contract
	const [resultDialogIsOpen, toggleResultDialog] = useState(false)
	const [result, setResult] = useState<{ type: string, data: ReadResult | WriteResult } | null>(null)
	const [isReading, toggleReading] = useState<boolean>(false)
	const [isWriting, toggleWriting] = useState<boolean>(false)

	// read contract
	const read = useCallback(async () => {
		try {
			if (!isAddress(address)) {
				throw new Error(`Invalid address ${address}`)
			}

			if (w3React.chainId !== selectedChain?.chainId) {
				log('switch chain', w3React.chainId, selectedChain?.chainId)
				await switchW3Chain(selectedChain as Chain)

				enqueueSnackbar(`Switched into ${(selectedChain as Chain).name}`, {
					variant: 'warning',
				})
			}


			toggleReading(true)



			const readContract = new Contract(
				address,
				abi,
				// w3React.library
				(w3React?.connector === network) ? w3React.library : w3React?.library?.getSigner()
			)

			recordEntry({
				abi: abi,
				network: selectedChain?.chainId as number,
				address,
				function: selectedFunction?.name as string,
				args: functionArgs,
				eth: ''
			})

			const readResult = await callWeb3Function(
				readContract as Contract,
				selectedFunction as Function,
				functionArgs
			)


			setResult({
				type: 'read',
				data: readResult
			})
			toggleResultDialog(true)

			enqueueSnackbar('Data queried successfully', {
				variant: 'success',
			})
			toggleReading(false)
		} catch (err: any) {
			toggleReading(false)
			showError(err)
		}
	}, [
		// readContract,
		address,
		abi,
		w3React.library,
		w3React.chainId,
		selectedFunction,
		selectedChain,
		functionArgs
	])


	// write contract
	const write = useCallback(async () => {
		try {
			if (!isAddress(address)) {
				throw new Error(`Invalid address ${address}`)
			}
			if (!w3React.library) {
				fatal('UNEXPECTED_ERROR', w3React.library)
				throw new Error(`Unexpected Error`)
			}

			if (w3React.chainId !== selectedChain?.chainId) {
				log('switch chain', w3React.chainId, selectedChain?.chainId)
				await switchW3Chain(selectedChain as Chain)

				enqueueSnackbar(`Switched into ${(selectedChain as Chain).name}`, {
					variant: 'warning',
				})
			}

			toggleWriting(true)

			const writeContract = new Contract(
				address,
				abi,
				// w3React.library
				w3React.library.getSigner()
			)

			if (w3React.connector === network) {
				showError('Please connect to your wallet')
			} else {

				recordEntry({
					abi: abi,
					network: selectedChain?.chainId as number,
					address,
					function: selectedFunction?.name as string,
					args: functionArgs,
					eth: functionEth
				})


				const writeResult = await callWeb3Function(
					writeContract as Contract,
					selectedFunction as Function,
					functionArgs,
					functionEth
				)

				writeResult.type = 'write'

				enqueueSnackbar(`Data sent successfully`, {
					variant: 'success',
				})


				setResult({
					type: 'write',
					data: writeResult
				})
				toggleResultDialog(true)

				writeResult.waitResult = await writeResult.wait()



				setResult({
					type: 'write',
					data: writeResult
				})
				toggleResultDialog(true)


				toggleWriting(false)
			}

		} catch (err: any) {
			toggleWriting(false)
			showError(err)
		}
	}, [
		address,
		abi,
		functionEth,
		w3React.library,
		w3React.connector,
		// writeContract,
		selectedFunction,
		selectedChain,
		functionArgs
	])

	// global.BigNumber = BigNumber
	// global.multiplyDecimals = multiplyDecimals

	return (
		<>
			<Grid container component='main' sx={{ height: '100vh' }}>
				<CssBaseline />
				<Grid
					item
					xs={false}
					sm={3}
					md={6}
					lg={7}
					sx={{
						backgroundImage: 'url(https://source.unsplash.com/featured/?crypto)',
						backgroundRepeat: 'no-repeat',
						backgroundColor: (t) =>
							t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
						backgroundSize: 'cover',
						backgroundPosition: 'center',
					}}
				/>
				<Grid item
					xs={12}
					sm={9}
					md={6}
					lg={5}
					component={Paper} elevation={6} square>
					<Box
						sx={{
							my: 8,
							mx: 4,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
							<AccountTreeIcon />
						</Avatar>
						<Typography component='h1' variant='h5'>
							Smart Contract UI
						</Typography>
						<Box component='div' sx={{
							mt: 1,
							width: '100%'
						}}>


							{(w3ReactInited) ? <>

								<SourceBrowser
									onFileChange={readBrowsedFile}

									source={source}
									onSourceChange={setSource}

									onUrlChange={url => {
										setUrl(url)

										toggleParamsLock(false)
									}}
									onJsonChange={jsonContent => {
										setJson(jsonContent)

										toggleParamsLock(false)
									}}

									onError={showError}


									chain={selectedChain}
									onChainChange={async (chain) => {
										// selectChain(chain)

										switchW3Chain(chain as Chain)

										toggleParamsLock(false)
									}}



									address={address}
									onAddressChange={setAddress}

									onAbiImport={importAbi}
								/>

								<br />
								<br />

								<ContractSelector
									chain={selectedChain}
									onChainChange={async (chain) => {
										// selectChain(chain)

										switchW3Chain(chain as Chain)

										toggleParamsLock(false)
									}}

									address={address}
									onAddressChange={setAddress}

									signer={signer}
									onSignerChange={selectSigner}
								/>


								<FunctionComposer
									selectedChain={selectedChain as Chain}
									functions={functions}

									func={selectedFunction}
									onFuncChange={selectFunction}


									args={functionArgs}
									setArgs={setFunctionArguments}

									read={read}
									isReading={isReading}
									toggleReading={toggleReading}

									write={write}
									isWriting={isWriting}
									toggleWriting={toggleWriting}
									canWrite={w3React && w3React.connector != network}


									signer={signer}
									onSignerChange={selectSigner}

									eth={functionEth}
									setEth={setFunctionEth}

									history={history}
									openHistoryEntry={openHistoryEntry}


								/>

							</> : <>
								<br />
								<LinearProgress />
								<br />
								<Box sx={{
									width: '100%',
									textAlign: 'center'
								}}>
									<Button startIcon={<ReplayIcon />} onClick={() => {
										window.location.reload()
									}}>Reload</Button>
								</Box>
							</>}


							<Typography sx={{ mt: 5 }} variant='body2' color='text.secondary' align='center'>
								© Martin Pham - {' '}
								<Link color='inherit' href='https://mph.am/'>
									mph.am
								</Link>
							</Typography>
						</Box>
					</Box>
				</Grid>
			</Grid>

			<ResultDialog
				isOpen={resultDialogIsOpen}
				onClose={() => {
					toggleResultDialog(false)
				}}
				result={result}
				onCopy={() => {
					enqueueSnackbar('Copied to clipboard', {
						variant: 'success'
					})
				}}
			/>
		</>
	)
}