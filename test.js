process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios')
request = (url, data, reqOptions = {}) => {
    return new Promise(resolve => {
        axios.post('https://79.133.182.103/api/' + url, null, {params: data})
        .then(response => { console.log(response) })
        .catch(error => { console.log(error) })
    })
}


axios({
    method: 'post',
    url: 'https://79.133.182.103/api/label',
    data: {
        params: {
            orderid: -50,
            labelid: '101010'
        }
    }
})
.then(response => {
    console.log(response.data)
})