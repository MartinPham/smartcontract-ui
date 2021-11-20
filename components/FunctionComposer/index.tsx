import { ReactElement, Fragment, forwardRef, useState, useCallback, useEffect } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import { Function } from 'types/Function'
import { Chain } from 'types/Chain'
import PageviewIcon from '@mui/icons-material/Pageview'
import CreateIcon from '@mui/icons-material/Create'
import LoadingButton from '@mui/lab/LoadingButton'
import LockIcon from '@mui/icons-material/Lock'
import NumberFormat from 'react-number-format'

interface NumberFormatComponentProps {
	onChange: (event: { target: { name: string; value: string } }) => void;
	name: string;
}

const NumberFormatComponent = forwardRef<NumberFormat, NumberFormatComponentProps>(
	function NumberFormatCustom(props, ref) {
		const { onChange, ...other } = props

		return (
			<NumberFormat
				{...other}
				getInputRef={ref}
				onValueChange={(values) => {
					onChange({
						target: {
							name: props.name,
							value: values.value,
						},
					})
				}}
				thousandSeparator
				isNumericString
			/>
		)
	},
)

const NumberTextField = ({
	label,
	value,
	decimalDisabled = false,
	onChange,
	...props
}: {
	label: string,
	value: any,
	decimalDisabled?: boolean,
	onChange: (event: any) => void
}) => {
	const [number, setNumber] = useState('')
	const [decimal, setDecimal] = useState('')


	const triggerOnChange = useCallback((_number, _decimal) => {
		const value = `${_number}e${_decimal || 0}`
		onChange(value)
	}, [])

	useEffect(() => {
		const valueString = String(value || '')
		const valueComponents = valueString.split('e')

		setNumber(valueComponents[0])
		setDecimal(valueComponents[1] || '0')
	}, [value])

	return (
		<TextField
			// type='number'
			margin='normal'
			fullWidth
			label={label}
			// value={value}
			value={number}
			onChange={event => {
				setNumber(event.target.value)
				triggerOnChange(event.target.value, decimal)
			}}
			InputProps={{
				inputComponent: NumberFormatComponent as any,

				endAdornment: (
					<>
						<TextField
							sx={{
								height: '10px',
								marginTop: '-24px',
								width: '160px'
							}}
							disabled={decimalDisabled}
							type='number'
							margin='normal'
							size='small'
							value={decimal}
							onChange={event => {
								setDecimal(event.target.value)
								
								triggerOnChange(number, event.target.value)
							}}
							InputProps={{
								startAdornment: <InputAdornment position='start'>x 10 ^ </InputAdornment>,
							}}
						/>
					</>
				),
			}}
			{...props}
		/>
	)
}

export const FunctionComposer = ({
	selectedChain,
	functions,
	func,
	onFuncChange,
	text,
	onTextChange,
	args,
	setArgs,
	eth,
	setEth,
	read,
	write,
	login,
	isReading,
	isWriting,
	isLoggingIn,
	canWrite
}: {
	selectedChain: Chain,
	functions: Function[],
	func: Function | null | undefined,
	onFuncChange: (func: Function | null | undefined) => void,
	text: string,
	onTextChange: (func: string) => void,
	args: { [name: string]: any },
	setArgs: (args: { [name: string]: any }) => void,
	eth: string,
	setEth: (eth: string) => void,
	read: () => void,
	write: () => void,
	login: () => void,
	isReading: boolean,
	isWriting: boolean,
	isLoggingIn: boolean,
	canWrite: boolean,
}) => {
	return (<>
		<br />
		<br />
		<Autocomplete
			disablePortal
			id='function'
			fullWidth
			options={functions}
			getOptionLabel={(option) => option.name}
			renderInput={(params) => <TextField {...params} required label='Function' />}
			value={func}
			onChange={(_, newValue: Function | null) => {
				onFuncChange(newValue)
			}}
			inputValue={text}
			onInputChange={(_, newInputValue) => {
				onTextChange(newInputValue)
			}}
		/>

		{func && func.inputs.map((input) => (
			<Fragment key={`${input.name}`}>
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
							<TextField
								multiline
								margin='normal'
								{...props}
							/>
						)
					} else if (
						input.type.startsWith('int') ||
						input.type.startsWith('uint') ||
						input.type.startsWith('fixed') ||
						input.type.startsWith('unfixed')
					) {
						// const value = args[input.name] || ''

						return (
							<NumberTextField
								{...props}
								onChange={(value) => {
									setArgs((draft: any) => {
										draft[input.name] = value
									})
								}}
							/>
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

		{func && <>
			{func.stateMutability === 'payable' && <>
				<NumberTextField
					label={`${selectedChain.nativeCurrency.symbol} Amount`}
					value={eth + 'e' + selectedChain.nativeCurrency.decimals}
					onChange={(value) => {
						setEth(value)
					}}
					decimalDisabled={true}
				/>

				<br />
			</>}

			<br />
			<Box sx={{ display: 'flex' }}>
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
								<LoadingButton
									loading={isLoggingIn}
									key='login'
									type='button'
									variant='contained'
									startIcon={<LockIcon />}
									sx={{ flexGrow: 1 }}
									onClick={login}
								>
									Login
								</LoadingButton>
							)
						}
					}

					return output
				})()}
			</Box>
		</>}
	</>)
}