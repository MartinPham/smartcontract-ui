import { ReactElement, Ref, forwardRef } from 'react'

import { TransitionProps } from '@mui/material/transitions'
import Slide from '@mui/material/Slide'

export const SlideUpTransition = forwardRef(function Transition(
	props: TransitionProps & {
		children: ReactElement<any, any>
	},
	ref: Ref<unknown>
) {
	return <Slide direction='up' ref={ref} {...props} />
})

