# VisionX Loader

Transform VisionX `*.vx` to `*.js` files.

source:

```jsx
<div attr={123} attr2={abc} x-show={true}>{hello}</div>
```

generated code:

```javascript

```

## How to Debug

Open project in vs-code editor. Go to the debug pane, and click the debug button.


## Use in Webpack

```js
  {
    text: /\.vx$/,
    loader: '@ali/visionx-loader'
  }
```

## Design

- use `babel-loader`
- create new types of Syntax Node

```typescript
export interface JSXFragment extends Node {
  type: 's';
  content: strng;
}

export interface JSXArea extends Node {
  type: 'e';
  content: {
    code: string;
    reactive: boolean;
  };
}
```
- create new context for every AST Node and generate code via context object
