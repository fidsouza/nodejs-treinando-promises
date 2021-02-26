const {describe, it , before,afterEach} = require('mocha')
const Request = require('../src/request')
const { createSandbox } = require('sinon')
const Events = require('events')

const assert  = require('assert')

describe('Request Helpers', ()=> {
    const timeOut = 15
    let sandbox 
    let request 
    before(()=>{
        sandbox = createSandbox()
        request = new Request()
    })
    afterEach(()=>sandbox.restore())

    it(`should throw a timeout error when the function has spent more than ${timeOut}` 
    , async () => {
        const exccedTimeOut = timeOut + 10
        sandbox.stub(request,request.get.name)
            .callsFake(()=> new Promise(r => setTimeout(r,exccedTimeOut)))
        
        const call =  request.makeRequest({url:'https://testing.com',method:'get',timeOut})

        await assert.rejects(call,{ message:'timeout at [https://testing.com] :('})

    })

    it(`should return ok when promise time is OK`,async () => {
        const expected = {ok : 'ok'}

        sandbox.stub(request,request.get.name)
            .callsFake(async ()=> {
                await new Promise(r => setTimeout(r))
                return expected
            })
        
        const call = () => request.makeRequest({url:'https://testing.com',method:'get',timeOut})

        await assert.doesNotReject(call())
        assert.deepStrictEqual(await call(),expected)

    })

    it(`should retorn a JSON after a request`, async() => {
        const data = [
            Buffer.from('{"ok": '),
            Buffer.from('"ok"'),
            Buffer.from('}'), 
        ]
        const reponseEvent  = new Events()
        const httpEvent = new Events()

        const https = require('https')
        sandbox
            .stub(
            https,
            https.get.name
        )
        .yields(reponseEvent)
        .returns(httpEvent)

        const expected =  { ok: 'ok'}
        const pendingPromise = request.get('https://testing.com')
        
        reponseEvent.emit('data',data[0])
        reponseEvent.emit('data',data[1])
        reponseEvent.emit('data',data[2])

        reponseEvent.emit('end')


        const result  = await pendingPromise
        assert.deepStrictEqual(result,expected)
    })

    it ('should test', ()=>{
        assert.ok(true)
    })
})