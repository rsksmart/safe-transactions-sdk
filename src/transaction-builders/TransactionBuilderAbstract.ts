import { Safe } from '@gnosis.pm/safe-core-sdk'

export abstract class TransactionBuilderAbstract {
  #safe!: Safe

  constructor(safe: Safe) {
    this.#safe = safe
  }

  protected get safe(): Safe {
    return this.#safe
  }
}

export default TransactionBuilderAbstract
