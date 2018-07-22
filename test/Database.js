const async = require('async')
const assert = require('assert')
const fs = require('fs')

const Database = require('../src/Database')

let db

let entryAlice
let entryBob
let entryFooBar
let entryBarFoo

if (fs.existsSync('test.db')) {
  fs.unlinkSync('test.db')
}

describe('Database', function () {
  it('init()', function (done) {
    db = new Database('test.db')
    db.init((err) => {
      done(err)
    })
  })

  it('insert serial', function (done) {
    async.series([
      function (done) {
        db.insert({ name: 'Alice', email: 'alice@example.com' },
          (err, result) => {
            assert.equal(result, 1)
            entryAlice = result

            done(err)
          }
        )
      },
      function (done) {
        db.insert({ name: 'Bob', email: 'bob@example.com' },
          (err, result) => {
            assert.equal(result, 2)
            entryBob = result

            done(err)
          }
        )
      },
    ], function (err) {
      done(err)
    })
  })

  it('insert parallel', function (done) {
    async.series([
      function (done) {
        db.insert({ name: 'Foo Bar', email: 'foobar@example.com' },
          (err, result) => {
            assert.equal([3, 4].indexOf(result) !== -1, true, 'should have id 3 or 4')
            entryFooBar = result

            done(err)
          }
        )
      },
      function (done) {
        db.insert({ name: 'Bar Foo', email: 'barfoo@example.com' },
          (err, result) => {
            assert.equal([3, 4].indexOf(result) !== -1, true, 'should have id 3 or 4')
            entryBarFoo = result

            done(err)
          }
        )
      },
    ], function (err) {
      done(err)
    })
  })

  it('load all', function (done) {
    db.search('', (err, result) => {
      assert.equal(result.length, 4)
      done(err)
    })
  })

  it('load foo bar', function (done) {
    db.get(entryFooBar, (err, result) => {
      assert.deepEqual(
        result,
        {
          id: entryFooBar,
          name: 'Foo Bar',
          email: 'foobar@example.com'
        }
      )
      done(err)
    })
  })

  it('update alice', function (done) {
    db.set(entryAlice, { email: null, phone: '01234567' },
      (err) => {
        if (err) {
          return done(err)
        }

        db.get(entryAlice, (err, result) => {
          assert.deepEqual(
            result,
            {
              id: entryAlice,
              name: 'Alice',
              phone: '01234567'
            }
          )
          done(err)
        })
      }
    )
  })

  it('delete foo bar', function (done) {
    db.remove(entryFooBar,
      (err) => {
        if (err) {
          return done(err)
        }

        db.get(entryFooBar, (err, result) => {
          assert.equal(result, null)
          done(err)
        })
      }
    )
  })

  it('load all', function (done) {
    db.search('', (err, result) => {
      assert.equal(result.length, 3)
      done(err)
    })
  })
})
