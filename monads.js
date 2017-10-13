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

const AsyncBox = src => {
    if (!src) return ErrorBox()

    const resolver = src.then ? src : new Promise(src)
    return ({
        map: (f, handler) => AsyncBox(resolver.then(f, handler))
    })
}

AsyncBox((resolve, reject) => {
    setTimeout(() => resolve(100), 10)
}).map(x => x + 100)
    .map(console.log)

AsyncBox((resolve, reject) => {
    reject(new Error('Erroring'))
}).map(() => console.error('FAIL'), () => 300)



