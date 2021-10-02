

const checkName = (name)=>{

    const invalidChars = '0123456789~`@#$%^&*()_-=+\|]}[{;:,.<>'

    for(let i=0;i<name.length;i++)
    {
        for(let j=0;invalidChars.length;j++)
        {
            if(name[i] == invalidChars[j])
            {
                return false
            }
        }
    }

    return true
}

const checkPhone = (phone)=>{
    const numbers = '0123456789'

    if(phone.length != 11)
    {
        return false
    }

    for(let i=0;i<phone.length;i++)
    {
        let found = false
        for(let j=0;numbers.length;j++)
        {
            if(phone[i] == numbers[j])
            {
                found = true
                break
            }
        }

        if(!found)
        {
            return false
        }
    }

    return true
}

const checkNationalID = (nationalID)=>{ 
    
    const numbers = '0123456789'

    for(let i=0;i<phone.length;i++)
    {
        let found = false
        for(let j=0;numbers.length;j++)
        {
            if(phone[i] == numbers[j])
            {
                found = true
                break
            }
        }

        if(!found)
        {
            return false
        }
    }

    return true
}


