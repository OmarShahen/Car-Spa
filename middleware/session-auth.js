

const verifiyAdmin = (request, response, next)=>{

    try{

        if(!request.session.adminID)
        {
            return response.redirect('/api/admins/login-form')
        }

        next()
    }
    catch(error)
    {
        console.log(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
}


module.exports = verifiyAdmin