This is a terrible state-management library that you should not use. But it was fun to make and play around with.

### How it works:


```ts
 // All state can be managed in one big global export, used across your app.
 export const state = StateFarm({
    someParent: {
      someValue: 1
    },
    somethingElse: 'asdf',
  });
    
  
  state.someParent.onChange(value => {
    console.log(value);
  });
  
  state.someParent.someChild.onChange(value => {
     // Do something
  });

  state.somethingElse.onChange(value => {
     // Do something else
  });

  // This will fire the above listeners for someParent & someChild, but not somethingElse
  state.someParent.someValue.set(5);
```

