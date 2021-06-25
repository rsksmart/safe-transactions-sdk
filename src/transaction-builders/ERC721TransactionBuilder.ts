import { Safe, SafeTransaction } from '@gnosis.pm/safe-core-sdk'
import { BigNumber, utils } from 'ethers'
import { RawTransactionBuilder } from './RawTransactionBuilder'

// TODO: most of the creation logic is shared with ERC20TransactionBuilder
export class ERC721TransactionBuilder extends RawTransactionBuilder {
  public erc721Address: string
  #erc721Contract: utils.Interface

  constructor(safe: Safe, erc721Address: string) {
    super(safe)
    this.erc721Address = erc721Address

    this.#erc721Contract = new utils.Interface([
      'function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable',
      'function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable',
      'function transferFrom(address _from, address _to, uint256 _tokenId) external payable',
      'function approve(address _approved, uint256 _tokenId) external payable',
      'function setApprovalForAll(address _operator, bool _approved) payable'
    ])
  }

  static async create(safe: Safe, erc20Address: string): Promise<ERC721TransactionBuilder> {
    const code = await safe.getProvider().getCode(erc20Address)
    if (code === '0x') throw new Error('Invalid contract')
    return new ERC721TransactionBuilder(safe, erc20Address)
  }

  async transferFrom(from: string, to: string, tokenId: BigNumber): Promise<SafeTransaction> {
    const transactionData = this.#erc721Contract.encodeFunctionData('transferFrom', [
      from,
      to,
      tokenId
    ])
    return this.createSafeTransaction(transactionData)
  }

  async safeTransferFrom(
    from: string,
    to: string,
    tokenId: BigNumber,
    data?: string
  ): Promise<SafeTransaction> {
    const transactionData = data
      ? this.#erc721Contract.encodeFunctionData(
          'safeTransferFrom(address, address, uint256, bytes)',
          [from, to, tokenId, data]
        )
      : this.#erc721Contract.encodeFunctionData('safeTransferFrom(address, address, uint256)', [
          from,
          to,
          tokenId
        ])
    return this.createSafeTransaction(transactionData)
  }

  async approve(approved: string, tokenId: BigNumber): Promise<SafeTransaction> {
    const transactionData = this.#erc721Contract.encodeFunctionData('approve', [approved, tokenId])
    return this.createSafeTransaction(transactionData)
  }

  async setApprovalForAll(operator: string, approved: boolean): Promise<SafeTransaction> {
    const transactionData = this.#erc721Contract.encodeFunctionData('setApprovalForAll', [
      operator,
      approved
    ])
    return this.createSafeTransaction(transactionData)
  }

  private createSafeTransaction(transactionData: string): Promise<SafeTransaction> {
    return this.rawTransaction(this.erc721Address, '0', transactionData)
  }
}
