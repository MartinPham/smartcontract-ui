import { useRef, MouseEvent, useState, useCallback } from 'react'
import TextField from '@mui/material/TextField'
import LoadingButton from '@mui/lab/LoadingButton'
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

import { SlideUpTransition } from 'utils/transitions'

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

	onAbiImport,

	importDialogIsOpen,
	toggleImportDialog
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

	importDialogIsOpen: boolean,
	toggleImportDialog: (open: boolean) => void
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

	const [isImporting, toggleImportStatus] = useState(false)

	const closeImportDialog = useCallback(() => {
		toggleImportStatus(false)
		toggleImportDialog(false)
	}, [])

	const [chainSearchText, searchChain] = useState<string>('')

	const importAbi = useCallback(async () => {
		if (chain) {
			const abiUrl = chain.abi?.replace('${ADDRESS}', address)

			if(abiUrl) {


				const [jsonPath, url] = abiUrl?.split(' ') as string[]

				if (jsonPath && url) {
					let data = ''
					try {
						toggleImportStatus(true)

						data = await (await fetch(url, {
	
						})).json()
	
						const abiJson = query(data, jsonPath)

						data = abiJson

						log(data)
	
						const abi = JSON.parse(abiJson)
	
						log('abi', abi)
						onAbiImport(abi)
	
						toggleImportDialog(false)
						toggleImportStatus(false)
					} catch (error) {
						toggleImportStatus(false)
						onError('Invalid ABI received: ' + data)
					}
				}
			} else {
				onError(`Unfortunately, importing SmartContract from ${chain.name} is not supported for now`)
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
						Try an example <Link href='/?json=/UniswapV2.json&address=0x7a250d5630b4cf539739df2c5dacb4c659f2488d&func=getAmountsOut&args.amountIn=0.1e18&args.path=0x1f9840a85d5af5bf1d1762f925bdaddc4201f984, 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&network=1'>here</Link>, <Link href='/?json=/HelloWorld.json'>here</Link> or <Link sx={{ cursor: 'pointer' }} onClick={() => {
							toggleImportDialog(true)
						}}>import it here</Link>
					</>}
				/>


			</Tooltip>

			<Dialog TransitionComponent={SlideUpTransition} open={importDialogIsOpen} onClose={closeImportDialog}>
				<DialogTitle>Import SmartContract ABI</DialogTitle>
				<DialogContent>
					<DialogContentText>
						You can import the SmartContract's ABI code by specifying its deployed network and address.
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
					<LoadingButton loading={isImporting} onClick={importAbi}
						variant='contained'>Import</LoadingButton>
				</DialogActions>
			</Dialog>
		</>
	)
}