// //Sign in method
// auth.signInWithEmailAndPassword('alex.sallberg@gmail.com', 'qwerty').then( cred => {
//   console.log(cred.user);
// })

const modal = document.querySelector('#modal-login');
const container = document.querySelector("#container")


//Variable declaration
let userId;

//Listen for auth status changes
auth.onAuthStateChanged( user => {
  // console.log(user);
  
  if(user){
    
    // console.log(user.uid);
    //Initialize map
    userId = user.uid;
    gameInit();
    
  }
  else{
    //Show login form
    let modals = document.querySelectorAll('.modal');
    M.Modal.init(modals, {dismissible: false})
    M.Modal.getInstance(modal).open();
    //Hide game container
    container.style.display = 'none';
  }
})



//Sign in method
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', e => {
  e.preventDefault();

  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  auth.signInWithEmailAndPassword(email, password).then( cred => {
    M.Modal.getInstance(modal).close();
    loginForm.reset();
  })
  .catch( err => {
    console.log(err.message);

    let errorMessage = document.querySelector("#login-error");
    errorMessage.innerHTML = "";

    let el = document.createElement("p");
    let textNode = document.createTextNode("Wrong password or username");
    el.appendChild(textNode);
    errorMessage.appendChild(el);

  })
})

