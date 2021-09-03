const config = require('../config/config')
const messagebird = require('messagebird')(config.smsAPI['apiKey'])

module.exports = async (sendTo, verficationCode)=>{

    const params = {
        'originator': config.smsAPI['originator'],
        'recipients': [sendTo],
        'body': `${verficationCode} is your CAR-SPA verification code`
    }

    messagebird.messages.create(params, (error, response)=>{
        if(error)
        {   
            console.log(error)
            return false
        }

    })

    return true
    

}