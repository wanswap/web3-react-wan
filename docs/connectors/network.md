# `web3-react` Documentation - Network

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)

## Install
`yarn add @web3-react-wan/network-connector`

## Arguments
```typescript
urls: { [chainId: number]: string }
defaultChainId?: number
pollingInterval?: number
requestTimeoutMs?: number
```

## Example
```javascript
import { NetworkConnector } from '@web3-react-wan/network-connector'

const network = new NetworkConnector({ urls: { 1: RPC_URLS[1] } })
```
