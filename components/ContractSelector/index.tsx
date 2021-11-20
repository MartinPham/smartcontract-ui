import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { Chain } from 'types/Chain'
import { chains } from 'config/connectors'

export const ContractSelector = ({
	chain,
	onChainChange,
	text,
	onTextChange,
	address,
	onAddressChange
}: {
	chain: Chain | null | undefined,
	onChainChange: (chain: Chain | null | undefined) => void,
	text: string,
	onTextChange: (text: string) => void,
	address: string,
	onAddressChange: (address: string) => void
}) => {
	return (<>
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
			inputValue={text}
			onInputChange={(_, newInputValue) => {
				onTextChange(newInputValue)
			}}
		/>
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