import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import spies from 'chai-spies'
import EthersSafe, { SafeTransaction } from '@gnosis.pm/safe-core-sdk'
import { deployments, ethers, waffle, network } from 'hardhat'
import { EMPTY_DATA, RSK_CHAIN_IDS, RSK_MAINNET_CHAIN_ID, RSK_TESTNET_CHAIN_ID } from '../src/utils/constants'
import { getSafeWithOwners } from './utils/setup'
import { executeTransaction } from '../src'
chai.use(chaiAsPromised)
chai.use(spies)

describe('Transaction execution', () => {
  const [user1, user3] = waffle.provider.getWallets()

  afterEach(() => {
    chai.spy.restore()
  })

  const setupTests = deployments.createFixture(async ({ deployments }) => {
    await deployments.fixture()
    const safe = await getSafeWithOwners([user1.address])
    const ethersSafe = await EthersSafe.create(ethers, safe.address, user1)

    const signAndExecuteTx = async (safeERC20: EthersSafe, safeTransaction: SafeTransaction) => {
      await safeERC20.signTransaction(safeTransaction)

      const txResponse = await executeTransaction(safeERC20, safeTransaction)
      return await txResponse.wait()
    }

    return {
      ethersSafe,
      signAndExecuteTx
    }
  })

  it('should call the executeTransaction on the safeInstance', async () => {
    const { ethersSafe, signAndExecuteTx } = await setupTests()
    const safeTx = await ethersSafe.createTransaction({
      to: user3.address,
      value: '0',
      data: EMPTY_DATA
    })
    chai.spy.on(ethersSafe, 'executeTransaction')
    await signAndExecuteTx(ethersSafe, safeTx)
    expect(ethersSafe.executeTransaction).to.have.been.called.with(safeTx)
  })

  // RSK TESTNET and RSK MAINNET
  const rsk_network_names = {
    [RSK_TESTNET_CHAIN_ID.toString()]: 'TESTNET',
    [RSK_MAINNET_CHAIN_ID.toString()]: 'MAINNET'
  }
  RSK_CHAIN_IDS.forEach((chainId: number) => {
    it(`should call the modified version of 'executeTransaction' if it's running on RSK ${
      rsk_network_names[chainId.toString()]
    }`, async () => {
      const { ethersSafe, signAndExecuteTx } = await setupTests()
      chai.spy.on(ethersSafe, 'getChainId', () => chainId)
      const safeTx = await ethersSafe.createTransaction({
        to: user3.address,
        value: '0',
        data: EMPTY_DATA
      })
      chai.spy.on(ethersSafe, 'executeTransaction')
      await signAndExecuteTx(ethersSafe, safeTx)
      expect(ethersSafe.executeTransaction).not.to.have.been.called()
    })
  })
})
