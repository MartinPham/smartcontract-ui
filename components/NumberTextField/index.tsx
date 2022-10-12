import { forwardRef, useState, useCallback, useEffect } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
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

export const NumberTextField = ({
	value,
	decimalDisabled = false,
	onChange,
	...props
}: {
	value: any,
	decimalDisabled?: boolean,
	onChange: (event: any) => void
} & any) => {
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