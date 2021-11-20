import { ReactElement, Fragment } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import { Function } from 'types/Function'
import PageviewIcon from '@mui/icons-material/Pageview'
import CreateIcon from '@mui/icons-material/Create'
import LoadingButton from '@mui/lab/LoadingButton'
import LockIcon from '@mui/icons-material/Lock'

export const FunctionComposer = ({
  functions,
  func,
  onFuncChange,
  text,
  onTextChange,
  args,
  setArgs,
  read,
  write,
  login,
  isReading,
  isWriting,
  isLoggingIn,
  canWrite
}: {
  functions: Function[],
  func: Function | null | undefined,
  onFuncChange: (func: Function | null | undefined) => void,
  text: string,
  onTextChange: (func: string) => void,
  args: { [name: string]: any },
  setArgs: (args: { [name: string]: any }) => void,
  read: () => void,
  write: () => void,
  login: () => void,
  isReading: boolean,
  isWriting: boolean,
  isLoggingIn: boolean,
  canWrite: boolean,
}) => {
  return (<>
    <br />
    <br />
    <Autocomplete
      disablePortal
      id="function"
      fullWidth
      options={functions}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => <TextField {...params} label="Function" />}
      value={func}
      onChange={(_, newValue: Function | null) => {
        onFuncChange(newValue)
      }}
      inputValue={text}
      onInputChange={(_, newInputValue) => {
        onTextChange(newInputValue)
      }}
    />

    {func && func.inputs.map((input) => (
      <Fragment key={`${input.name}`}>
        <TextField
          margin="normal"
          fullWidth
          id={input.name}
          label={`${input.name} (${input.type})`}
          name={input.name}
          autoComplete={input.name}
          value={args[input.name] || ''}
          onChange={(event) => {
            setArgs((draft: any) => {
              draft[input.name] = event.target.value
            })
          }}
        />
        <br />
      </Fragment>
    ))}

    {func && <>
      {func.stateMutability === 'payable' && <>
        <TextField
          margin="normal"
          fullWidth
          label="ETH Amount"
        />
      </>}

      <br />
      <Box sx={{ display: 'flex' }}>
        {(() => {
          const output: ReactElement[] = []

          if (
            func.stateMutability === 'pure'
            || func.stateMutability === 'view') {
            output.push(
              <LoadingButton
                loading={isReading}
                key="read"
                type="button"
                variant="outlined"
                startIcon={<PageviewIcon />}
                sx={{ flexGrow: 1 }}
                onClick={read}
              >
                Read
              </LoadingButton>
            )
          }

          if (
            func.stateMutability === 'payable'
            || func.stateMutability === 'nonpayable') {
            if (output.length > 0) {
              output.push(<span key="space"> &nbsp; &nbsp; </span>)
            }

            if(canWrite) {
              output.push(
                <LoadingButton
                  loading={isWriting}
                  key="write"
                  type="button"
                  variant="contained"
                  startIcon={<CreateIcon />}
                  sx={{ flexGrow: 1 }}
                  onClick={write}
                >
                  Write
                </LoadingButton>
              )
            } else {
              output.push(
                <LoadingButton
                  loading={isLoggingIn}
                  key="login"
                  type="button"
                  variant="contained"
                  startIcon={<LockIcon />}
                  sx={{ flexGrow: 1 }}
                  onClick={login}
                >
                  Login
                </LoadingButton>
              )
            }
          }

          return output
        })()}
      </Box>
    </>}
  </>)
}