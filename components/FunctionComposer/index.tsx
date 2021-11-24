import { ReactElement, Fragment, useState, useCallback, MouseEvent } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import { Function } from 'types/Function'
import { Chain } from 'types/Chain'
import PageviewIcon from '@mui/icons-material/Pageview'
import CreateIcon from '@mui/icons-material/Create'
import LoadingButton from '@mui/lab/LoadingButton'
import LockIcon from '@mui/icons-material/Lock'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Link from '@mui/material/Link'
import { HistoryEntry } from 'types/History'
import Button from '@mui/material/Button'
import BlockIcon from '@mui/icons-material/Block'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import { signers } from 'config/signers'
import { Signer } from 'types/Signer'
import Tooltip from '@mui/material/Tooltip'
import ListItemIcon from '@mui/material/ListItemIcon'
import Grid from '@mui/material/Grid'
import { Wallet } from '@ethersproject/wallet'
import Alert from '@mui/material/Alert'
import { NumberTextField } from 'components/NumberTextField'
import { QrTextField } from 'components/QrTextField'
import { SlideUpTransition } from 'utils/transitions'

export const FunctionComposer = ({
	chain,
	functions,
	func,
	onFuncChange,

	args,
	setArgs,
	eth,
	setEth,
	read,
	toggleReading,
	write,
	toggleWriting,
	isReading,
	isWriting,
	canWrite,
	history,
	openHistoryEntry,


	signer,
	onSignerChange,

	onError
}: {
	chain: Chain,
	functions: Function[],
	func: Function | null | undefined,
	onFuncChange: (func: Function | null | undefined) => void,

	args: { [name: string]: any },
	setArgs: (args: { [name: string]: any }) => void,
	eth: string,
	setEth: (eth: string) => void,
	read: () => void,
	toggleReading: (flag: boolean) => void,
	write: () => void,
	toggleWriting: (flag: boolean) => void,
	isReading: boolean,
	isWriting: boolean,
	canWrite: boolean,
	history: HistoryEntry[],
	openHistoryEntry: (entry: HistoryEntry) => void,
	onError: (err: any) => void,

	signer: Signer,
	onSignerChange: (signer: Signer, data?: any) => void
}) => {
	const [historyAnchorEl, setHistoryAnchorEl] = useState<null | HTMLElement>(null)
	const historyIsOpen = Boolean(historyAnchorEl)
	const openHistory = (event: MouseEvent<HTMLElement>) => {
		setHistoryAnchorEl(event.currentTarget)
	};
	const closeHistory = () => {
		setHistoryAnchorEl(null)
	}

	const [functionSearchText, searchFunction] = useState<string>('')

	const [connectDialogIsOpen, toggleConnectDialog] = useState<boolean>(false)
	const closeConnectDialog = () => {
		toggleConnectDialog(false)
	}

	const [signerAnchorEl, setSignerAnchorEl] = useState<null | HTMLElement>(null)
	const signerMenuIsOpen = Boolean(signerAnchorEl)

	const openSignerMenu = (event: MouseEvent<HTMLElement>) => {
		setSignerAnchorEl(event.currentTarget)
	}
	const closeSignerMenu = () => {
		setSignerAnchorEl(null)
	}


	const [importWalletIsOpen, toggleWalletImport] = useState(false)
	const closeWalletImport = () => {
		toggleWalletImport(false)
	}


	const createWallet = useCallback((key) => {
		let keyString = key
		keyString = keyString.trim()

		let wallet = null
		if (keyString.indexOf(' ') > -1) {
			wallet = Wallet.fromMnemonic(key)
		} else {
			wallet = new Wallet(keyString)
		}

		if (!wallet) {
			throw new Error('Cannot import wallet')
		}

		return wallet
	}, [])

	const [temporarySigner, setTemporarySigner] = useState(signer)
	const [walletKey, setWalletKey] = useState('')
	const importWallet = useCallback(() => {
		try {
			const wallet = createWallet(walletKey)
			toggleWalletImport(false)
			onSignerChange(temporarySigner, wallet)
		} catch (err) {
			setWalletKey('')
			onError(err)
		}
	}, [walletKey, temporarySigner])

	const selectSigner = useCallback((signer: Signer) => {
		if (signer.id === 'key') {
			if (walletKey === '') {
				setTemporarySigner(signer)
				toggleWalletImport(true)
			} else {
				const wallet = createWallet(walletKey)
				onSignerChange(signer, wallet)
			}

		} else {
			onSignerChange(signer, walletKey)
		}
	}, [walletKey])

	return (<>

		<br />
		<br />

		<Grid container spacing={1}>
			<Grid item
				xs={10}>
				<Autocomplete
					disablePortal
					id='function'
					fullWidth
					options={functions}
					getOptionLabel={(option) => option.name}
					renderInput={(params) => <TextField {...params} required label='Function' helperText={
						history.length > 0 && <>
							Or browse from <Link sx={{ cursor: 'pointer' }} onClick={openHistory}>your history</Link>
						</>
					} />}
					value={func}
					onChange={(_, newValue: Function | null) => {
						onFuncChange(newValue)
					}}
					inputValue={functionSearchText}
					onInputChange={(_, newInputValue) => {
						searchFunction(newInputValue)
					}}

				/>


				<Menu
					anchorEl={historyAnchorEl}
					open={historyIsOpen}
					onClose={closeHistory}
					onClick={closeHistory}
					PaperProps={{
						style: {
							maxHeight: 200
						},
						elevation: 0,
						sx: {
							overflow: 'visible',
							filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
							mt: 1.5,
							'& .MuiAvatar-root': {
								width: 32,
								height: 32,
								ml: -0.5,
								mr: 1,
							},
							'&:before': {
								content: '""',
								display: 'block',
								position: 'absolute',
								top: 0,
								right: 14,
								width: 10,
								height: 10,
								bgcolor: 'background.paper',
								transform: 'translateY(-50%) rotate(45deg)',
								zIndex: 0,
							},
						},
					}}
					transformOrigin={{ horizontal: 'right', vertical: 'top' }}
					anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
				>
					{history && history.map((entry, index) => (
						<MenuItem key={index} onClick={() => {
							openHistoryEntry(entry)
						}}>
							{entry.function} (ChainID: {entry.network})
						</MenuItem>
					))}
				</Menu>

			</Grid>
			<Grid item
				sx={{
					textAlign: 'center'
				}}
				xs={2}>
				<Tooltip arrow title={`Signer: ${signer.name}`}>
					<Button onClick={openSignerMenu} sx={{
						height: '56px'
					}}>
						<Avatar color='primary'>
							{(() => {
								const Icon = signer.icon
								return (
									<Icon sx={{ fontSize: 30 }} />
								)
							})()}
						</Avatar>
					</Button>

				</Tooltip>
				<Menu
					anchorEl={signerAnchorEl}
					open={signerMenuIsOpen}
					onClose={closeSignerMenu}
					onClick={closeSignerMenu}
					PaperProps={{
						elevation: 0,
						sx: {
							overflow: 'visible',
							filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
							mt: 1.5,
							'& .MuiAvatar-root': {
								width: 32,
								height: 32,
								ml: -0.5,
								mr: 1,
							},
							'&:before': {
								content: '""',
								display: 'block',
								position: 'absolute',
								top: 0,
								right: 26,
								width: 10,
								height: 10,
								bgcolor: 'background.paper',
								transform: 'translateY(-50%) rotate(45deg)',
								zIndex: 0,
							},
						},
					}}
					transformOrigin={{ horizontal: 'right', vertical: 'top' }}
					anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
				>
					{signers.map(s => {
						const Icon = s.icon

						return (
							<MenuItem key={s.id} selected={signer.id === s.id} onClick={() => {
								selectSigner(s)
							}}>
								<ListItemIcon>
									<Icon fontSize="small" />
								</ListItemIcon> {s.name}
							</MenuItem>
						)
					})}

				</Menu>

				<Dialog TransitionComponent={SlideUpTransition} open={importWalletIsOpen} onClose={closeWalletImport}>
					<DialogTitle>Import Wallet</DialogTitle>
					<DialogContent>
						<DialogContentText>
							You can import the wallet from a private key, or from mnemonic words.

							<br />
							<br />
							<Alert severity="info">Your data <b>WILL NOT BE</b> saved anywhere</Alert>
							<br />
						</DialogContentText>
						<QrTextField
							autoFocus
							type='password'
							label="Private key / Mnemonic words"
							fullWidth
							value={walletKey}
							onChange={(event: any) => setWalletKey(event.target.value)}
						/>
					</DialogContent>
					<DialogActions sx={{
						marginRight: '18px',
						marginBottom: '10px'
					}}>
						<Button onClick={closeWalletImport}>Cancel</Button>
						<Button
							variant='contained' onClick={importWallet}>Import</Button>
					</DialogActions>
				</Dialog>
			</Grid>
		</Grid>



		<div style={{
			clear: 'both',
		}}>
		{func && func.inputs.map((input, index) => (
			<Fragment key={`${input.name}-${index}`}>
				{(() => {
					const props = {
						fullWidth: true,
						id: input.name,
						label: `${input.name} (${input.type})`,
						name: input.name,
						autoComplete: input.name,
						value: args[input.name] || '',
						onChange: (event: any) => {
							setArgs((draft: any) => {
								draft[input.name] = event.target.value
							})
						}
					}
					if (input.type.endsWith('[]')) {
						return (
							<Tooltip arrow title='Multiple values, you can separate each value by new line'>
							<TextField
								multiline
								margin='normal'
								{...props}
							/>
							</Tooltip>
						)
					} else if (
						input.type.startsWith('int') ||
						input.type.startsWith('uint') ||
						input.type.startsWith('fixed') ||
						input.type.startsWith('unfixed')
					) {
						// const value = args[input.name] || ''

						return (
							<Tooltip arrow title={<>
								Numeric value<br />You can use the exponential box, example: 5 x 10^3 = 5000
							</>}>
								<span style={{
									float: 'left',
									width: '100%',
									clear: 'both',
								}}>
								<NumberTextField
									{...props}
									onChange={(value: any) => {
										setArgs((draft: any) => {
											draft[input.name] = value
										})
									}}
									margin='normal'
									fullWidth
								/>
								</span>
							</Tooltip>
						)
					} else if (input.type === 'address') {
						return (
							<Tooltip arrow title='An Ethereum address (0x....)'>
								<QrTextField
									margin='normal'
									{...props}
								/>
							</Tooltip>
						)
					} else if (input.type === 'string') {
						return (
							<Tooltip arrow title='Text-based value'>
								<TextField
									margin='normal'
									{...props}
								/>
							</Tooltip>
						)
					} else {
						return (
							<TextField
								margin='normal'
								{...props}
							/>
						)
					}
				})()}

				<br />
			</Fragment>
		))}
		</div>
		{func && <>
			{func.stateMutability === 'payable' && <>
				<NumberTextField
				margin='normal'
				fullWidth
					label={`${chain.nativeCurrency.symbol} Amount`}
					value={eth + 'e' + chain.nativeCurrency.decimals}
					onChange={(value: any) => {
						setEth(value)
					}}
					decimalDisabled={true}
				/>

				<br />
			</>}

			<Box sx={{ display: 'flex', clear: 'both', marginTop: '10px' }}>
				{(() => {
					const output: ReactElement[] = []

					if (
						func.stateMutability === 'pure'
						|| func.stateMutability === 'view') {
						output.push(
							<LoadingButton
								loading={isReading}
								key='read'
								type='button'
								color='success'
								variant='contained'
								startIcon={<PageviewIcon />}
								sx={{ flexGrow: 1 }}
								onClick={read}
							>
								Read
							</LoadingButton>
						)
					}

					if (
						func.stateMutability === 'payable'
						|| func.stateMutability === 'nonpayable') {
						if (output.length > 0) {
							output.push(<span key='space'> &nbsp; &nbsp; </span>)
						}

						if (canWrite) {
							output.push(
								<LoadingButton
									loading={isWriting}
									key='write'
									type='button'
									color='info'
									variant='contained'
									startIcon={<CreateIcon />}
									sx={{ flexGrow: 1 }}
									onClick={write}
								>
									Write
								</LoadingButton>
							)
						} else {
							output.push(
								<Fragment key='login'>
									<LoadingButton
										loading={false}
										type='button'
										variant='contained'
										color='warning'
										startIcon={<LockIcon />}
										sx={{ flexGrow: 1 }}
										onClick={() => {
											toggleConnectDialog(true)
										}}
									>
										Connect to Wallet
									</LoadingButton>

								</Fragment>
							)
						}
					}

					return output
				})()}


				<Dialog TransitionComponent={SlideUpTransition} onClose={closeConnectDialog} open={connectDialogIsOpen}>
					<DialogTitle>Connect to your wallet</DialogTitle>
					<List sx={{ pt: 0 }}>
						{signers.map((s) => {
							if (s.id === 'anonymous') return null

							const Icon = s.icon
							return (
								<ListItem key={s.id} selected={signer.id === s.id} button onClick={() => {
									selectSigner(s)
									closeConnectDialog()
								}}>
									<ListItemAvatar>
										<Avatar>
											<Icon />
										</Avatar>
									</ListItemAvatar>
									<ListItemText primary={s.name} secondary={s.description} />
								</ListItem>
							)
						})}
					</List>
					<DialogActions>
						<Button onClick={closeConnectDialog}>Cancel</Button>
					</DialogActions>
				</Dialog>
			</Box>

			{isReading && <>
				<Box sx={{
					marginTop: '15px',
					width: '100%',
					textAlign: 'center'
				}}>
					<Button
						color='error'
						variant='outlined'
						fullWidth
						startIcon={<BlockIcon />}
						onClick={() => {
							toggleReading(false)
						}}>Stop</Button>
				</Box>
			</>}

			{isWriting && <>
				<Box sx={{
					marginTop: '15px',
					width: '100%',
					textAlign: 'center'
				}}>
					<Button
						color='error'
						variant='outlined'
						fullWidth
						startIcon={<BlockIcon />}
						onClick={() => {
							toggleWriting(false)
						}}>Stop</Button>
				</Box>
			</>}
		</>}



	</>)
}