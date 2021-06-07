import EthersSafe, { SafeTransaction } from '@gnosis.pm/safe-core-sdk'
import chai, { expect } from 'chai'
import { deployments, ethers, waffle } from 'hardhat'
import chaiAsPromised from 'chai-as-promised'
import { getSafeWithOwners } from './utils/setup'
import { EMPTY_DATA } from '../src/utils/constants'
import { rejectTx } from '../src/'
chai.use(chaiAsPromised)

describe('Transaction rejection', () => {
  const [user1, user2, user3] = waffle.provider.getWallets()

  const setupTests = deployments.createFixture(async ({ deployments }) => {
    await deployments.fixture()
    const safe = await getSafeWithOwners([user1.address, user2.address])
    const ethersSafe = await EthersSafe.create(ethers, safe.address, user1)

    const initialTx = await ethersSafe.createTransaction({
      to: user3.address,
      data: EMPTY_DATA,
      value: '0'
    })

    const signAndExecuteTx = async (safeERC20: EthersSafe, safeTransaction: SafeTransaction) => {
      await safeERC20.signTransaction(safeTransaction)

      const safeSDk2 = await safeERC20.connect(user2)
      const txResponse = await safeSDk2.executeTransaction(safeTransaction)
      await txResponse.wait()
    }

    return {
      ethersSafe,
      signAndExecuteTx,
      initialTx
    }
  })

  it("should create a new transaction with the same nonce of the once being rejected and the 'to' address set to the safe account address", async () => {
    const { ethersSafe, initialTx } = await setupTests()
    const rejectionTx = await rejectTx(ethersSafe, initialTx)
    expect(rejectionTx.data.nonce).to.be.eq(initialTx.data.nonce)
    expect(rejectionTx.data.to).to.be.eq(ethersSafe.getAddress())
  })

  it('once the rejection transaction is executed, the original transaction execution will fail', async () => {
    const { ethersSafe, initialTx, signAndExecuteTx } = await setupTests()
    const rejectionTx = await rejectTx(ethersSafe, initialTx)

    await expect(signAndExecuteTx(ethersSafe, rejectionTx)).to.be.fulfilled

    await expect(signAndExecuteTx(ethersSafe, initialTx)).to.be.rejectedWith(
      'VM Exception while processing transaction: revert Invalid owner provided'
    )
  })

  it('once the original transaction is executed, the rejection transaction execution will fail', async () => {
    const { ethersSafe, initialTx, signAndExecuteTx } = await setupTests()
    const rejectionTx = await rejectTx(ethersSafe, initialTx)

    await expect(signAndExecuteTx(ethersSafe, initialTx)).to.be.fulfilled

    await expect(signAndExecuteTx(ethersSafe, rejectionTx)).to.be.rejectedWith(
      'VM Exception while processing transaction: revert Invalid owner provided'
    )
  })
})
