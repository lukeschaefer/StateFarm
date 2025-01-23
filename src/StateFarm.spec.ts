import { StateFarm } from "./StateFarm";
import {assert} from "chai";

describe("StateFarm", () => {

  
  it("should get root path", () => {
    const state = StateFarm({
      bob: 1
    })
    const test = state.getPath()
    assert.deepEqual(test, [])
  });

  it("should get nested paths", () => {
    const state = StateFarm({
      bob: {
        thing: 1
      }
    })
    const test = state.bob.thing.getPath()
    assert.deepEqual(test, ["bob", "thing"])
  });

  it("should get nested values", () => {
    const state = StateFarm({
      bob: {
        thing: 1
      }
    })
    const test = state.bob.thing.get()
    assert.deepEqual(test, 1)
  });

  it("should be able to update nested values", () => {
    const state = StateFarm({
      bob: {
        thing: 1
      }
    })
    state.bob.thing.set(5);
    assert.deepEqual(state.bob.thing.get(), 5)
  });

  it("should be able to observe changes to nested values", () => {
    const state = StateFarm({
      bob: {
        thing: 1
      }
    })
    
    state.bob.onChange(value => {
      assert(true);
    })
  });

  it("should notify onChange listeners with the correct typed value", () => {
    interface TestState {
      bob: {
        thing: number;
      }
    }
    
    const state = StateFarm<TestState>({
      bob: {
        thing: 1
      }
    });
    
    let receivedValue: {thing: number} | undefined;
    state.bob.onChange(value => {
      receivedValue = value;  // TypeScript should infer this as {thing: number}
    });
    
    state.bob.thing.set(5);
    assert.deepEqual(receivedValue, { thing: 5 });
  });

  it("should notify with the correct nested value type", () => {
    interface TestState {
      bob: {
        thing: number;
      }
    }
    
    const state = StateFarm<TestState>({
      bob: {
        thing: 1
      }
    });
    
    let receivedValue: number | undefined;
    state.bob.thing.onChange(value => {
      receivedValue = value;  // TypeScript should infer this as number
    });
    
    state.bob.thing.set(5);
    assert.strictEqual(receivedValue, 5);
  });

  it("should bubble up changes with correct values", () => {
    interface TestState {
      bob: {
        thing: number;
      }
    }
    
    const state = StateFarm<TestState>({
      bob: {
        thing: 1
      }
    });
    
    const changes: any[] = [];
    
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
    
    assert.deepEqual(changes, [
      ['thing', 5],
      ['bob', { thing: 5 }],
      ['root', { bob: { thing: 5 } }]
    ]);
  });

  it("should handle multiple listeners at the same level", () => {
    const state = StateFarm({
      bob: {
        thing: 1
      }
    });
    
    const called: number[] = [];
    
    state.bob.onChange(() => called.push(1));
    state.bob.onChange(() => called.push(2));
    
    state.bob.thing.set(5);
    
    assert.deepEqual(called, [1, 2]);
  });

  it("doesn't call sibling listeners", () => {
    const state = StateFarm({
      bob: {
        thing: 1,
        other: 2
      }
    });
    
    const called: boolean[] = [];
    
    state.bob.thing.onChange(() => called.push(true));
    state.bob.other.onChange(() => called.push(false));
    
    state.bob.thing.set(5);
    
    assert.deepEqual(called, [true]);
  });

  it("updates children listeners", () => {
    const state = StateFarm({
      bob: {
        thing: 1,
        other: 2
      }
    });
    
    const called: number[] = [];
    
    state.bob.thing.onChange(() => called.push(1));
    state.bob.other.onChange(() => called.push(2));
    
    state.bob.set({
      thing: 5,
      other: 7
    });
    
    assert.deepEqual(called, [1,2]);
  });

  it("updates children when parent is set to null", () => {
    const state = StateFarm({
      bob: {
        thing: 1,
        other: 2
      }
    });
    
    const called: number[] = [];
    
    state.bob.thing.onChange(() => called.push(1));
    state.bob.other.onChange(() => called.push(2));
    
    state.bob.set(null);
    
    assert.deepEqual(called, [1,2]);
  });

});