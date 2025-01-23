"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StateFarm_1 = require("./StateFarm");
const chai_1 = require("chai");
describe("StateFarm", () => {
    it("should get root path", () => {
        const state = (0, StateFarm_1.StateFarm)({
            bob: 1
        });
        const test = state.getPath();
        chai_1.assert.deepEqual(test, []);
    });
    it("should get nested paths", () => {
        const state = (0, StateFarm_1.StateFarm)({
            bob: {
                thing: 1
            }
        });
        const test = state.bob.thing.getPath();
        chai_1.assert.deepEqual(test, ["bob", "thing"]);
    });
    it("should get nested values", () => {
        const state = (0, StateFarm_1.StateFarm)({
            bob: {
                thing: 1
            }
        });
        const test = state.bob.thing.get();
        chai_1.assert.deepEqual(test, 1);
    });
    it("should be able to update nested values", () => {
        const state = (0, StateFarm_1.StateFarm)({
            bob: {
                thing: 1
            }
        });
        state.bob.thing.set(5);
        chai_1.assert.deepEqual(state.bob.thing.get(), 5);
    });
    it("should be able to observe changes to nested values", () => {
        const state = (0, StateFarm_1.StateFarm)({
            bob: {
                thing: 1
            }
        });
        state.bob.onChange(value => {
            (0, chai_1.assert)(true);
        });
    });
    it("should notify onChange listeners with the correct typed value", () => {
        const state = (0, StateFarm_1.StateFarm)({
            bob: {
                thing: 1
            }
        });
        let receivedValue;
        state.bob.onChange(value => {
            receivedValue = value; // TypeScript should infer this as {thing: number}
        });
        state.bob.thing.set(5);
        chai_1.assert.deepEqual(receivedValue, { thing: 5 });
    });
    it("should notify with the correct nested value type", () => {
        const state = (0, StateFarm_1.StateFarm)({
            bob: {
                thing: 1
            }
        });
        let receivedValue;
        state.bob.thing.onChange(value => {
            receivedValue = value; // TypeScript should infer this as number
        });
        state.bob.thing.set(5);
        chai_1.assert.strictEqual(receivedValue, 5);
    });
    it("should bubble up changes with correct values", () => {
        const state = (0, StateFarm_1.StateFarm)({
            bob: {
                thing: 1
            }
        });
        const changes = [];
        state.onChange(value => {
            // value should be the full state
            changes.push(['root', value]);
        });
        state.bob.onChange(value => {
            // value should be just the bob object
            changes.push(['bob', value]);
        });
        state.bob.thing.onChange(value => {
            // value should be just the number
            changes.push(['thing', value]);
        });
        state.bob.thing.set(5);
        chai_1.assert.deepEqual(changes, [
            ['thing', 5],
            ['bob', { thing: 5 }],
            ['root', { bob: { thing: 5 } }]
        ]);
    });
    it("should handle multiple listeners at the same level", () => {
        const state = (0, StateFarm_1.StateFarm)({
            bob: {
                thing: 1
            }
        });
        const called = [];
        state.bob.onChange(() => called.push(1));
        state.bob.onChange(() => called.push(2));
        state.bob.thing.set(5);
        chai_1.assert.deepEqual(called, [1, 2]);
    });
    it("doesn't call sibling listeners", () => {
        const state = (0, StateFarm_1.StateFarm)({
            bob: {
                thing: 1,
                other: 2
            }
        });
        const called = [];
        state.bob.thing.onChange(() => called.push(true));
        state.bob.other.onChange(() => called.push(false));
        state.bob.thing.set(5);
        chai_1.assert.deepEqual(called, [true]);
    });
    it("updates children listeners", () => {
        const state = (0, StateFarm_1.StateFarm)({
            bob: {
                thing: 1,
                other: 2
            }
        });
        const called = [];
        state.bob.thing.onChange(() => called.push(1));
        state.bob.other.onChange(() => called.push(2));
        state.bob.set({
            thing: 5,
            other: 7
        });
        chai_1.assert.deepEqual(called, [1, 2]);
    });
    it("updates children when parent is set to null", () => {
        const state = (0, StateFarm_1.StateFarm)({
            bob: {
                thing: 1,
                other: 2
            }
        });
        const called = [];
        state.bob.thing.onChange(() => called.push(1));
        state.bob.other.onChange(() => called.push(2));
        state.bob.set(null);
        chai_1.assert.deepEqual(called, [1, 2]);
    });
});
//# sourceMappingURL=StateFarm.spec.js.map