import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react-wan/types'
import { AbstractConnector } from '@web3-react-wan/abstract-connector'
import warning from 'tiny-warning'

import { SendReturnResult, SendReturn, Send, SendOld } from './types'

function parseSendReturn(sendReturn: SendReturnResult | SendReturn): any {
  return sendReturn.hasOwnProperty('result') ? sendReturn.result : sendReturn
}

export class NoEthereumProviderError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'No Wanchain provider was found on window.wan.'
  }
}

export class UserRejectedRequestError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

export class WanmaskConnector extends AbstractConnector {
  constructor(kwargs: AbstractConnectorArguments) {
    super(kwargs)
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!window.wan3) {
      throw new NoEthereumProviderError()
    }

    // try to activate + get account via eth_requestAccounts
    let account
    try {
      account = await (window.wan3.currentProvider.sendAsync as Send)('eth_accounts').then(
        sendReturn => parseSendReturn(sendReturn)[0]
      )
    } catch (error) {
      if ((error as any).code === 4001) {
        throw new UserRejectedRequestError()
      }
      warning(false, 'eth_requestAccounts was unsuccessful, falling back to enable')
    }

    return { provider: window.wan3.currentProvider, ...(account ? { account } : {}) }
  }

  public async getProvider(): Promise<any> {
    return window.wan3.currentProvider
  }

  public isSupported(): boolean {
    return !!window.wan3;
  }

  public async getChainId(): Promise<number | string> {
    return new Promise(async (resolve, reject) => {
      if (!this.isSupported()) {
        reject(NoEthereumProviderError);
      }
      window.wan3.version.getNetwork((err: Error, networkId: number) => {
        if (err) {
          reject(err);
        } else {
          resolve(Number(networkId));
        }
      });
    });
  }

  public async getAccount(): Promise<null | string> {
    if (!window.wan3) {
      throw new NoEthereumProviderError()
    }

    let account
    account = parseSendReturn((window.wan3.currentProvider.sendAsync as SendOld)({ method: 'eth_accounts' }))[0]

    return account
  }

  public deactivate() {
  }

  public async isAuthorized(): Promise<boolean> {
    if (!window.wan3) {
      return false
    }

    try {
      return await (window.wan3.currentProvider.sendAsync as Send)('eth_accounts').then(sendReturn => {
        if (parseSendReturn(sendReturn).length > 0) {
          return true
        } else {
          return false
        }
      })
    } catch {
      return false
    }
  }
}