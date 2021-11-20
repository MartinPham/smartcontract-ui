import { useState, useEffect, useCallback } from 'react'
import { useImmer } from 'use-immer'
import { callWeb3Function } from 'utils/contracts'
import { useRouter } from 'next/router'
import { Function } from 'types/Function'
import { Chain } from 'types/Chain'
import { useWeb3React } from '@web3-react/core'
import { NetworkConnector } from '@web3-react/network-connector'
import { chains, network, injected } from 'config/connectors'
import { Contract } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'
import { useEagerConnect } from 'hooks/useEagerConnect'
import { useInactiveListener } from 'hooks/useInactiveListener'
import Avatar from '@mui/material/Avatar'
import CssBaseline from '@mui/material/CssBaseline'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import { SourceBrowser } from 'components/SourceBrowser'
import { ContractSelector } from 'components/ContractSelector'
import { FunctionComposer } from 'components/FunctionComposer'
import { ResultDialog } from 'components/ResultDialog'
import { ReadResult, WriteResult } from 'types/Result'



export default function Page() {
  const router = useRouter()




  // Update URL followed by json query param
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (router.query.json) {
      setUrl(router.query.json as string)
    }
  }, [
    router.query.json
  ])




  // snackbar
  const { enqueueSnackbar } = useSnackbar()




  // handle JSON
  const [json, setJson] = useState<any>({})
  const [source, setSource] = useState('')

  useEffect(() => {
    if (url) {
      (async () => {
        try {

          const jsonContent = await (await fetch(url)).json()

          setSource(url)
          setJson(jsonContent)
        } catch (err) {
          showError(err)
        }
      })()
    }
  }, [
    url
  ])

  const readBrowsedFile = useCallback((event) => {
    const file = event.target.files?.item(0)
    if (file) {
      setSource(file.name)
      const reader = new FileReader()
      reader.readAsText(file, "UTF-8")
      reader.onload = (evt) => {
        if (evt.target) {
          try {
            const jsonContent = JSON.parse(String(evt.target.result))
            setJson(jsonContent)
          } catch (err) {
            showError(err)
          }
        }
      }
      reader.onerror = (err: any) => {
        showError(err)
      }
    }
  }, [])

  useEffect(() => {
    if (json) {
      if (json['abi']) {
        // truffle
        const newFunctions = []
        for (let abi of json['abi']) {
          if (abi['type'] === 'function') {
            const func = abi as Function
            newFunctions.push(func)
          }
        }
        setFunctions(newFunctions)
        setAbi(json['abi'])
      } else if (typeof json === 'object' && json.length > 0 && json[0]['type']) {
        // array of functions
        const newFunctions = []
        for (let abi of json) {
          if (abi['type'] === 'function') {
            const func = abi as Function
            newFunctions.push(func)
          }
        }
        setFunctions(newFunctions)
        setAbi(json)
      } else {
        setFunctions([])
        setAbi([])
      }
      if (json['networks']) {
        // truffle
        for (let networkId in json['networks']) {
          if (json['networks'][networkId]['address']) {
            if (selectedChain) {

            } else {
              const chain = chains.find(chain => String(chain.chainId) == networkId)
              if (chain) {
                selectChain(chain)
              }

              setAddress(json['networks'][networkId]['address'] as string)
            }
          }
        }
      }
    }
  }, [
    json
  ])

  // handle w3
  const w3React = useWeb3React<Web3Provider>()

  const [activatingConnector, setActivatingConnector] = useState(undefined)
  useEffect(() => {
    if (activatingConnector && activatingConnector === w3React.connector) {
      setActivatingConnector(undefined)
    }
  }, [
    activatingConnector,
    w3React.connector
  ])

  const triedEager = useEagerConnect()
  useInactiveListener(!triedEager || !!activatingConnector)

  useEffect(() => {
    if (w3React.active) {
      const chain = chains.find(chain => chain.chainId == w3React.chainId)
      if (chain) {
        selectChain(chain)
      }
    }
  }, [
    w3React.active,
    w3React.chainId
  ])


  // handle chain, address, function, args
  const [selectedChain, selectChain] = useState<Chain | null | undefined>(null)
  const [chainSearchText, searchChain] = useState<string>('')
  const [address, setAddress] = useState('0x')
  const [contract, setContract] = useState<Contract | null>(null)
  const [functions, setFunctions] = useState<Function[]>([])
  const [abi, setAbi] = useState<any[]>([])
  const [selectedFunction, selectFunction] = useState<Function | null | undefined>(null)
  const [functionSearchText, searchFunction] = useState<string>('')
  const [functionArgs, setFunctionArguments] = useImmer<{ [name: string]: any }>({})
  const contractIsReady = address && address.length === 42

  useEffect(() => {
    if (selectedChain && json) {
      if (json['networks'] && json['networks'][String(selectedChain.chainId)]) {
        setAddress(json['networks'][String(selectedChain.chainId)]['address'] as string)
      }
    }
  }, [
    selectedChain,
    json
  ])

  useEffect(() => {
    if (w3React && w3React.library && abi && contractIsReady) {
      const newContract = new Contract(
        address,
        abi,
        w3React.library.getSigner()
      )

      setContract(newContract)
    }
  }, [
    w3React,
    address,
    abi
  ])


  // interactive with contract
  const [resultDialogIsOpen, toggleResultDialog] = useState(false)
  const [result, setResult] = useState<{ type: string, data: ReadResult | WriteResult } | null>(null)
  const [isReading, toggleReading] = useState<boolean>(false)
  const [isWriting, toggleWriting] = useState<boolean>(false)

  const showError = useCallback((error) => {
    let message = ''
    if (error['data'] && error['data']['message']) {
      message = error['data']['message']
    } else if (error['message']) {
      message = error['message']
    } else {
      message = error as string
    }
    enqueueSnackbar(message, {
      variant: "error",
    })
  }, [])

  // read contract
  const read = useCallback(async () => {
    try {
      toggleReading(true)
      const readResult = await callWeb3Function(
        contract as Contract,
        selectedFunction as Function,
        functionArgs
      )


      setResult({
        type: 'read',
        data: readResult
      })
      toggleResultDialog(true)

      enqueueSnackbar('Data queried successfully', {
        variant: "success",
      })
      toggleReading(false)
    } catch (err: any) {
      toggleReading(false)
      showError(err)
    }
  }, [
    contract,
    selectedFunction,
    functionArgs
  ])

  // write contract
  const write = useCallback(async () => {
    try {
      toggleWriting(true)
      const writeResult = await callWeb3Function(
        contract as Contract,
        selectedFunction as Function,
        functionArgs
      )

      writeResult.type = 'write'

      enqueueSnackbar(`Data sent successfully`, {
        variant: "success",
      })


      setResult({
        type: 'write',
        data: writeResult
      })
      toggleResultDialog(true)

      writeResult.waitResult = await writeResult.wait()



      setResult({
        type: 'write',
        data: writeResult
      })
      toggleResultDialog(true)


      toggleWriting(false)
    } catch (err: any) {
      toggleWriting(false)
      showError(err)
    }
  }, [
    contract,
    selectedFunction,
    functionArgs
  ])



  return (
    <>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={3}
          md={6}
          lg={7}
          sx={{
            backgroundImage: 'url(https://source.unsplash.com/featured/?crypto)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item
          xs={12}
          sm={9}
          md={6}
          lg={5}
          component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <AccountTreeIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Smart Contract UI
            </Typography>
            <Box component="div" sx={{
              mt: 1,
              width: '100%'
            }}>
              <SourceBrowser
                onFileChange={readBrowsedFile}

                source={source}
                onSourceChange={setSource}

                onUrlChange={setUrl}
                onJsonChange={setJson}

                onError={showError}
              />

              <br />
              <br />
              <ContractSelector
                chain={selectedChain}
                onChainChange={async (chain) => {
                  selectChain(chain)
                  if (w3React.connector === network) {
                    (w3React.connector as NetworkConnector).changeChainId(Number(chain?.chainId))
                  } else if (w3React.connector === injected) {
                    const ethereum = (global as { [key: string]: any })['ethereum']
                    const chainId = '0x' + Number(chain?.chainId).toString(16)
                    try {
                      await ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{
                          chainId
                        }],
                      })
                    } catch (error: any) {
                      if (error['code'] === 4902) {
                        try {
                          if(chain?.rpc && chain?.rpc.length > 0) {
                            await ethereum.request({
                              method: 'wallet_addEthereumChain',
                              params: [{
                                chainId,
                                chainName: chain?.name,
                                nativeCurrency: chain?.nativeCurrency,
                                rpcUrls: chain?.rpc
                              }],
                            })
                          } else {
                            throw new Error(`Chain ${chain?.name} is not supported for now...`)
                          }
                        } catch (error: any) {
                          showError(error)
                        }
                      }
                    }
                  }
                }}

                text={chainSearchText}
                onTextChange={searchChain}

                address={address}
                onAddressChange={setAddress}
              />

              {contractIsReady && (
                <FunctionComposer
                  functions={functions}

                  func={selectedFunction}
                  onFuncChange={selectFunction}

                  text={functionSearchText}
                  onTextChange={searchFunction}

                  args={functionArgs}
                  setArgs={setFunctionArguments}

                  read={read}
                  isReading={isReading}

                  write={write}
                  isWriting={isWriting}
                />
              )}



              <Typography sx={{ mt: 5 }} variant="body2" color="text.secondary" align="center">
                © Martin Pham - {' '}
                <Link color="inherit" href="https://mph.am/">
                  mph.am
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <ResultDialog
        isOpen={resultDialogIsOpen}
        onClose={() => {
          toggleResultDialog(false)
        }}
        result={result}
        onCopy={() => {
          enqueueSnackbar('Copied to clipboard', {
            variant: 'success'
          })
        }}
      />
    </>
  )
}