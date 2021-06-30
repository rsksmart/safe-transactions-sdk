<p align="middle">
  <img src="https://www.rifos.org/assets/img/logo.svg" alt="logo" height="100" >
</p>
<h3 align="middle"><code>@rsksmart/safe-transactions-sdk</code></h3>
<p align="middle">
    RIF Safe Transactions SDK
</p>
<p align="middle">
  <a href="https://github.com/rsksmart/safe-transactions-sdk/actions?query=workflow%3Aci">
    <img src="https://github.com/rsksmart/safe-transactions-sdk/workflows/ci/badge.svg" />
  </a>
  <a href="https://lgtm.com/projects/g/rsksmart/safe-transactions-sdk/context:javascript">
    <img src="https://img.shields.io/lgtm/grade/javascript/github/rsksmart/safe-transactions-sdk" />
  </a>
  <a href='https://coveralls.io/github/rsksmart/safe-transactions-sdk?branch=main'>
    <img src='https://coveralls.io/repos/github/rsksmart/safe-transactions-sdk/badge.svg?branch=main' alt='Coverage Status' />
  </a>
  <a href="https://badge.fury.io/js/%40rsksmart%2Fsafe-transactions-sdk">
    <img src="https://badge.fury.io/js/%40rsksmart%2Fsafe-transactions-sdk.svg" alt="npm" />
  </a>
</p>

```
npm i @rsksmart/safe-transactions-sdk
```

## Raw transactions

### RawTransactionBuilder initialization

```ts
import { RawTransactionBuilder } from '@rsksmart/safe-transactions-sdk'

const ethersSafe: EthersSafe // from '@gnosis.pm/safe-core-sdk'

const rawTransactionBuilder = new RawTransactionBuilder(ethersSafe)
```

### Raw transaction creation

```ts
const tx = await rawTransactionBuilder.rawTransaction(
  toAddress, // string
  value, // string
  data // string
)
```

## ERC20 Token transactions

### ERC20TransactionBuilder initialization

```ts
import { ERC20TransactionBuilder } from '@rsksmart/safe-transactions-sdk'

const ethersSafe: EthersSafe // from '@gnosis.pm/safe-core-sdk'
const erc20TokenAddress: string //

const erc20TransactionBuilder = await ERC20TransactionBuilder.create(ethersSafe, erc20TokenAddress)
```

### transfer

```ts
await erc20TransactionBuilder.transfer(
  receiverAddress, // string
  BigNumber.from(valueToTransfer)
)
```

### transferFrom

> **IMPORTANT**: It required prior approval, see [ERC20 approval method](https://eips.ethereum.org/EIPS/eip-20#methods)

```ts
await erc20TransactionBuilder.transferFrom(
  fromAddress, // string
  toAddress, // string
  BigNumber.from(valueToTransfer)
)
```

### approve

> **IMPORTANT**: See [ERC20 approval method and allowance](https://eips.ethereum.org/EIPS/eip-20#methods)

```ts
await erc20TransactionBuilder.approve(
  spenderAddress, // string
  allowance
)
```

## Rejection transaction creation

> **IMPORTANT**: The rejection transaction needs to be confirmed and executed like any other Multisig transaction.

```ts
import { rejectTx } from '@rsksmart/safe-transactions-sdk'

const rejectionTx = await rejectTx(safe, transaction)
```

## ERC721 Token transaction

### ERC721TransactionBuilder initialization

```ts
import { ERC721TransactionBuilder } from '@rsksmart/safe-transactions-sdk'

const ethersSafe: EthersSafe // from '@gnosis.pm/safe-core-sdk'
const erc721TokenAddress: string //

const erc721TransactionBuilder = await ERC721TransactionBuilder.create(
  ethersSafe,
  erc721TokenAddress
)
```

### transferFrom

> **IMPORTANT**: Only the current owner, an authorized operator, or the approved address can call this method, see [ERC721](https://eips.ethereum.org/EIPS/eip-721)

```ts
await erc721TransactionBuilder.transferFrom(
  fromAddress, // string
  toAddress, // string
  tokenId // BigNumber
)
```

### safeTransferFrom

The `safeTransferFrom` methods perform the same operation performed by `transferFrom` and additionally, if the receiver is a contract address, they check if the contract address implements the interface `ERC721TokenReceiver` and it returns the value `0x150b7a02`, obtained from `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`. For further info, see [ERC721](https://eips.ethereum.org/EIPS/eip-721)

```solidity
interface ERC721TokenReceiver {
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes _data) external returns(bytes4);
}

```

> **IMPORTANT**: Only the current owner, an authorized operator, or the approved address can call this method, see [ERC721](https://eips.ethereum.org/EIPS/eip-721)

```ts
await erc721TransactionBuilder.safeTransferFrom(
  fromAddress, // string
  toAddress, // string
  tokenId // BigNumber
)
```

It can be called with the optional `data` parameter that will be sent to the receiver with the `onERC721Received` call.

```ts
await erc721TransactionBuilder.safeTransferFrom(
  fromAddress, // string
  toAddress, // string
  tokenId // BigNumber
  data  // string
)
```

### approve

> **IMPORTANT**: See [ERC721 approval method](https://eips.ethereum.org/EIPS/eip-721)

```ts
await erc721TransactionBuilder.approve(
  approvedAddress, // string
  tokenId // BigNumber
)
```

### setApprovalForAll

It sets or unsets approval for a specific operator. That would allow the operator to perform transfer operations on behalf of the owner.

> **IMPORTANT**: See [ERC721 setApprovalForAll method](https://eips.ethereum.org/EIPS/eip-721)

```ts
await erc721TransactionBuilder.setApprovalForAll(
  operatorAddress, // string
  approved // boolean
)
```

## Run for development

Install dependencies:

```
npm i
```

### Run a local network

```
npx hardhat node
```

### Tests

Run unit tests with

```
npx hardhat test
```

### Lint & formatting

```
npm run format
npm run lint
```

### Build

```
npm run build
```
