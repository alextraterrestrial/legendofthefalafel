const modal = document.querySelector('#modal-login');

//Listen for auth status changes
auth.onAuthStateChanged( user => {
  console.log(user);
  if(user){
    //Initialize map

  }
  else{
    //Show login form
    let modals = document.querySelectorAll('.modal');
    M.Modal.init(modals, {dismissible: false})
    M.Modal.getInstance(modal).open();
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
})
