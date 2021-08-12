import Safe from '@gnosis.pm/safe-core-sdk'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { BigNumber, utils } from 'ethers'
import { validateIsDeployedContract } from '../utils/contracts'
import { ContractBasedTransactionBuilder } from './ContractBasedTransactionBuilder'

const ERC_20_CONTRACT_INTERFACE = new utils.Interface([
  'function transfer(address to, uint amount)',
  'function transferFrom(address from, address to, uint amount)',
  'function approve(address spender, uint amount)'
])

export class ERC20TransactionBuilder extends ContractBasedTransactionBuilder {
  constructor(safe: Safe, erc20Address: string) {
    super(safe, erc20Address, ERC_20_CONTRACT_INTERFACE)
  }

  public get erc20Address(): string {
    return this.contractAddress
  }
  static async create(safe: Safe, erc20Address: string): Promise<ERC20TransactionBuilder> {
    await validateIsDeployedContract(safe, erc20Address)
    return new ERC20TransactionBuilder(safe, erc20Address)
  }

  async transfer(to: string, value: BigNumber): Promise<SafeTransaction> {
    return this.getContractTransaction('transfer', [to, value])
  }

  async transferFrom(from: string, to: string, value: BigNumber): Promise<SafeTransaction> {
    return this.getContractTransaction('transferFrom', [from, to, value])
  }

  async approve(spender: string, amount: BigNumber): Promise<SafeTransaction> {
    return this.getContractTransaction('approve', [spender, amount])
  }
}
