const t = require('tap')
const r = require("./unify-path");
const mkdirp = require('../')

// node before 10.13 didn't native recursive mkdir
const doNative = !/^v([0-8]\.|10.([0-9]\.|10\.|11\.([0-9]|1[01])$))/.test(process.version)

t.test('module shape', t => {
  t.isa(mkdirp, Function)
  t.isa(mkdirp.sync, Function)
  t.isa(mkdirp.manual, Function)
  t.isa(mkdirp.manualSync, Function)
  if (doNative) {
    t.isa(mkdirp.native, Function)
    t.isa(mkdirp.nativeSync, Function)
  }
  t.end()
})

t.test('basic making of dirs should work', t => {
  const dir = t.testdir({ a: {} })
  const {statSync, mkdir, mkdirSync} = require('fs')
  const check = d => t.ok(statSync(d).isDirectory())
  t.equal(mkdirp.sync(`${dir}/a/sync`), r(`${dir}/a/sync`))
  check(`${dir}/a/sync`)
  t.equal(mkdirp.sync(`${dir}/a/sync`), undefined)

  t.equal(mkdirp.manualSync(`${dir}/a/manual-sync`), r(`${dir}/a/manual-sync`))
  check(`${dir}/a/manual-sync`)
  t.equal(mkdirp.manualSync(`${dir}/a/manual-sync`), undefined)

  if (doNative) {
    t.equal(mkdirp.nativeSync(`${dir}/a/native-sync`), r(`${dir}/a/native-sync`))
    check(`${dir}/a/native-sync`)
    t.equal(mkdirp.nativeSync(`${dir}/a/native-sync`), undefined)
  }

  // override to force the manual option
  const myMkdir = (path, opts, cb) => mkdir(path, opts, cb)
  const myMkdirSync = (path, opts) => mkdirSync(path, opts)
  const opts = { mkdir: myMkdir, mkdirSync: myMkdirSync }
  t.equal(mkdirp.sync(`${dir}/a/custom-sync`, opts), r(`${dir}/a/custom-sync`))
  check(`${dir}/a/custom-sync`)
  t.equal(mkdirp.sync(`${dir}/a/custom-sync`, opts), undefined)

  return Promise.all([
    mkdirp(`${dir}/a/async`),
    mkdirp.manual(`${dir}/a/manual-async`),
    doNative && mkdirp.native(`${dir}/a/native-async`),
    mkdirp(`${dir}/a/custom-async`, opts),
  ]).then(made => {
    t.strictSame(made, [
      r(`${dir}/a/async`),
      r(`${dir}/a/manual-async`),
      doNative && r(`${dir}/a/native-async`),
      r(`${dir}/a/custom-async`),
    ])
    check(`${dir}/a/async`)
    check(`${dir}/a/manual-async`)
    doNative && check(`${dir}/a/native-async`)
    check(`${dir}/a/custom-async`)
    return Promise.all([
      mkdirp(`${dir}/a/async`),
      mkdirp.manual(`${dir}/a/manual-async`),
      doNative ? mkdirp.native(`${dir}/a/native-async`) : undefined,
      mkdirp(`${dir}/a/custom-async`, opts),
    ])
  }).then(made => t.strictSame(made, [undefined, undefined, undefined, undefined]))
})
