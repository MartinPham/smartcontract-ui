import { BigNumber } from "@ethersproject/bignumber"
import { Function, FunctionInput } from "types/Function"
import { Contract } from "@ethersproject/contracts"

export const normalizedArgValue: any = (type: string, value: any) => {
  if (type.endsWith("[]")) {
    const arrayItemType = type.substr(0, -2)
    const argArray = (value as string)
      .split(",")
      .map((val) => normalizedArgValue(arrayItemType, val))

    return argArray
  } else if (
    type.startsWith("int") ||
    type.startsWith("uint") ||
    type.startsWith("fixed") ||
    type.startsWith("unfixed")
  ) {
    // number
    return BigNumber.from(value)
  } else if (type === "bool") {
    return value ? true : false
  }

  // else
  return value || ""
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
  eth: BigNumber | null = null
) => {
  if (func && contract && funcArgs) {
    const args = calculateFunctionArguments(func.inputs, funcArgs)

    const overrides: { [key: string]: any } = {}
    if(func.stateMutability === "payable") {

      if (eth !== null && eth.gt(0)) {
        overrides.value = eth.toString()
      }
    }

    console.log("Call ", func.name, args, overrides, { contract })
    const result = await contract[func.name](...args, overrides)

    return result
  }

  console.error('UNEXPECTED_ERROR', {
    func, contract, funcArgs
  })

  throw new Error("Unexpected error")
}
