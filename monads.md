# Monads

## The Box

Let's consider for a moment a Box Factory. You give it a value and it returns you a box.

```js
const Box = x => ({})
```

It can create instances of the Box like so:
```js
const b = Box(1)
// b is a Box with the value 1 in it
```

Not terribly useful; It's a locked box without a way of using what's inside.

Let's add one:

```js
const Box = x => ({
  perform: f => f(x)
})
```

It can be called like so:
```js
Box(1).perform(console.log) // logs 1
```

It allows us to make use of the value in the box.

This is already more useful than the locked box we started with, but it can be improved considerably by renaming the `perform` method to `map` and ensuring that it always returns a Box, thereby making chaining possible.

```js
const Box = x => ({
  map: f => Box(f(x))
})
```

It's a small change, but as you can see here, it makes it trivial to create processing pipelines:

```js
Box(1)
  .map(x => x * 2)
  .map(x => x * 3)
  .map(console.log) // logs 6
```

## Empty Boxes

With the Box code we wrote above it's easy to write code that will crash:

```js
Box(null)
  .map(x => x.firstName)  // ???
  .map(console.log)
```

To guard against this, let's add a new Kind of Box: EmptyBox. Empty boxes will do absolutely nothing when asked to use its content:

```js
const EmptyBox = () => ({
  map: f => EmptyBox()
})
```

In fact because EmptyBoxes don't have state, they are identical, so we may aswell use the same one all the time:

```js
const EMPTY_BOX = ({
    map: f => EMPTY_BOX
})
```

Using this box, let's harden our normal box implementation:

```js
const Box = x => x === null ? EMPTY_BOX : ({
    map: f => Box(f(x))
})
```

The code below will now silently fail:
```js
Box(null)
  .map(x => x.firstName) 
  .map(console.log)
```

Silently failing isn't great though. Let's deal with empty boxes explicitly:

```js
const EMPTY_BOX = ({
  map: (_, empty) => 
    empty ? Box(empty()) : EMPTY_BOX
})
```

And use it like so:

```js
Box(null)
  .map(x => x.firstName, () => 'John')
  .map(console.log) // outputs John
```