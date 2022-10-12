import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import CropFreeIcon from '@mui/icons-material/CropFree'
import ExtensionIcon from '@mui/icons-material/Extension'
import { Signer } from 'types/Signer';

export const signers: Signer[] = [
	{
		id: 'anonymous',
		icon: PersonOutlineIcon,
		name: 'Anonymous',
		description: 'Anonymous',
	},
	{
		id: 'browser',
		icon: AccountBalanceWalletIcon,
		name: 'Browser Wallet',
		description: 'Use the wallet provided by your Web Browser',
	},
	{
		id: 'walletconnect',
		icon: QrCode2Icon,
		name: 'WalletConnect',
		description: 'Connect to wallet using WalletConnect protocol',
	},
	{
		id: 'walletlink',
		icon: CropFreeIcon,
		name: 'WalletLink',
		description: 'Connect to wallet using Coinbase\'s WalletLink protocol',
	},
	{
		id: 'binance',
		icon: ExtensionIcon,
		name: 'Binance Wallet',
		description: 'Connect to Binance Wallet',
	},
	{
		id: 'key',
		icon: VpnKeyIcon,
		name: 'Private Key',
		description: 'Import wallet from Private Key / Mnemonic words',
	},
]