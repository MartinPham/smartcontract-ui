import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import UploadFileIcon from '@mui/icons-material/UploadFile'


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
              aria-label="upload"
              component="label"
            >
              <UploadFileIcon />
              <input
                hidden
                accept="application/JSON"
                type="file"
                onChange={onFileChange}
              />
            </IconButton>
          </>
        ),
      }}
      margin="normal"
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
      id="file"
      label="SmartContract ABI"
      name="file"
      autoComplete="off"
    />
  )
}