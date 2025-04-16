let signUpBtn = document.getElementById("signUpBtn");
let signInBtn = document.getElementById("signInBtn");
let nameField = document.getElementById("nameField");
let passwordField = document.getElementById("passwordField");
let forgotPsw = document.getElementById("forgotPsw");
let sendBtn = document.getElementById("sendBtn");
let title = document.getElementById("title");
let form = document.getElementById("form")

let parrafoTop = document.getElementById("parrafoTop");
let parrafoBottom = document.getElementById("parrafoBottom");
let recoverPsw = document.getElementById("recoverPsw");
let returnLogin = document.getElementById("returnLogin");

let signInView = false;
let signUpView = true;

let nameInput = document.querySelector('input[name="name"]');
let emailInput = document.querySelector('input[name="email"]');
let passwordInput = document.querySelector('input[name="password"]');



//funcionalidades
//------------------------------------------fetch------------------------------------------

async function fetchData(url, data) {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            credentials: 'same-origin'
        });

        const resData = await res.json();

        if (!res.ok) {
            throw new Error(resData.message);
        }
        return resData;
    } catch (error) {
        alert("Error: " + error.message);
        console.error("Error en fetch:", error);
    }
}


//------------------------------------------validacion email------------------------------------------
function validarCampos({ name = "", email, password = "" }) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.length > 100 || email.length > 100 || password.length > 100) {
        alert("Maximum length is 100 characters.");
        return false;
    }

    if (!emailRegex.test(email)) {
        alert("Please enter a valid email.");
        return false;
    }

    return true;
}


//------------------------------------------iniciar sesion------------------------------------------
signInBtn.onclick = async function () {
    if (!signInView) {
        nameField.style.maxHeight = "0";
        title.innerHTML = "Sign In";
        signUpBtn.classList.add("disable");
        signInBtn.classList.remove("disable");
        signInView = true;
        signUpView = false;

        nameInput.value = "";
        passwordInput.value = "";
    } else {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Please fill in all the fields.");
            return;
        }

        if (!validarCampos({ email, password })) return;


        const res = await fetchData("http://localhost:4000/api/login", { email, password });

        if (res.status === "Success") {
            window.location.href = '/admin'; 
        }
        console.log("Datos Sign In:", { email, password });

        nameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";
    }
};

//------------------------------------------crear cuenta------------------------------------------
signUpBtn.onclick = async function () {
    if (!signUpView) {
        nameField.style.maxHeight = "60px";
        title.innerHTML = "Sign Up";
        signUpBtn.classList.remove("disable");
        signInBtn.classList.add("disable");
        signInView = false;
        signUpView = true;

        nameInput.value = "";
        passwordInput.value = "";
    } else {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!name || !email || !password) {
            alert("Please fill in all the fields.");
            return;
        }

        if (!validarCampos({ name, email, password })) return;

        const res = await fetchData("http://localhost:4000/api/register", { name, email, password });

        if (res){
            console.log(res);
            alert(res.message)
        }

        console.log("Datos Sign Up:", { name, email, password });

        nameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";
    }
};

//------------------------------------------recuperar contraseña------------------------------------------
forgotPsw.onclick = function () {
    nameField.style.maxHeight = "0";
    passwordField.style.maxHeight = "0";
    title.innerHTML = "Recover your password";
    signUpBtn.classList.add("hidden");
    signInBtn.classList.add("hidden");
    sendBtn.classList.remove("hidden");
    parrafoTop.classList.remove("hidden");
    parrafoBottom.classList.remove("hidden");
    recoverPsw.classList.add("hidden");

    nameInput.value = "";
    passwordInput.value = "";

};


function generateUniqueToken() {
    return new Date().getTime().toString(36); // Convierte el tiempo actual en milisegundos a base 36 para hacer un token único
}

sendBtn.onclick = async function() {
    const email = emailInput.value.trim();

    if (!email) {
        alert("Please enter a valid email.");
        return;
    }

    if (!validarCampos({ email })) return;
    const token = generateUniqueToken();

    const res = await fetchData("http://localhost:4000/api/recover", { email });

    if (res.status === "Success") {
        const resetLink = `http://localhost:4000/reset-password/${token}`;

        // Llamar a EmailJS para enviar el correo
        try {
            const response = await emailjs.send("CorreoLogin", "LoginPassword", {
                to_email: email,
                name: email,
                reset_link: resetLink // El enlace de recuperación
            }, "0NOvUMPdB6iz0BoOK");
    
            console.log("Correo de recuperación enviado:", response);
            alert("A recovery link has been sent to: " + email);
        } catch (error) {
            console.error("Error al enviar el correo:", error);
            alert("Error sending the email. Please try again.");
        }
    } else {
        alert("Email not found.");
    }
    emailInput.value = "";
    console.log("Datos Recover Password:", { email });
};



returnLogin.onclick = function () {
    nameField.style.maxHeight = signInView ? "0" : "60px";
    passwordField.style.maxHeight = "60px";
    title.innerHTML = signInView ? "Sign In" : "Sign Up";

    signUpBtn.classList.remove("hidden");
    signInBtn.classList.remove("hidden");
    sendBtn.classList.add("hidden");
    parrafoTop.classList.add("hidden");
    parrafoBottom.classList.add("hidden");
    recoverPsw.classList.remove("hidden");
};

function sendRecoveryEmail(email) {
    emailjs.send("CorreoLogin", "LoginPassword", {
      to_email: email,
    }).then(
      function(response) {
        console.log("Correo enviado", response);
        alert("Correo de recuperación enviado a " + email);
      },
      function(error) {
        console.log("Error al enviar", error);
        alert("Error sending the email.");
      }
    );
  }