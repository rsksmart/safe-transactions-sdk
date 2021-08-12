import Safe from '@gnosis.pm/safe-core-sdk'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { EMPTY_DATA } from './constants'

export const rejectTx = (safe: Safe, tx: SafeTransaction): Promise<SafeTransaction> => {
  return safe.createTransaction({
    to: safe.getAddress(),
    nonce: tx.data.nonce,
    value: '0',
    data: EMPTY_DATA
  })
}
