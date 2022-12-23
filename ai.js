const axios = require('axios');

async function callOpenApi(prompt, model, token) {
    let returnStr = "";

    await axios.post('https://api.openai.com/v1/completions',
    {
        "model": model,
        "prompt": prompt,
        "max_tokens": 256
    }, 
    {
        headers: {
            Authorization: "Bearer " + token
        },
        timeout: 10000
    }).then(res => {
        returnStr = res.data.choices[0].text.trim();
        console.log('==========')
        console.log(returnStr);
        console.log('==========')
    }).catch(err => {
        console.log("An error has occurred. Try again later")
        console.log(err)
        returnStr = "Sorry, an internal error has occurred. Try again later.";
    })

    return returnStr;
}

module.exports = {
    callOpenApi: callOpenApi
}