import Safe from '@gnosis.pm/safe-core-sdk'
import { BigNumber, utils } from 'ethers'
import { ContractBasedTransactionBuilder } from './ContractBasedTransactionBuilder'
import { validateIsDeployedContract } from '../utils/contracts'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

const ERC721_CONTRACT_INTERFACE = new utils.Interface([
  'function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable',
  'function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable',
  'function transferFrom(address _from, address _to, uint256 _tokenId) external payable',
  'function approve(address _approved, uint256 _tokenId) external payable',
  'function setApprovalForAll(address _operator, bool _approved) payable'
])

export class ERC721TransactionBuilder extends ContractBasedTransactionBuilder {
  constructor(safe: Safe, erc721Address: string) {
    super(safe, erc721Address, ERC721_CONTRACT_INTERFACE)
  }

  public get erc721Address(): string {
    return this.contractAddress
  }

  static async create(safe: Safe, erc721Address: string): Promise<ERC721TransactionBuilder> {
    await validateIsDeployedContract(safe, erc721Address)
    return new ERC721TransactionBuilder(safe, erc721Address)
  }

  async transferFrom(from: string, to: string, tokenId: BigNumber): Promise<SafeTransaction> {
    return this.getContractTransaction('transferFrom', [from, to, tokenId])
  }

  async safeTransferFrom(
    from: string,
    to: string,
    tokenId: BigNumber,
    data?: string
  ): Promise<SafeTransaction> {
    return data !== undefined
      ? this.getContractTransaction('safeTransferFrom(address, address, uint256, bytes)', [
          from,
          to,
          tokenId,
          data
        ])
      : this.getContractTransaction('safeTransferFrom(address, address, uint256)', [
          from,
          to,
          tokenId
        ])
  }

  async approve(approved: string, tokenId: BigNumber): Promise<SafeTransaction> {
    return this.getContractTransaction('approve', [approved, tokenId])
  }

  async setApprovalForAll(operator: string, approved: boolean): Promise<SafeTransaction> {
    return this.getContractTransaction('setApprovalForAll', [operator, approved])
  }
}
