import { useEffect, useCallback } from 'react'
import { useImmer } from 'use-immer'
import localForage from 'localforage'
import { HistoryEntry } from 'types/History'
import md5 from 'md5'

export const useHistory = (key: string = 'history', maxEntries: number = 5) => {
	const [history, setHistory] = useImmer<HistoryEntry[]>([])

	useEffect(() => {
		(async () => {
			const storedHistory = await localForage.getItem(key)
			if (storedHistory) {
				setHistory(storedHistory as HistoryEntry[])
			}
 		})()
	}, [])

	const add = useCallback((entry: HistoryEntry) => {
		setHistory(draft => {
			const sign = md5(JSON.stringify(entry))

			if(draft.findIndex(e => e.signature === sign) === -1) {
				
				draft.unshift({
					...entry,
					signature: sign
				})
	
				if(draft.length > maxEntries) {
					draft.splice(maxEntries)
				}
			}

		})
	}, [])

	const reset = useCallback(() => {
		setHistory([])
	}, [])

	useEffect(() => {
		(async () => {
			await localForage.setItem(key, history)
		})()
	}, [history])

	return [
		history, add, reset
	] as const
}