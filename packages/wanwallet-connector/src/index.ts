import { ConnectorUpdate } from '@web3-react-wan/types'
import { AbstractConnector } from '@web3-react-wan/abstract-connector'
import Web3ProviderEngine from 'web3-provider-engine'
import { WanWalletSubprovider } from '@wanswap/subproviders/lib/src/subproviders/wanwallet' // https://github.com/0xProject/0x-monorepo/issues/1400
import CacheSubprovider from 'web3-provider-engine/subproviders/cache.js'
import { RPCSubprovider } from '@0x/subproviders/lib/src/subproviders/rpc_subprovider' // https://github.com/0xProject/0x-monorepo/issues/1400

interface WanWalletConnectorArguments {
  chainId: number
  url: string
  pollingInterval?: number
  requestTimeoutMs?: number
}

export class WanWalletConnector extends AbstractConnector {
  private readonly chainId: number
  private readonly url: string
  private readonly pollingInterval?: number
  private readonly requestTimeoutMs?: number

  private provider: any

  constructor({
    chainId,
    url,
    pollingInterval,
    requestTimeoutMs,
  }: WanWalletConnectorArguments) {
    super({ supportedChainIds: [chainId] })

    this.chainId = chainId
    this.url = url
    this.pollingInterval = pollingInterval
    this.requestTimeoutMs = requestTimeoutMs
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.provider) {
      const engine = new Web3ProviderEngine({ pollingInterval: this.pollingInterval })
      engine.addProvider(new WanWalletSubprovider())
      engine.addProvider(new CacheSubprovider())
      engine.addProvider(new RPCSubprovider(this.url, this.requestTimeoutMs))
      this.provider = engine
    }

    this.provider.on('disconnect', this.handleDisconnect)

    this.provider.start()

    return { provider: this.provider, chainId: this.chainId }
  }

  private handleDisconnect(): void {
    this.emitDeactivate()
  }

  public async getProvider(): Promise<Web3ProviderEngine> {
    return this.provider
  }

  public async getChainId(): Promise<number> {
    return this.chainId
  }

  public async getAccount(): Promise<null> {
    return this.provider._providers[0].getAccountsAsync(1).then((accounts: string[]): string => accounts[0])
  }

  public deactivate() {
    this.provider.stop()
  }

  public async close() {
    this.provider.stop()
    this.emitDeactivate()
  }
}
