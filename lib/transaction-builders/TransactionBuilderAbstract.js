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
var _safe;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionBuilderAbstract = void 0;
class TransactionBuilderAbstract {
    constructor(safe) {
        _safe.set(this, void 0);
        __classPrivateFieldSet(this, _safe, safe);
    }
    get safe() {
        return __classPrivateFieldGet(this, _safe);
    }
}
exports.TransactionBuilderAbstract = TransactionBuilderAbstract;
_safe = new WeakMap();
exports.default = TransactionBuilderAbstract;
//# sourceMappingURL=TransactionBuilderAbstract.js.map