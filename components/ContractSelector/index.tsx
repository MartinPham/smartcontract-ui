import { useState, MouseEvent } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { Chain } from 'types/Chain'
import { chains } from 'config/chains'
import Grid from '@mui/material/Grid'

import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Tooltip from '@mui/material/Tooltip'

import { signers } from 'config/signers'
import { Signer } from 'types/Signer'

export const ContractSelector = ({
	chain,
	onChainChange,
	address,
	onAddressChange,
	signer,
	onSignerChange
}: {
	chain: Chain | null | undefined,
	onChainChange: (chain: Chain | null | undefined) => void,

	address: string,
	onAddressChange: (address: string) => void,

	signer: Signer,
	onSignerChange: (signer: Signer) => void

}) => {


	const [chainSearchText, searchChain] = useState<string>('')

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const open = Boolean(anchorEl)

	const handleClick = (event: MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget)
	}
	const handleClose = () => {
		setAnchorEl(null)
	}


	return (<>
		<Grid container spacing={1}>
			<Grid item
				xs={10}>
				<Autocomplete
					disablePortal
					id='chains'
					fullWidth
					options={chains}
					getOptionLabel={(option) => option.name}
					renderInput={(params) => <TextField {...params} required label='Network' />}
					value={chain}
					onChange={(_, newValue: Chain | null) => {
						onChainChange(newValue)
					}}
					inputValue={chainSearchText}
					onInputChange={(_, newInputValue) => {
						searchChain(newInputValue)
					}}
				/>
			</Grid>
			<Grid item
				sx={{
					textAlign: 'center'
				}}
				xs={2}>
				<Tooltip arrow title={signer.name}>
					<Button onClick={handleClick} sx={{
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
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
					onClick={handleClose}
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
								onSignerChange(s)
							}}>
								<ListItemIcon>
									<Icon fontSize="small" />
								</ListItemIcon> {s.name}
							</MenuItem>
						)
					})}

				</Menu>
			</Grid>
		</Grid>
		<TextField
			margin='normal'
			required
			fullWidth
			id='address'
			label='Contract Address'
			name='address'
			autoComplete='off'
			value={address}
			onChange={event => onAddressChange(event.target.value)}
		/>
	</>)
}