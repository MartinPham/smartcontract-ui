import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import Link from '@mui/material/Link'

export const SourceBrowser = ({
  onFileChange,
  source,
  onSourceChange,
  onUrlChange,
  onJsonChange,
  onError
} : {
  onFileChange: (event: any) => void,
  source: string,
  onSourceChange: (source: string) => void,
  onUrlChange: (url: string) => void,
  onJsonChange: (json: any) => void,
  onError: (err: any) => void,
}) => {
  return (
    <TextField
      InputProps={{
        endAdornment: (
          <>
            <IconButton
              aria-label='upload'
              component='label'
            >
              <UploadFileIcon />
              <input
                hidden
                accept='application/JSON'
                type='file'
                onChange={onFileChange}
              />
            </IconButton>
          </>
        ),
      }}
      margin='normal'
      required
      value={source}
      onChange={event => {
        onSourceChange(event.target.value)
      }}
      onKeyUp={event => {
        if (event.key === 'Enter') {
          if (source.startsWith('http')) {
            onUrlChange(source)
          } else {
            try {
              const jsonContent = JSON.parse(source)
              onJsonChange(jsonContent)
            } catch (err) {
              onError(err)
            }
          }
        }
      }}
      fullWidth
      id='file'
      label='SmartContract ABI'
      name='file'
      autoComplete='off'
			helperText={<>
				Try some examples <Link href='/?json=/HelloWorld.json'>here</Link> or <Link href='/?json=/Swap.json&address=0xc0fFee0000C824D24E0F280f1e4D21152625742b&func=getAmountsOut&args.amountIn=0.1e18&args.path=0x0039f574ee5cc39bdd162e9a88e3eb1f111baf48, 0xc0ffeE0000921eB8DD7d506d4dE8D5B79b856157'>here</Link>
			</>}
    />
  )
}