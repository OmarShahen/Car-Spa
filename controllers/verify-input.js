/*

    + Check User Phone Number
    + Check User Email
    + Check User Name

 */

// Email Validator
const validator = require("email-validator");

class Verfication{


    checkEmptyInput(input)
    {
        try{

            if(input.split(' ').join('') == '')
        {
            return {
                accepted: false,
                message: 'empty input'
            }
        }
        return {
            accepted: true
        }
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }

    }


    async checkPhoneNumber(phoneNumber)
    {
        try{

            // 11 For Egyptian Numbers
            if(phoneNumber.length != 11)
            {
                return {
                    accepted: false,
                    message: 'it must be 11 digits'
                }
            }

            const numbers = '0123456789'
            for(let i=0;i<phoneNumber.length;i++)
            {
                let realNumber = false
                for(let j=0;j<numbers.length;j++)
                {
                    if(phoneNumber[i] == numbers[j])
                    {   
                        realNumber = true
                        break
                    }
                }
                if(!realNumber)
                {
                    return {
                        accepted: false,
                        message: 'the phone number must contain numbers only'
                    }
                }
            }
            return {
                accepted: true
            }
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    checkEmail(email)
    {

        if(!this.checkEmptyInput(email).accepted)
        {
            return {
                accepted: false,
                message: 'empty input'
            }
        }

        if(validator.validate(email))
        {
            return {
                accepted: true
            }
        }
        else{
            return {
                accepted: false,
                message: 'this email is invalid'
            }
        }
    }

    async checkName(userName)
    {
        try{

            if('' == userName.split(' ').join(''))
            {
                return {
                    accepted: false,
                    message: 'empty input'
                }
            }

            const invalid = '0123456789~`!@#$%^&*()_-+={}[]|;:/,.<>'
            for(let i=0;i<userName.length;i++)
            {
                for(let j=0;j<invalid.length;j++)
                {
                    if(userName[i] == invalid[j])
                    {
                        return {
                            accepted: false,
                            message: 'invalid name'
                        }
                    }
                }
            }
            return {
                accepted: true
            }
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }   

     

    
}

module.exports = new Verfication()