import { Safe, SafeTransaction } from '@gnosis.pm/safe-core-sdk'
import { EMPTY_DATA } from './constants'

const rejectTx = (safe: Safe, tx: SafeTransaction): Promise<SafeTransaction> => {
  return safe.createTransaction({
    to: safe.getAddress(),
    nonce: tx.data.nonce,
    value: '0',
    data: EMPTY_DATA
  })
}

export { rejectTx }
export default rejectTx
