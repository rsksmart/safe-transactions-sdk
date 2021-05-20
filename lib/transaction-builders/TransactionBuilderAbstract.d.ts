import { Safe } from '@gnosis.pm/safe-core-sdk';
export declare abstract class TransactionBuilderAbstract {
    #private;
    constructor(safe: Safe);
    protected get safe(): Safe;
}
export default TransactionBuilderAbstract;
