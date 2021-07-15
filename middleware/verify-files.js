


const fileValidation = (request, response, next)=>{

        if(!request.files)
        {
            return response.status(406).send({
                accepted: false,
                message: 'empty file input'
            })
        }

        const validExtensions = ['png', 'jpg', 'jpeg']
        const file = request.files.employeeCriminalRecord
        const fileExtension = file.name.split('.')[file.name.split('.').length-1]
        let valid = false

        for(let i=0;i<validExtensions.length;i++)
        {
            if(validExtensions[i] == fileExtension)
            {
                valid = true
                break
            }
        }
        if(!valid)
        {
            return response.status(406).send({
                accepted: false,
                message: 'not valid file extension'
            })
        }

        next()

    }

module.exports = fileValidation