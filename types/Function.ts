export type Function = {
  name: string
  inputs: FunctionInput[]
  stateMutability: string
}

export type FunctionInput = {
  name: string
  type: string
}

export type FunctionOutput = {
  name: string
  type: string
}