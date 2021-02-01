// fetch("http://localhost:3002/users/pug")
// .then(res => res.text())
// .then(body => console.log(body))

let backendURL = "http://localhost:3002/users"
let frontendURL = "http://127.0.0.1:5500/JS/NODE-PASSWORD-RESET/NODE_PASS_RES_FRONTEND/index.html"

//GETTING DOM VARIABLES
let loginForm = document.getElementById("loginForm")
let registerForm = document.getElementById("registerForm")
let errorhandlingRegister = document.getElementById("errorhandlingRegister")
let errorhandlingLogin = document.getElementById("errorhandlingLogin")

//FUNCTION DECLARATIONS

//ERROR HANDLING FUNCTION FOR DOM
displayError = (id,message) => {
    console.log(message)
    id.innerHTML = `<p>Please correct the following errors</p> <i class="fas fa-exclamation-circle"></i>  `;
    id.append(message);
    // id.app = message;
    id.style.visibility = "initial";

}

//LOGIN HANDLING FUNCTION
async function SubmitLogin(data){
    let sendLogin = await fetch(backendURL + "/login", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data)
    })

    if (sendLogin.status === 200){
        let sendLoginResBody = await sendLogin.json()
        // localStorage.setItem("sariOkayLogin", sendLoginResBody.authorization)
        // console.log(sendLoginResBody);
        
        //NOW WE SEND A GET REQUEST TO SERVER
        
        let dashboardAccessReq = await fetch(backendURL + "/dashboard", {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                "authorization": sendLoginResBody.authorization,
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
        
        console.log("the status res us ", dashboardAccessReq.status);
        console.log("I am coming here")
        let dashboardAccessReqBody = await dashboardAccessReq.json()
        console.log(dashboardAccessReqBody);


    } else {
        let sendLoginResBody = await sendLogin.json()
        displayError(errorhandlingLogin,sendLoginResBody.message);
    }

}

//REGISTER HANDLING FUNCTION

async function SubmitRegister(data){
    let sendRegister = await fetch(backendURL + "/registeruser", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data)
    })

    let sendRegisterStatus = sendRegister.status
    if (sendRegisterStatus === 200){
        console.log("User added")
        window.location.href = frontendURL;
    } else {

        let sendLoginRes = await sendRegister.json();
        displayError(errorhandlingRegister,sendLoginRes.message);
         
    }
}





//LOGIN FORM SUBMISSION LOGIC

loginForm.addEventListener("submit" ,(e)=> {
    e.preventDefault();
    errorhandlingLogin.innerHTML = "";
    errorhandlingRegister.innerHTML = "";
    loginEmail = document.getElementById("loginEmail").value;
    loginPassword = document.getElementById("loginPassword").value;
    let data = {
        email: loginEmail,
        password: loginPassword
    }
    
    console.log(data);
    
    //CALL THE SUBMIT LOGIN FORM FUNCTION
    
    SubmitLogin(data);
})

//REGISTRATION LOGIC

registerForm.addEventListener("submit" ,(e)=> {
    e.preventDefault();

    errorhandlingLogin.innerHTML = "";
    errorhandlingRegister.innerHTML = "";

    inputName = document.getElementById("inputName").value;
    inputEmail = document.getElementById("inputEmail").value;
    inputPassword = document.getElementById("inputPassword").value;
    inputPasswordConfirm = document.getElementById("inputPasswordConfirm").value;

    // console.log(inputName, )

    if( inputPassword !== inputPasswordConfirm){
        displayError(errorhandlingRegister,"Passwords dont Match");
    } else {

        let data = {
            name: inputName,
            email: inputEmail,
            password: inputPassword
        }

        SubmitRegister(data);
    }

    
    //CALL THE REGISTER-FORM FUNCTION

})


// SETTING UP FORGOT PASSWORD

problemSigingInBtn = document.getElementById('problemSigingInBtn')

problemSigingInBtn.addEventListener("click", (e) => {
    $("#loginModal").modal('hide');
    $("#forgotModal").modal('show');
    document.getElementById('forgotModalBody').innerHTML =
        `<form action="#" id="passwordResetForm">`+
            ` <input class="form-control" type="email" placeholder="Enter your email" id="passwordResetEmail">`+
            `<br>`+
            `<button type="submit" class="btn btn-primary">Next</button>`+
            ` <button type="reset" class="btn btn-danger">Reset</button>`+
            `   </form>`

            passwordResetForm = document.getElementById('passwordResetForm')
            passwordResetForm.addEventListener("submit", async (e)=> {
                e.preventDefault();
                passwordResetEmail = document.getElementById("passwordResetEmail").value;
                console.log(passwordResetEmail)
            
            
                let forgotpasswordReq = await fetch(backendURL + "/forgotpassword", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: JSON.stringify({
                        email: passwordResetEmail
                    })
                })

                localStorage.setItem("sariOkayReset", "Bearer " + forgotpasswordReq.headers.get("sariOkayReset"));                
                let forgotpasswordReqBody = await forgotpasswordReq.json()
            
                if (forgotpasswordReq.status === 200){
                    document.getElementById('forgotModalBody').innerHTML = forgotpasswordReqBody.message
                } else {
                    document.getElementById('forgotModalBody').innerHTML = forgotpasswordReqBody.message
                }
            
            })



})


