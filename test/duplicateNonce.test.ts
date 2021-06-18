import EthersSafe from '@gnosis.pm/safe-core-sdk'
import { expect } from 'chai'
import { deployments, ethers, waffle } from 'hardhat'
import { rejectTx } from '../src'
import { EMPTY_DATA } from '../src/utils/constants'
import { getSafeWithOwners } from './utils/setup'

describe('checking nonce', () => {
  const [user1, user2] = waffle.provider.getWallets()

  const setupTests = deployments.createFixture(async ({ deployments }) => {
    await deployments.fixture()
    const safe = await getSafeWithOwners([user1.address])
    const ethersSafe = await EthersSafe.create(ethers, safe.address, user1)

    return { ethersSafe }
  })

  it('does not allow two transactions with the same nonce to execute', async () => {
    const { ethersSafe } = await setupTests()

    const tx1 = await ethersSafe.createTransaction({
      to: user1.address,
      value: '10000',
      data: EMPTY_DATA
    })
    const tx1Hash = await ethersSafe.getTransactionHash(tx1)

    expect(tx1.data.nonce).to.equal(0)

    // sign the first transaction:
    await ethersSafe.signTransactionHash(tx1Hash)

    // create a second transaction with the same nonce:
    /*
    const tx2 = await ethersSafe.createTransaction({
      to: user2.address,
      value: '0',
      data: EMPTY_DATA
    })
    */
    // OR... create a second transaction using the rejectTx method:
    const tx2 = await rejectTx(ethersSafe, tx1)

    // The nonceS are the same:
    expect(tx2.data.nonce).to.equal(tx1.data.nonce)

    // sign the second transaction:
    const tx2Hash = await ethersSafe.getTransactionHash(tx2)
    await ethersSafe.signTransactionHash(tx2Hash)

    // execute the second transaction:
    const exReceipt2 = await ethersSafe.executeTransaction(tx2)
    await exReceipt2.wait()

    // the safe's nonce should be incremented to 1:
    expect(await ethersSafe.getNonce()).to.equal(1)

    // the nonce of transaction 1 is still 0:
    expect(tx1.data.nonce).to.equal(0)

    // execute the first transaction, which SHOULD FAIL since the nonce has already been used:
    const exReceipt1 = await ethersSafe.executeTransaction(tx1)
    await exReceipt1.wait()

    const safeNonce = await ethersSafe.getNonce()
    expect(safeNonce).to.equal(2)
  })

  it('same test, but signatures signed off-chain', async () => {
    const { ethersSafe } = await setupTests()

    const tx1 = await ethersSafe.createTransaction({
      to: user1.address,
      value: '10000',
      data: EMPTY_DATA
    })

    expect(tx1.data.nonce).to.equal(0)

    // sign the first transaction
    await ethersSafe.signTransaction(tx1)

    // create second transaction with same nonce, then sign it:
    const tx2 = await rejectTx(ethersSafe, tx1)
    await ethersSafe.signTransaction(tx2)
    expect(tx2.data.nonce).to.equal(tx1.data.nonce)

    // execute the first transaction
    const resultTx1 = await ethersSafe.executeTransaction(tx1)
    resultTx1.wait()

    // execute the second transaction, which should fail:
    const resultTx2 = await ethersSafe.executeTransaction(tx2)
    resultTx2.wait()

    // nonce was incremented by 2:
    expect(await ethersSafe.getNonce()).to.equal(2)
  })
})
