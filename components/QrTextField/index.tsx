import { useState, useCallback } from 'react'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
// import QrReader from 'react-qr-reader'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import dynamic from 'next/dynamic'
import { fatal, log } from 'utils/logger'

const QrReader: any = global.document ? dynamic(() => import('react-qr-reader')) : () => null

export const QrTextField = ({
	value,
	onChange,
	...props
}: {
	value: any,
	onChange: (event: any) => void
} & any) => {

	const [qrModalIsOpen, toggleQrModal] = useState<boolean>(false)
	const closeQrModal = useCallback(() => {
		toggleQrModal(false)
	}, [])

	return (
		<>
			<TextField
				value={value}
				onChange={onChange}
				InputProps={{
					endAdornment: (
						<>
							<IconButton onClick={() => {
								toggleQrModal(true)
							}}>
								<QrCode2Icon />
							</IconButton>
						</>
					),
				}}
				{...props}
			/>

			<Dialog open={qrModalIsOpen} onClose={closeQrModal}>
				<DialogTitle>Scan QR Code</DialogTitle>
				<DialogContent>

					{global.document && <>
						<QrReader
							style={{
								width: window.innerWidth - 120,
								maxWidth: '500px'
							}}
							showViewFinder={false}
							// legacyMode={true}
							facingMode='environment'
							onError={fatal}
							onLoad={log}
							onScan={(result: any) => {
								if (result) {
									closeQrModal()
									onChange({
										target: {
											value: result
										}
									})
								}
							}}
						/>
					</>}
				</DialogContent>
				<DialogActions sx={{
					marginRight: '18px',
					marginBottom: '10px'
				}}>
					<Button onClick={closeQrModal}>Cancel</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}