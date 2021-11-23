import { AbstractConnectorArguments, ConnectorUpdate } from "@web3-react/types";
import { AbstractConnector } from "@web3-react/abstract-connector";
import warning from "tiny-warning";



const __DEV__: boolean = process.env.NODE_ENV !== "production";

type SendReturnResult = { result: any }
export type SendReturn = any

type Send = (method: string, params?: any[]) => Promise<SendReturnResult | SendReturn>
type SendOld = ({ method }: { method: string }) => Promise<SendReturnResult | SendReturn>

function parseSendReturn(sendReturn: SendReturnResult | SendReturn): any {
  return sendReturn.hasOwnProperty("result") ? sendReturn.result : sendReturn;
}

export class NoBscProviderError extends Error {
  public constructor() {
    super();
    this.name = this.constructor.name;
    this.message = "No BSC provider was found on (global as any)['BinanceChain'].";
  }
}

export class UserRejectedRequestError extends Error {
  public constructor() {
    super();
    this.name = this.constructor.name;
    this.message = "The user rejected the request.";
  }
}

export class BscConnector extends AbstractConnector {
  constructor(kwargs: AbstractConnectorArguments) {
    super(kwargs);

    this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  private handleChainChanged(chainId: string | number): void {
    if (__DEV__) {
      console.log("Handling 'chainChanged' event with payload", chainId);
    }
    this.emitUpdate({ chainId, provider: (global as any)['BinanceChain'] });
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (__DEV__) {
      console.log("Handling 'accountsChanged' event with payload", accounts);
    }
    if (accounts.length === 0) {
      this.emitDeactivate();
    } else {
      this.emitUpdate({ account: accounts[0] });
    }
  }

  private handleClose(code: number, reason: string): void {
    if (__DEV__) {
      console.log("Handling 'close' event with payload", code, reason);
    }
    this.emitDeactivate();
  }

  private handleNetworkChanged(networkId: string | number): void {
    if (__DEV__) {
      console.log("Handling 'networkChanged' event with payload", networkId);
    }
    this.emitUpdate({ chainId: networkId, provider: (global as any)['BinanceChain'] });
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!(global as any)['BinanceChain']) {
      throw new NoBscProviderError();
    }

    if ((global as any)['BinanceChain'].on) {
      (global as any)['BinanceChain'].on("chainChanged", this.handleChainChanged);
      (global as any)['BinanceChain'].on("accountsChanged", this.handleAccountsChanged);
      (global as any)['BinanceChain'].on("close", this.handleClose);
      (global as any)['BinanceChain'].on("networkChanged", this.handleNetworkChanged);
    }

    if (((global as any)['BinanceChain'] as any).isMetaMask) {
      ((global as any)['BinanceChain'] as any).autoRefreshOnNetworkChange = false;
    }

    // try to activate + get account via eth_requestAccounts
    let account;
    try {
      account = await ((global as any)['BinanceChain'].send as Send)(
        "eth_requestAccounts"
      ).then((sendReturn) => parseSendReturn(sendReturn)[0]);
    } catch (error) {
      if ((error as any).code === 4001) {
        throw new UserRejectedRequestError();
      }
      warning(
        false,
        "eth_requestAccounts was unsuccessful, falling back to enable"
      );
    }

    // if unsuccessful, try enable
    if (!account) {
      // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
      account = await (global as any)['BinanceChain'].enable().then(
        (sendReturn: any) => sendReturn && parseSendReturn(sendReturn)[0]
      );
    }

    return { provider: (global as any)['BinanceChain'], ...(account ? { account } : {}) };
  }

  public async getProvider(): Promise<any> {
    return (global as any)['BinanceChain'];
  }

  public async getChainId(): Promise<number | string> {
    if (!(global as any)['BinanceChain']) {
      throw new NoBscProviderError();
    }

    let chainId;
    try {
      chainId = await ((global as any)['BinanceChain'].send as Send)("eth_chainId").then(
        parseSendReturn
      );
    } catch {
      warning(
        false,
        "eth_chainId was unsuccessful, falling back to net_version"
      );
    }

    if (!chainId) {
      try {
        chainId = await ((global as any)['BinanceChain'].send as Send)("net_version").then(
          parseSendReturn
        );
      } catch {
        warning(
          false,
          "net_version was unsuccessful, falling back to net version v2"
        );
      }
    }

    if (!chainId) {
      try {
        chainId = parseSendReturn(
          ((global as any)['BinanceChain'].send as SendOld)({ method: "net_version" })
        );
      } catch {
        warning(
          false,
          "net_version v2 was unsuccessful, falling back to manual matches and static properties"
        );
      }
    }

    if (!chainId) {
      if (((global as any)['BinanceChain'] as any).isDapper) {
        chainId = parseSendReturn(
          ((global as any)['BinanceChain'] as any).cachedResults.net_version
        );
      } else {
        chainId =
          ((global as any)['BinanceChain'] as any).chainId ||
          ((global as any)['BinanceChain'] as any).netVersion ||
          ((global as any)['BinanceChain'] as any).networkVersion ||
          ((global as any)['BinanceChain'] as any)._chainId;
      }
    }

    return chainId;
  }

  public async getAccount(): Promise<null | string> {
    if (!(global as any)['BinanceChain']) {
      throw new NoBscProviderError();
    }

    let account;
    try {
      account = await ((global as any)['BinanceChain'].send as Send)("eth_accounts").then(
        (sendReturn) => parseSendReturn(sendReturn)[0]
      );
    } catch {
      warning(false, "eth_accounts was unsuccessful, falling back to enable");
    }

    if (!account) {
      try {
        account = await (global as any)['BinanceChain'].enable().then(
          (sendReturn: any) => parseSendReturn(sendReturn)[0]
        );
      } catch {
        warning(
          false,
          "enable was unsuccessful, falling back to eth_accounts v2"
        );
      }
    }

    if (!account) {
      account = parseSendReturn(
        ((global as any)['BinanceChain'].send as SendOld)({ method: "eth_accounts" })
      )[0];
    }

    return account;
  }

  public deactivate() {
    if ((global as any)['BinanceChain'] && (global as any)['BinanceChain'].removeListener) {
      (global as any)['BinanceChain'].removeListener(
        "chainChanged",
        this.handleChainChanged
      );
      (global as any)['BinanceChain'].removeListener(
        "accountsChanged",
        this.handleAccountsChanged
      );
      (global as any)['BinanceChain'].removeListener("close", this.handleClose);
      (global as any)['BinanceChain'].removeListener(
        "networkChanged",
        this.handleNetworkChanged
      );
    }
  }

  public async isAuthorized(): Promise<boolean> {
    if (!(global as any)['BinanceChain']) {
      return false;
    }

    try {
      return await ((global as any)['BinanceChain'].send as Send)("eth_accounts").then(
        (sendReturn) => {
          if (parseSendReturn(sendReturn).length > 0) {
            return true;
          } else {
            return false;
          }
        }
      );
    } catch {
      return false;
    }
  }
}