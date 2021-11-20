import { BigNumber } from '@ethersproject/bignumber'

export type ReadResult = {
  [key: string]: any
}

export type WriteResult = {
  hash: string
  value: BigNumber
  waitResult?: WriteWaitResult
}

export type WriteWaitResult = {
  blockHash: string
  blockNumber: number
  gasUsed: BigNumber
  events: WriteEvent[]
}
export type WriteEvent = {
  event: string
  args: {
    [key: string]: any
  }
}