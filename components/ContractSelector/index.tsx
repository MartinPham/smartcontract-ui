import { useState, MouseEvent } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { Chain } from 'types/Chain'
import { chains } from 'config/chains'
import Grid from '@mui/material/Grid'

import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import ShowerOutlinedIcon from '@mui/icons-material/ShowerOutlined';

import { QrTextField } from 'components/QrTextField'

export const ContractSelector = ({
	chain,
	onChainChange,
	address,
	onAddressChange
}: {
	chain: Chain | null | undefined,
	onChainChange: (chain: Chain | null | undefined) => void,

	address: string,
	onAddressChange: (address: string) => void,


}) => {


	const [chainSearchText, searchChain] = useState<string>('')

	const [faucetAnchorEl, setFaucetAnchorEl] = useState<null | HTMLElement>(null)
	const faucetListIsOpen = Boolean(faucetAnchorEl)

	const openFaucetList = (event: MouseEvent<HTMLElement>) => {
		setFaucetAnchorEl(event.currentTarget)
	}
	const closeFaucetList = () => {
		setFaucetAnchorEl(null)
	}

	const hasFaucet = chain && chain.faucets && chain.faucets.length > 0


	return (<>
		<Grid container spacing={1} justifyContent="space-between">
			<Grid item
				xs={hasFaucet ? 9 : 12}
				md={hasFaucet ? 10 : 12}
			>
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

			{hasFaucet && <>
				<Grid item
					sx={{
						textAlign: 'right'
					}}
					xs={3}
					md={2}>
					<Tooltip arrow title={`Get free ${chain.nativeCurrency.name} (${chain.nativeCurrency.symbol})`}>
						<Button variant="outlined" onClick={(evt) => {
							if (chain.faucets.length === 1) {
								window.open(chain.faucets[0])
							} else {
								openFaucetList(evt)
							}
						}} size="large" sx={{
							width: '56px',
							height: '56px'
						}}>
							<ShowerOutlinedIcon fontSize="large" />
						</Button>

					</Tooltip>
					<Menu
						anchorEl={faucetAnchorEl}
						open={faucetListIsOpen}
						onClose={closeFaucetList}
						onClick={closeFaucetList}
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
						{chain.faucets.map(faucet => {
							const components = faucet.split('/')

							return (
								<MenuItem key={faucet} onClick={() => {
									window.open(faucet)
								}}>
									{components[2]}
								</MenuItem>
							)
						})}

					</Menu>
				</Grid>
			</>}

		</Grid>
		<QrTextField
			margin='normal'
			required
			fullWidth
			id='address'
			label='Contract Address'
			name='address'
			autoComplete='off'
			value={address}
			onChange={(event: any) => onAddressChange(event.target.value)}
		/>
	</>)
}