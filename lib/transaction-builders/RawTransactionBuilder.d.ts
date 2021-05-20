import { Safe, SafeTransaction } from '@gnosis.pm/safe-core-sdk';
import TransactionBuilderAbstract from './TransactionBuilderAbstract';
export declare class RawTransactionBuilder extends TransactionBuilderAbstract {
    constructor(safe: Safe);
    rawTransaction(to: string, value: string, data: string): Promise<SafeTransaction>;
}
export default RawTransactionBuilder;
