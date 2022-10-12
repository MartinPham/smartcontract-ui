import { useCallback } from 'react'

import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ReadResult, WriteResult, WriteEvent } from 'types/Result'

import ListSubheader from '@mui/material/ListSubheader'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import LinearProgress from '@mui/material/LinearProgress'

import copy from 'copy-to-clipboard'
import { Chain } from 'types/Chain'
import { BigNumber } from '@ethersproject/bignumber'
import { SlideUpTransition } from 'utils/transitions'


export const ResultDialog = ({
	chain,
	isOpen,
	onClose,
	result,
	onCopy
}: {
	chain: Chain,
	isOpen: boolean,
	onClose: () => void,
	result: { type: string, data: ReadResult | WriteResult } | null,
	onCopy: () => void
}) => {
	const copyText = useCallback((text) => {
		copy(text, {
			debug: true,
			format: 'text/plain',
			onCopy
		})
	}, [
		onCopy
	])

	// console.log(result)

	return (
		<Dialog
			fullWidth={true}
			maxWidth='md'
			open={isOpen}
			TransitionComponent={SlideUpTransition}
			keepMounted
			onClose={onClose}
			aria-describedby='config-dialog-description'
		>
			<DialogTitle>Result</DialogTitle>
			<DialogContent sx={{
				padding: 0,
				backgroundColor: 'background.paper'
			}}>

				{(() => {
					if (result === null) {
						return null
					} else {
						if (result.type === 'read') {
							return (
								<List
									sx={{ width: '100%' }}
									component='nav'
									subheader={
										<ListSubheader component='div' sx={{
											backgroundColor: 'action.hover'
										}}>
											Returned values
										</ListSubheader>
									}
								>
									{(() => {
										if (typeof result.data !== 'object') {
											return (
												<ListItemButton sx={{
													overflow: 'auto'
												}} onClick={() => copyText(result.data)}>
													<ListItemText primary={result.data} />
												</ListItemButton>
											)
										} else {
											const args = result.data as ReadResult
											const output = []

											for (let key in args) {
												output.push(
													<ListItemButton sx={{
														overflow: 'auto'
													}} key={key} onClick={() => copyText(args[key])}>
														<ListItemText primary={String(args[key])} secondary={key} />
													</ListItemButton>
												)
											}

											return output
										}
									})()}
								</List>
							)
						} else if (result.type === 'write') {
							return (<>
								{!result.data.waitResult && (<LinearProgress />)}
								<List
									sx={{ width: '100%' }}
									component='nav'
									subheader={<li />}
								>
									<li>
										<ul style={{ margin: 0, padding: 0 }}>
											<ListSubheader sx={{
												backgroundColor: 'divider'
											}}>Transaction</ListSubheader>
											{result.data.waitResult && (
												<ListItemButton sx={{
													overflow: 'auto'
												}} onClick={() => {
													copyText(result.data.waitResult.blockNumber)


													if (chain.explorers && chain.explorers.length > 0) {
														window.open(`${chain.explorers[0].url}/block/${result.data.waitResult.blockNumber}`)
													}

												}}>
													<ListItemText primary={`${result.data.waitResult.blockNumber} (${result.data.waitResult.blockHash})`} secondary='Block' />
												</ListItemButton>
											)}
											<ListItemButton sx={{
												overflow: 'auto'
											}} onClick={() => {
												copyText(result.data.hash)

												if (chain.explorers && chain.explorers.length > 0) {
													window.open(`${chain.explorers[0].url}/tx/${result.data.hash}`)
												}
											}}>
												<ListItemText primary={result.data.hash} secondary='TX Hash' />
											</ListItemButton>
											<ListItemButton sx={{
												overflow: 'auto'
											}} onClick={() => copyText(result.data.value.toString())}>
												<ListItemText primary={`${(() => {
													const decimal = BigNumber.from(10).pow(chain.nativeCurrency.decimals)

													if(result.data.value.gte(decimal)) {
														return result.data.value.div(decimal).toString()
													} else {
														const round = 1e6
														return Number(result.data.value.mul(round).div(decimal).toString()) / round
													}

												})()} ${chain.nativeCurrency.symbol} (${result.data.value.toString()} wei)`} secondary={`Value`} />
											</ListItemButton>
										</ul>
									</li>
									<li>
										{result.data.waitResult && result.data.waitResult.events.length > 0 && (
											<ul style={{ margin: 0, padding: 0 }}>
												<ListSubheader sx={{
													backgroundColor: 'divider'
												}}>Events</ListSubheader>
												{result.data.waitResult.events.map((event: WriteEvent, index: number) => (
													<ul style={{ margin: 0, padding: 0 }} key={index}>
														<ListSubheader sx={{
															backgroundColor: 'action.hover',
															lineHeight: '30px'
														}}>{event.event}</ListSubheader>
														{(() => {
															const args = event.args
															const output = []

															for (let key in args) {
																output.push(
																	<ListItemButton sx={{
																		overflow: 'auto'
																	}} key={key} onClick={() => copyText(args[key])}>
																		<ListItemText primary={String(args[key])} secondary={key} />
																	</ListItemButton>
																)
															}

															return output
														})()}

													</ul>
												))}
											</ul>
										)}
									</li>
								</List>

							</>)
						}

						return null
					}
				})()}

			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>OK</Button>
			</DialogActions>
		</Dialog>
	)
}