import { useRef, MouseEvent, useState, useCallback } from 'react'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import Link from '@mui/material/Link'
import Tooltip from '@mui/material/Tooltip'
import { Instance } from '@popperjs/core'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import { chains } from 'config/chains'
import { Chain } from 'types/Chain'
import { query } from 'utils/jsonQuery'
import Autocomplete from '@mui/material/Autocomplete'
import { log } from 'utils/logger'

export const SourceBrowser = ({
	onFileChange,
	source,
	onSourceChange,
	onUrlChange,
	onJsonChange,
	onError,

	chain,
	onChainChange,


	address,
	onAddressChange,

	onAbiImport
}: {
	onFileChange: (event: any) => void,
	source: string,
	onSourceChange: (source: string) => void,
	onUrlChange: (url: string) => void,
	onJsonChange: (json: any) => void,
	onError: (err: any) => void,


	chain: Chain | null | undefined,
	onChainChange: (chain: Chain | null | undefined) => void,


	
	address: string,
	onAddressChange: (address: string) => void,

	onAbiImport: (abi: any) => void,
}) => {
	const positionRef = useRef<{ x: number; y: number }>({
		x: 0,
		y: 0,
	})
	const popperRef = useRef<Instance>(null)
	const areaRef = useRef<HTMLDivElement>(null)

	const handleMouseMove = useCallback((event: MouseEvent) => {
		positionRef.current = { x: event.clientX, y: event.clientY }

		if (popperRef.current != null) {
			popperRef.current.update()
		}
	}, [
		positionRef,
		popperRef
	])

	const [importDialogIsOpen, toggleImportDialog] = useState(false)

	const closeImportDialog = useCallback(() => {
		toggleImportDialog(false)
	}, [])

	const [chainSearchText, searchChain] = useState<string>('')

	const importAbi = useCallback(async () => {
		if (chain) {
			const abiUrl = chain.abi?.replace('${ADDRESS}', address)

			const [jsonPath, url] = abiUrl?.split(' ') as string[]

			if (jsonPath && url) {
				try {
					const data = await (await fetch(url, {

					})).json()

					const abiJson = query(data, jsonPath)

					const abi = JSON.parse(abiJson)

					log('abi', abi)
					onAbiImport(abi)

					toggleImportDialog(false)
				} catch (error) {
					onError(error)
				}
			}
		}
	}, [
		chain,
		address
	])

	return (
		<>
			<Tooltip
				title="You can paste the SmartContract's ABI/Artifact code, an URL of this code, or browse for an ABI/Artiface file from your device."
				arrow
				PopperProps={{
					popperRef,
					anchorEl: {
						getBoundingClientRect: () => {
							return new DOMRect(
								positionRef.current.x,
								areaRef.current!.getBoundingClientRect().y + 75,
								0,
								0,
							)
						},
					},
				}}
			>
				<TextField
					inputRef={areaRef}
					onMouseMove={handleMouseMove}
					InputProps={{
						endAdornment: (
							<>
								<IconButton
									aria-label='upload'
									component='label'
								>
									<UploadFileIcon />
									<input
										hidden
										accept='application/JSON'
										type='file'
										onChange={onFileChange}
									/>
								</IconButton>
							</>
						),
					}}
					margin='normal'
					value={source}
					onChange={event => {
						onSourceChange(event.target.value)
					}}
					onKeyUp={event => {
						if (event.key === 'Enter') {
							if (source.startsWith('http')) {
								onUrlChange(source)
							} else {
								try {
									const jsonContent = JSON.parse(source)
									onJsonChange(jsonContent)
								} catch (err) {
									onError(err)
								}
							}
						}
					}}
					fullWidth
					id='file'
					label='SmartContract ABI'
					name='file'
					autoComplete='off'
					helperText={<>
						Try an example <Link href='/?json=/HelloWorld.json'>here</Link>, <Link href='/?json=/Swap.json&address=0xc0fFee0000C824D24E0F280f1e4D21152625742b&func=getAmountsOut&args.amountIn=0.1e18&args.path=0x0039f574ee5cc39bdd162e9a88e3eb1f111baf48, 0xc0ffeE0000921eB8DD7d506d4dE8D5B79b856157&network=321'>here</Link> or <Link sx={{ cursor: 'pointer' }} onClick={() => {
							toggleImportDialog(true)
						}}>import it here</Link>
					</>}
				/>


			</Tooltip>

			<Dialog open={importDialogIsOpen} onClose={closeImportDialog}>
				<DialogTitle>Import SmartContract ABI</DialogTitle>
				<DialogContent>
					<DialogContentText>
						You could import the SmartContract's ABI code by specifying its deployed network and address.
						<br />
						<br />
					</DialogContentText>
					<Grid container spacing={2}>
						<Grid item
							xs={12}
							md={4}
						>
							<Autocomplete
								// disablePortal
								fullWidth
								options={chains}
								getOptionLabel={(option) => option.name}
								renderInput={(params) => <TextField {...params} label='Network' />}
								value={chain}
								onChange={(_, newValue: Chain | null) => {
									if (newValue !== null) {
										if (!newValue.abi) {
											onError(`Unfortunately, importing SmartContract from ${newValue.name} is not supported for now`)
											return
										}
									}
									onChainChange(newValue)
								}}
								inputValue={chainSearchText}
								onInputChange={(_, newInputValue) => {
									searchChain(newInputValue)
								}}
							/>
						</Grid>
						<Grid item
							xs={12}
							md={8}
						>
							<TextField
								autoFocus
								label="Contract's Address"
								type='text'
								fullWidth
								value={address}
								onChange={event => onAddressChange(event.target.value)}
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions sx={{
					marginRight: '18px',
					marginBottom: '10px'
				}}>
					<Button onClick={closeImportDialog}>Cancel</Button>
					<Button onClick={importAbi}
						variant='contained'>Import</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}