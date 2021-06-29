import EthersSafe, { SafeTransaction } from '@gnosis.pm/safe-core-sdk'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { BigNumber, ContractTransaction, Event } from 'ethers'
import { deployments, ethers, waffle } from 'hardhat'
import { ERC721TransactionBuilder } from '../src'
import { EMPTY_DATA } from '../src/utils/constants'
import { getDefaultCallbackHandler, getSafeWithOwners } from './utils/setup'
chai.use(chaiAsPromised)

describe('ERC721 transaction builder', () => {
  const [user1, user2, user3] = waffle.provider.getWallets()

  const extractTokenId = async (tx: ContractTransaction): Promise<BigNumber> => {
    const txResponse = await tx.wait()
    const eventTransfer = txResponse.events?.find((ev: Event) => ev.event === 'Transfer') as Event
    return eventTransfer?.args?.tokenId
  }

  const setupTests = deployments.createFixture(async ({ deployments }) => {
    await deployments.fixture()
    const MockERC721Factory = await ethers.getContractFactory('MockERC721Token')
    const MockERC721Token = await MockERC721Factory.deploy()
    await MockERC721Token.deployed()
    const safe = await getSafeWithOwners([user1.address, user2.address])
    const ethersSafe = await EthersSafe.create(ethers, safe.address, user1)
    const erc721TransactionBuilder = await ERC721TransactionBuilder.create(
      ethersSafe,
      MockERC721Token.address
    )
    // Assign the first token to the Safe account
    const receipt = await MockERC721Token.createAndAssign(ethersSafe.getAddress())
    const tokenAssigned = await extractTokenId(receipt)
    expect(tokenAssigned).not.to.be.undefined

    const signAndExecuteTx = async (safeERC20: EthersSafe, safeTransaction: SafeTransaction) => {
      await safeERC20.signTransaction(safeTransaction)

      const safeSDk2 = await safeERC20.connect(user2)
      const txResponse = await safeSDk2.executeTransaction(safeTransaction)
      await txResponse.wait()
    }

    return {
      ethersSafe,
      erc721TransactionBuilder,
      MockERC721Token,
      signAndExecuteTx,
      tokenAssigned
    }
  })

  it('should not allow to create ERC721 transaction builder for token with no code', async () => {
    const { ethersSafe } = await setupTests()
    const address = await user1.getAddress()
    await expect(ERC721TransactionBuilder.create(ethersSafe, address)).rejectedWith(
      'Contract is not deployed in the current network'
    )
  })

  it('should expose the contract address', async () => {
    const { MockERC721Token, erc721TransactionBuilder } = await setupTests()
    expect(erc721TransactionBuilder.erc721Address).to.be.eq(MockERC721Token.address)
  })

  it('should create a ERC721 transferFrom Safe transaction', async () => {
    const {
      ethersSafe,
      MockERC721Token,
      erc721TransactionBuilder,
      signAndExecuteTx,
      tokenAssigned
    } = await setupTests()

    const tokenReceiver = user3.address

    const safeTx = await erc721TransactionBuilder.transferFrom(
      ethersSafe.getAddress(),
      tokenReceiver,
      tokenAssigned
    )

    await signAndExecuteTx(ethersSafe, safeTx)

    const newOwner = await MockERC721Token.ownerOf(tokenAssigned)
    expect(newOwner).to.be.eq(tokenReceiver)
  })

  it('should create a ERC721 safeTransferFrom Safe transaction to transfer a token to a non-contract address', async () => {
    const {
      ethersSafe,
      MockERC721Token,
      erc721TransactionBuilder,
      signAndExecuteTx,
      tokenAssigned
    } = await setupTests()

    const tokenReceiver = user3.address

    const safeTx = await erc721TransactionBuilder.safeTransferFrom(
      ethersSafe.getAddress(),
      tokenReceiver,
      tokenAssigned
    )

    await signAndExecuteTx(ethersSafe, safeTx)

    const newOwner = await MockERC721Token.ownerOf(tokenAssigned)
    expect(newOwner).to.be.eq(tokenReceiver)
  })

  describe('should create a Safe ERC721 safeTransferFrom transaction to transfer a token to a contract address', () => {
    it("that doesn't implement ERC721 token receiver interface", async () => {
      const { ethersSafe, erc721TransactionBuilder, tokenAssigned } = await setupTests()

      const owners = [user3.address]
      const receiverSafe = await getSafeWithOwners(owners, owners.length)
      const tokenReceiver = receiverSafe.address

      // it should fail on tx execution, but it actually fails
      // on tx creation due to gas estimation.
      // See https://github.com/gnosis/safe-core-sdk/blob/v0.1.2/src/utils/transactions/utils.ts#L6
      await expect(
        erc721TransactionBuilder.safeTransferFrom(
          ethersSafe.getAddress(),
          tokenReceiver,
          tokenAssigned
        )
      ).to.be.rejected
    })

    it('that implements ERC721 token receiver interface', async () => {
      const {
        ethersSafe,
        MockERC721Token,
        erc721TransactionBuilder,
        signAndExecuteTx,
        tokenAssigned
      } = await setupTests()

      const defaultCallbackHandler = await getDefaultCallbackHandler()
      const owners = [user3.address]
      const receiverSafe = await getSafeWithOwners(
        owners,
        owners.length,
        defaultCallbackHandler.address
      )
      const tokenReceiver = receiverSafe.address

      const safeTx = await erc721TransactionBuilder.safeTransferFrom(
        ethersSafe.getAddress(),
        tokenReceiver,
        tokenAssigned
      )

      await signAndExecuteTx(ethersSafe, safeTx)

      const newOwner = await MockERC721Token.ownerOf(tokenAssigned)
      expect(newOwner).to.be.eq(tokenReceiver)
    })
  })

  describe('should create a Safe ERC721 safeTransferFrom transaction ', () => {
    it('with empty data', async () => {
      const {
        ethersSafe,
        MockERC721Token,
        erc721TransactionBuilder,
        signAndExecuteTx,
        tokenAssigned
      } = await setupTests()

      const ERC721HolderFactory = await ethers.getContractFactory('MockERC721Holder')
      const ERC721Holder = await ERC721HolderFactory.deploy()
      await ERC721Holder.deployed()
      const tokenReceiver = ERC721Holder.address

      const safeTx = await erc721TransactionBuilder.safeTransferFrom(
        ethersSafe.getAddress(),
        tokenReceiver,
        tokenAssigned,
        EMPTY_DATA
      )
      await signAndExecuteTx(ethersSafe, safeTx)
      const newOwner = await MockERC721Token.ownerOf(tokenAssigned)
      expect(newOwner).to.be.eq(tokenReceiver)
    })
    it('with no empty data', async () => {
      const {
        ethersSafe,
        MockERC721Token,
        erc721TransactionBuilder,
        signAndExecuteTx,
        tokenAssigned
      } = await setupTests()

      const ERC721HolderFactory = await ethers.getContractFactory('MockERC721Holder')
      const ERC721Holder = await ERC721HolderFactory.deploy()
      await ERC721Holder.deployed()
      const tokenReceiver = ERC721Holder.address

      const expectedData = 'hello'
      const safeTx = await erc721TransactionBuilder.safeTransferFrom(
        ethersSafe.getAddress(),
        tokenReceiver,
        tokenAssigned,
        ethers.utils.formatBytes32String(expectedData)
      )
      await signAndExecuteTx(ethersSafe, safeTx)
      const newOwner = await MockERC721Token.ownerOf(tokenAssigned)
      expect(newOwner).to.be.eq(tokenReceiver)

      const data = ethers.utils.parseBytes32String(await ERC721Holder.storedData())
      expect(data).to.be.eq(expectedData)
    })
  })

  it('should create a Safe ERC721 approve transaction', async () => {
    const {
      ethersSafe,
      MockERC721Token,
      erc721TransactionBuilder,
      signAndExecuteTx,
      tokenAssigned
    } = await setupTests()

    const previousApproved = await MockERC721Token.getApproved(tokenAssigned)
    // not approved
    expect(previousApproved).to.be.eq(`0x${'0'.repeat(40)}`)

    const expectedApproved = user3.address
    const safeTx = await erc721TransactionBuilder.approve(expectedApproved, tokenAssigned)
    await signAndExecuteTx(ethersSafe, safeTx)

    const newApproved = await MockERC721Token.getApproved(tokenAssigned)
    expect(newApproved).to.be.eq(expectedApproved)
  })

  it('should create a Safe ERC721 setApprovalForAll transaction', async () => {
    const { ethersSafe, MockERC721Token, erc721TransactionBuilder, signAndExecuteTx } =
      await setupTests()

    const expectedApproved = user3.address
    const isPreviouslyApproved = await MockERC721Token.isApprovedForAll(
      ethersSafe.getAddress(),
      expectedApproved
    )
    expect(isPreviouslyApproved).to.be.false

    // try to set approvalForAll
    const safeTx = await erc721TransactionBuilder.setApprovalForAll(expectedApproved, true)
    await signAndExecuteTx(ethersSafe, safeTx)

    const isApproved = await MockERC721Token.isApprovedForAll(
      ethersSafe.getAddress(),
      expectedApproved
    )
    expect(isApproved).to.be.true

    // try to unset approvalForAll
    const safeTxApproveRemoval = await erc721TransactionBuilder.setApprovalForAll(
      expectedApproved,
      false
    )
    await signAndExecuteTx(ethersSafe, safeTxApproveRemoval)
    const isApprovedAfterRemoval = await MockERC721Token.isApprovedForAll(
      ethersSafe.getAddress(),
      expectedApproved
    )
    expect(isApprovedAfterRemoval).to.be.false
  })
})
