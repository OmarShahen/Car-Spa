
const forgotPasswordMailTemplate = (userName, callback)=>{

    const content =  {htmlMessage: `
                    <html lang="en">
                    <head>

                    <style>
                        body{
                            font-family: Arial, Helvetica, sans-serif;
                            text-align: center;
                            background-color: #F3F4F8;
                            color: #000000;
                            font-size: 1rem;
                        }
                        p{
                            color: #000000;
                        }
                        h1{
                            text-align: left;
                            font-size: 2rem;
                            font-weight: normal;
                            color: #000000;

                        }
                        span{
                            color: #000000;
                        }
                        button{
                            color: #41A7F2;
                            /*background-color: #41A7F2;*/
                            background-color: #fff;
                            border: none;
                            box-shadow: none;
                            width: 189px;
                            height: 41px;

                        }
                        a{
                            color: #41A7F2;
                            text-decoration: none;
                        }
                        .container{
                            margin-left: auto;
                            margin-right: auto;
                            width: 316px;
                            text-align: left;
                            background-color: #ffffff;
                            padding: 50px;
                            padding-top: 10px;
                            padding-bottom: 10px;

                        }
                        .btn-div{
                            text-align: center;
                        }
                        p span{
                            color: #32BA7C;
                            font-weight: bold;
                        }
                        .bigger-container{
                            width: 100%;
                            height: 100%;
                            background-color: #F3F4F8;
                            padding-top: 20px;
                        }
                        @media screen and (min-width: 400px){
                            .container{
                                padding-right: 20px;
                                padding-left: 20px;
                            }
                        }

                    </style>
                    </head>
                    <body>
                        <div class="bigger-container">
                            <div class="container">
                                <h1>
                                    Hi, <span>Boss</span>
                                </h1>

                                <p>
                                Someone has asked to reset the password for your account.<br><br>
                                If you did not request a password reset, you can disregard this email.
                                No changes have been made to your account.<br><br>
                                
                                To reset your password, click on reset password link and within 90 minutes the link will expire:
                                </p><br>
                                <div class="btn-div">
                                    <button>
                                        <a href="http://localhost:5000/api/admins/login-form">
                                            RESET PASSWORD
                                        </a>    
                                    </button>
                                </div>
                                

                                <p>
                               <br><br>

                                Cheers,<br>
                                The CAR-SPA Team
                                </p>

                            </div>
                            <br>
                        </div>
                        
                        
                    </body>
                    </html>

                    `,

            plainMessage:`Hi ${userName},
            You created your account successfully.
            we 're excited to have you get started. Open your app and order your first wash.
            \n
            If you have any questions, just reply to this email we 're always happy to help out.\n

            Cheers,
            The CARSPA Team 
            `
    };


    return new Promise((resolve, reject)=>{
        resolve(content);
        reject(new Error('There was problem creating the templates'));
    });

                
};

module.exports = forgotPasswordMailTemplate;