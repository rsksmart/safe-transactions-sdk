import { Contract, BigNumber } from 'ethers';
import RawTransactionBuilder from './RawTransactionBuilder';
import { Safe, SafeTransaction } from '@gnosis.pm/safe-core-sdk';
export declare class ERC20TransactionBuilder extends RawTransactionBuilder {
    #private;
    constructor(safe: Safe, erc20Contract: Contract);
    transfer(to: string, value: BigNumber): Promise<SafeTransaction>;
    transferFrom(from: string, to: string, value: BigNumber): Promise<SafeTransaction>;
    approve(spender: string, amount: BigNumber): Promise<SafeTransaction>;
    private createSafeTransaction;
}
export default ERC20TransactionBuilder;
