export type HistoryEntry = {
	signature?: string,
	abi: any[],
	network: number,
	address: string,
	function: string,
	eth: string,
	args: { [key: string]: any }
}