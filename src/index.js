const Request = require("./request");

async function scheduler() {
    console.log('starting in...', new Date().toISOString())
    const urls = [
        { url: 'https://www.mercadobitcoin.net/api/BTC/ticker/', method: 'get' },
        { url: 'https://www.naoExiste.net', method: 'get' },
        { url: 'https://www.mercadobitcoin.net/api/BTC/orderbook/', method: 'get' },
    ]
        .map(data => ({
            ...data,
            timeout: 2000,
        }))
        .map(params => request.makeRequest(params))

    const results = await Promise.allSettled(urls)
    const allSucceeded = []
    const allFail = []


    for (const { status, value, reason } of results) {
        if(status === 'rejected') {
            allFail.push(reason)
        }

        allSucceeded.push(value)
    }
        
    console.log({
        allFail,
        allSucceeded:JSON.stringify(allSucceeded)
    })

}


const request = new Request()
const PERIOD = 2000
setInterval(scheduler, PERIOD);