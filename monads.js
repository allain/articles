const ErrorBox = function (err) {
    return {
        map: function (_, handle) {
            return handle ? Box(handle(err)) : this
        }
    }
}

const Box = x =>
    x === null
        ? ErrorBox()
        : ({
            map: (f, handler) => {
                try {
                    return Box(f(x))
                } catch (err) {
                    return handler ? Box(handler(err)) : ErrorBox(err)
                }
            }
        })

Box(1)
    .map(x => x, () => console.error('FAIL'))
    .map(x => x + 1)
    .map(console.log) // 2

Box(null)
    .map(x => x, () => 10)
    .map(x => x + 1)
    .map(console.log) // 11

Box({})
    .map(x => x.test())
    .map(x => x + 1, () => 10)
    .map(console.log) // 10

Box({})
    .map(x => x.test(), () => 10)
    .map(x => x + 1)
    .map(console.log) // 11
