import { useState, useEffect } from 'react'

import { anonymous, injected } from 'config/connectors'
import { useWeb3React } from '@web3-react/core'

export const useEagerConnect = () => {
  const { activate, active } = useWeb3React()

  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
				activate(anonymous, undefined, true).catch(() => {
					setTried(true)
				})

        // binance.isAuthorized().then((isAuthorized: boolean) => {
				// 	if (isAuthorized) {
				// 		activate(binance, undefined, true).catch(() => {
				// 			setTried(true)
				// 		})
				// 	} else {
				// 		// setTried(true)
				// 		activate(network, undefined, true).catch(() => {
				// 			setTried(true)
				// 		})
				// 	}
				// })
      }
    })
  }, []) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true)
    }
  }, [tried, active])

  return tried
}
