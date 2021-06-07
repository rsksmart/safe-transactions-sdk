import { Safe, SafeTransaction } from '@gnosis.pm/safe-core-sdk'
import { TransactionBuilderAbstract } from './TransactionBuilderAbstract'

export class RawTransactionBuilder extends TransactionBuilderAbstract {
  constructor(safe: Safe) {
    super(safe)
  }

  rawTransaction(to: string, value: string, data: string): Promise<SafeTransaction> {
    return this.safe.createTransaction({
      to,
      data,
      value
    })
  }
}
