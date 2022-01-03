import { BigNumber } from '@ethersproject/bignumber'
import { Function, FunctionInput } from 'types/Function'
import { Contract } from '@ethersproject/contracts'
import { log, fatal } from 'utils/logger'

export const multiplyDecimals = (
	number: string | number | undefined | null,
	decimals: string | number | undefined | null
) => {
	let numbersString = String(number || '0')
	const decimalsNumber = BigNumber.from(decimals || '0')

	let borrowed = 0
	if (numbersString.indexOf('.') > -1) {
		const components = numbersString.split('.')
		borrowed = components[1].length
		numbersString = numbersString.replace('.', '')
	}
	
	let finalNumber = BigNumber.from(numbersString)
	finalNumber = finalNumber.mul(BigNumber.from(10).pow(decimalsNumber))
	finalNumber = finalNumber.div(BigNumber.from(10).pow(borrowed))

	return finalNumber
}

export const normalizedArgValue: any = (type: string, value: any) => {
	if (type.endsWith('[]')) {
		const arrayItemType = type.substr(0, -2)
		const argArray = (value as string)
			.split(/,|\n/g)
			.filter((val) => val.trim().length > 0)
			.map((val) => normalizedArgValue(arrayItemType, val.trim()))

		return argArray
	} else if (
		type.startsWith('int') ||
		type.startsWith('uint') ||
		type.startsWith('fixed') ||
		type.startsWith('unfixed')
	) {
		// number
		const valueString = value || '0'
		const valueComponents = valueString.split('e')

		return multiplyDecimals(valueComponents[0], valueComponents[1] || '0')
	} else if (type === 'bool') {
		return value ? true : false
	}

	// else
	return value || ''
}

export const calculateFunctionArguments = (
	inputs: FunctionInput[],
	values: { [name: string]: any }
) => {
	const args: any[] = []

	for (let input of inputs) {
		const value = normalizedArgValue(input.type, values[input.name])
		args.push(value)
	}

	return args
}

export const callWeb3Function = async (
	contract: Contract,
	func: Function,
	funcArgs: { [name: string]: any },
	eth: string | null = null
) => {
	if (func && contract && funcArgs) {
		const args = calculateFunctionArguments(func.inputs, funcArgs)

		const overrides: { [key: string]: any } = {}
		if (func.stateMutability === 'payable') {
			if (eth !== null) {
				const ethValue = normalizedArgValue('uint256', eth)
				if (ethValue.gt(0)) {
					overrides.value = ethValue
				}
			}
		}

		log('Call ', func.name, args, overrides, { contract })
		const result = await contract[func.name](...args, overrides)

		return result
	}

	fatal('UNEXPECTED_ERROR', {
		func,
		contract,
		funcArgs,
	})

	throw new Error('Unexpected error')
}
