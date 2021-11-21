import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import QrCode2Icon from '@mui/icons-material/QrCode2';
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
		name: 'Wallet Connect',
		description: 'Connect to wallet using WalletConnect protocol',
	},
	{
		id: 'key',
		icon: VpnKeyIcon,
		name: 'Private Key',
		description: 'Import wallet from Private Key / Mnemonic words',
	},
]