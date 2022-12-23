const axios = require('axios');

async function callOpenApi(prompt, model, token) {
    try {
        const res = await axios.post('https://api.openai.com/v1/completions', 
            {
                "model": model,
                "prompt": prompt,
                "max_tokens": 1024
            }, 
            {
                headers: {
                    Authorization: "Bearer " + token
                },
                timeout: 10000
            }
        );
        const result = res.data.choices[0].text.trim().substring(0, 2000)
        console.log('==========')
        console.log(returnStr);
        console.log('==========')
        return result;
    }
    catch (err) {
        console.log("An error has occurred. Try again later")
        console.log(err)
        return "Sorry, an internal error has occurred. Try again later.";
    }
}

async function checkModeration(prompt, token) {
    try {
        const res = await axios.post('https://api.openai.com/v1/moderations', 
            {
                "input": prompt,
            }, 
            {
                headers: {
                    Authorization: "Bearer " + token
                },
                timeout: 10000 
            }
        );
        let returnData = res.data.results[0];
        if (returnData.flagged == false) {
            return "No objectionable content found here."
        } else {
            // Get list of objectionable categories
            const categories = Object.entries(returnData.categories)
                .filter(([_, found]) => found)
                .map(([name, _]) => name)
                .join(", ");
            const result = `Objectionable content found: ${categories}` 
            console.log(result)
            return result;
        }
    }
    catch(err) {
        console.log("An error has occurred. Try again later")
        console.log(err)
        return "Sorry, an internal error has occurred. Try again later.";
    }
}

module.exports = {
    callOpenApi: callOpenApi,
    checkModeration: checkModeration
}