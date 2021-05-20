"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _erc20Contract;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC20TransactionBuilder = void 0;
const RawTransactionBuilder_1 = __importDefault(require("./RawTransactionBuilder"));
class ERC20TransactionBuilder extends RawTransactionBuilder_1.default {
    constructor(safe, erc20Contract) {
        super(safe);
        _erc20Contract.set(this, void 0);
        __classPrivateFieldSet(this, _erc20Contract, erc20Contract);
    }
    async transfer(to, value) {
        const transactionData = __classPrivateFieldGet(this, _erc20Contract).interface.encodeFunctionData('transfer', [
            to,
            value
        ]);
        return this.createSafeTransaction(transactionData);
    }
    async transferFrom(from, to, value) {
        const transactionData = __classPrivateFieldGet(this, _erc20Contract).interface.encodeFunctionData('transferFrom', [
            from,
            to,
            value
        ]);
        return this.createSafeTransaction(transactionData);
    }
    async approve(spender, amount) {
        const transactionData = __classPrivateFieldGet(this, _erc20Contract).interface.encodeFunctionData('approve', [
            spender,
            amount
        ]);
        return this.createSafeTransaction(transactionData);
    }
    createSafeTransaction(transactionData) {
        return this.rawTransaction(__classPrivateFieldGet(this, _erc20Contract).address, '0', transactionData);
    }
}
exports.ERC20TransactionBuilder = ERC20TransactionBuilder;
_erc20Contract = new WeakMap();
exports.default = ERC20TransactionBuilder;
//# sourceMappingURL=ERC20TransactionBuilder.js.map