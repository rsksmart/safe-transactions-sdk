import Safe, { TransactionResult } from '@gnosis.pm/safe-core-sdk'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import safeAbi from './SafeAbiV1-2-0.json'
import { Contract } from 'ethers'
import { RSK_CHAIN_IDS } from './constants'

// COPIED from https://github.com/gnosis/safe-core-sdk/blob/main/packages/safe-core-sdk/src/utils/transactions/gas.ts#L84-L107
// the function is as is and not modified other than removal of 'export'
export async function estimateGasForTransactionExecution(
  contract: Contract,
  from: string,
  tx: SafeTransaction
): Promise<number> {
  try {
    const gas = await contract.estimateGas.execTransaction(
      tx.data.to,
      tx.data.value,
      tx.data.data,
      tx.data.operation,
      tx.data.safeTxGas,
      tx.data.baseGas,
      tx.data.gasPrice,
      tx.data.gasToken,
      tx.data.refundReceiver,
      tx.encodedSignatures(),
      { from, gasPrice: tx.data.gasPrice }
    )

    return gas.toNumber()
  } catch (error) {
    return Promise.reject(error)
  }
}

const RSK_GAS_PATCH = 30_000

/**
 * A modified version of Gnosis's safe.executeTransaction function. For RSK, it
 * adds 30,000 to the gas estimation which is required on RSK.
 * @param safe An EthersSafe which is used to get the safe and signer address
 * @param safeTransaction SafeTransaction ready to be executed
 * @returns ContractTransaction
 */
export const executeTransaction = async (
  safe: Safe,
  safeTransaction: SafeTransaction
): Promise<TransactionResult> => {
  const chainId = await safe.getChainId()
  if (RSK_CHAIN_IDS.includes(chainId)) {
    const ethAdapter = safe.getEthAdapter()
    const safeContract = ethAdapter.getContract(safe.getAddress(), safeAbi)
    const signerAddress = await ethAdapter.getSignerAddress()
    const gasLimit = await estimateGasForTransactionExecution(
      safeContract,
      signerAddress.toLowerCase(),
      safeTransaction
    )
    return safe.executeTransaction(safeTransaction, {
      gasLimit: gasLimit + RSK_GAS_PATCH
    })
  } else {
    return safe.executeTransaction(safeTransaction)
  }
}
