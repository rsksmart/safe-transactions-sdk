import EthersSafe from '@gnosis.pm/safe-core-sdk'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import spies from 'chai-spies'
import { deployments, waffle } from 'hardhat'
import { executeTransaction } from '../src'
import {
  EMPTY_DATA,
  RSK_CHAIN_IDS,
  RSK_MAINNET_CHAIN_ID,
  RSK_TESTNET_CHAIN_ID
} from '../src/utils/constants'
import { createEthersSafe, getSafeWithOwners } from './utils/setup'
import safeAbi from '../src/utils/SafeAbiV1-2-0.json'
import { estimateGasForTransactionExecution } from '../src/utils/execute'
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
    const ethersSafe = await createEthersSafe(user1, safe.address)
    const signAndExecuteTx = async (safeERC20: EthersSafe, safeTransaction: SafeTransaction) => {
      await safeERC20.signTransaction(safeTransaction)

      const txResponse = await executeTransaction(safeERC20, safeTransaction)
      return await txResponse.transactionResponse?.wait()
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
    expect(ethersSafe.executeTransaction).to.have.been.called.with.exactly(safeTx)
  })

  // RSK TESTNET and RSK MAINNET
  const rsk_network_names = {
    [RSK_TESTNET_CHAIN_ID.toString()]: 'TESTNET',
    [RSK_MAINNET_CHAIN_ID.toString()]: 'MAINNET'
  }
  RSK_CHAIN_IDS.forEach((chainId: number) => {
    it(`should call the 'executeTransaction' even if it's running on RSK ${
      rsk_network_names[chainId.toString()]
    }`, async () => {
      const { ethersSafe } = await setupTests()
      chai.spy.on(ethersSafe, 'getChainId', () => chainId)
      const safeTx = await ethersSafe.createTransaction({
        to: user3.address,
        value: '0',
        data: EMPTY_DATA
      })
      chai.spy.on(ethersSafe, 'executeTransaction')

      await ethersSafe.signTransaction(safeTx)
      const ethAdapter = ethersSafe.getEthAdapter()
      const safeContract = ethAdapter.getContract(ethersSafe.getAddress(), safeAbi)
      const signerAddress = await ethAdapter.getSignerAddress()
      const gasLimit = await estimateGasForTransactionExecution(
        safeContract,
        signerAddress.toLowerCase(),
        safeTx
      )
      // for the RSK networks we applied a patch
      const expectedGasLimit = gasLimit + 30_000
      const txResponse = await executeTransaction(ethersSafe, safeTx)
      await txResponse.transactionResponse?.wait()
      expect(ethersSafe.executeTransaction).to.have.been.first.called.with.exactly(safeTx, {
        gasLimit: expectedGasLimit
      })
    })
  })
})
