const axios = require('axios');

async function callOpenApi(messageArray, model, token) {
    let returnStr = "";

    await axios.post('https://api.openai.com/v1/chat/completions',
    {
        "model": model,
        "messages": messageArray
    }, 
    {
        headers: {
            Authorization: "Bearer " + token
        },
        timeout: 60000
    }).then(res => {
        returnStr = res.data.choices[0].message.content.trim().substring(0, 2000);
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

async function callOpenApiCompletion(prompt, model, token) {
    let returnStr = "";

    await axios.post('https://api.openai.com/v1/completions',
    {
        "model": model,
        "prompt": prompt,
        "max_tokens": 1024
    }, 
    {
        headers: {
            Authorization: "Bearer " + token
        },
        timeout: 60000
    }).then(res => {
        returnStr = res.data.choices[0].text.trim().substring(0, 2000);
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

async function checkModeration(prompt, token) {
    let returnStr = "";

    await axios.post('https://api.openai.com/v1/moderations',
    {
        "input": prompt,
    }, 
    {
        headers: {
            Authorization: "Bearer " + token
        },
        timeout: 20000
    }).then(res => {
        let returnData = res.data.results[0];
        if (returnData.flagged == false) {
            returnStr = "No objectionable content found here."
        } else {
            returnStr = "Objectionable content found: "
            // Get list of objectionable categories
            for (var category in returnData.categories) {
                if (returnData.categories[category]) {
                    returnStr += category + ", ";
                }
            }
            returnStr = returnStr.substring(0, returnStr.length - 2);
            console.log(returnStr)
        }
    }).catch(err => {
        console.log("An error has occurred. Try again later")
        console.log(err)
        returnStr = "Sorry, an internal error has occurred. Try again later.";
    })

    return returnStr;
}

module.exports = {
    callOpenApi: callOpenApi,
    checkModeration: checkModeration,
    callOpenApiCompletion: callOpenApiCompletion
}