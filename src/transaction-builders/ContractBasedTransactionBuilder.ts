import { Safe, SafeTransaction } from '@gnosis.pm/safe-core-sdk'
import { utils } from 'ethers'
import { FunctionFragment } from 'ethers/lib/utils'
import { RawTransactionBuilder } from './RawTransactionBuilder'

export abstract class ContractBasedTransactionBuilder extends RawTransactionBuilder {
  #contractInterface: utils.Interface
  protected readonly contractAddress: string

  constructor(safe: Safe, contractAddress: string, contractInterface: utils.Interface) {
    super(safe)
    this.contractAddress = contractAddress
    this.#contractInterface = contractInterface
  }

  protected getContractTransaction(
    functionFragment: FunctionFragment | string,
    values?: ReadonlyArray<any>
  ): Promise<SafeTransaction> {
    const transactionData = this.#contractInterface.encodeFunctionData(functionFragment, values)
    return this.createSafeTransaction(transactionData)
  }

  private createSafeTransaction(transactionData: string): Promise<SafeTransaction> {
    return this.rawTransaction(this.contractAddress, '0', transactionData)
  }
}
