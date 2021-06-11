import { BigNumber, utils } from 'ethers'
import { RawTransactionBuilder } from './RawTransactionBuilder'
import { Safe, SafeTransaction } from '@gnosis.pm/safe-core-sdk'

export class ERC20TransactionBuilder extends RawTransactionBuilder {
  public erc20Address: string
  #erc20Contract: utils.Interface

  constructor(safe: Safe, erc20Address: string) {
    super(safe)
    this.erc20Address = erc20Address

    this.#erc20Contract = new utils.Interface([
      'function transfer(address to, uint amount)',
      'function transferFrom(address from, address to, uint amount)',
      'function approve(address spender, uint amount)'
    ])
  }

  async transfer(to: string, value: BigNumber): Promise<SafeTransaction> {
    const transactionData = this.#erc20Contract.encodeFunctionData('transfer', [to, value])
    return this.createSafeTransaction(transactionData)
  }

  async transferFrom(from: string, to: string, value: BigNumber): Promise<SafeTransaction> {
    const transactionData = this.#erc20Contract.encodeFunctionData('transferFrom', [
      from,
      to,
      value
    ])
    return this.createSafeTransaction(transactionData)
  }

  async approve(spender: string, amount: BigNumber): Promise<SafeTransaction> {
    const transactionData = this.#erc20Contract.encodeFunctionData('approve', [spender, amount])
    return this.createSafeTransaction(transactionData)
  }

  private createSafeTransaction(transactionData: string): Promise<SafeTransaction> {
    return this.rawTransaction(this.erc20Address, '0', transactionData)
  }
}
