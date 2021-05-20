"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawTransactionBuilder = void 0;
const TransactionBuilderAbstract_1 = __importDefault(require("./TransactionBuilderAbstract"));
class RawTransactionBuilder extends TransactionBuilderAbstract_1.default {
    constructor(safe) {
        super(safe);
    }
    rawTransaction(to, value, data) {
        return this.safe.createTransaction({
            to,
            data,
            value
        });
    }
}
exports.RawTransactionBuilder = RawTransactionBuilder;
exports.default = RawTransactionBuilder;
//# sourceMappingURL=RawTransactionBuilder.js.map