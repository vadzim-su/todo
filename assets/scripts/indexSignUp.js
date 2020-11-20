const key = "USERS";
const currentUserKey = "CURRENT_USER";
const signUp = document.querySelector("#signup");
const modalInputs = document.querySelectorAll(".form-control");
const errorText = document.querySelector("#errorText");
const allUsers = getUsersFromLocalStorage(key);

signUp.addEventListener("click", (e) => {
  e.preventDefault();
  signUpNewUser(modalInputs);
});

function signUpNewUser(inputs) {
  if (isValidForm(inputs)) {
    if (isPasswordValid(inputs)) {
      let newUser = createNewUser(inputs);
      if (!isUserExist(newUser)) {
        if (
          isValidEnteredData(inputs[0].value, inputs[1].value, inputs[2].value)
        ) {
          saveUserToLocalStorage(newUser);
          location.href = "../../indexmain.html";
        }
      } else {
        showExistingUser(allUsers, newUser);
      }
    } else {
      showNotValidPassword();
    }
  } else {
    showNotValidFields(inputs);
  }
}

modalInputs.forEach((input) => {
  input.addEventListener("focus", hideNotValidFieldsWrapper, false);
});

function isValidForm(inputs) {
  let isValid = true;
  inputs.forEach((input) => {
    if (input.value === "") {
      isValid = false;
    }
  });
  return isValid;
}

function isPasswordValid(inputs) {
  if (inputs[2].value === inputs[3].value) {
    return true;
  }
  return false;
}

function saveUserToLocalStorage(user) {
  allUsers.push(user);
  localStorage.setItem(key, JSON.stringify(allUsers));
  localStorage.setItem(currentUserKey, JSON.stringify(user.username));
}

function createNewUser(inputs) {
  let newUser = {
    username: "",
    email: "",
    password: "",
  };
  let i = 0;
  Object.keys(newUser).forEach((key) => {
    newUser[key] = inputs[i].value;
    i++;
  });
  return newUser;
}

function showNotValidFields(inputs) {
  inputs.forEach((input) => {
    if (!input.value) {
      input.classList.add("invalid");
    } else {
      input.classList.remove("invalid");
    }
  });
}

function hideNotValidFieldsWrapper(input) {
  hideNotValidFields(input);
}

function hideNotValidFields(input) {
  if (!input.target.value) {
    input.target.classList.remove("invalid");
  }
}

function isUserExist(user) {
  let isExist = false;
  let savedUsers = getUsersFromLocalStorage(key) || [];
  savedUsers.forEach((savedUser) => {
    if (
      savedUser.username === user.username ||
      savedUser.email === user.email
    ) {
      isExist = true;
    }
  });
  return isExist;
}

function getUsersFromLocalStorage(key) {
  if (localStorage.getItem(key)) {
    let savedUsersFromStorage = JSON.parse(localStorage.getItem(key));
    return savedUsersFromStorage;
  }
  return [];
}

function showExistingUser(existingUsers, checkingUser) {
  let repeatedParameter = "";
  existingUsers.forEach((user) => {
    if (user.username === checkingUser.username) {
      repeatedParameter = "username";
    }
    if (user.email === checkingUser.email) {
      repeatedParameter = "email";
    }
  });
  errorText.innerHTML = `User with such ${repeatedParameter} is already exist`;
  errorText.style.display = "block";
}

function showNotValidPassword() {
  errorText.innerHTML = "Your passwords are not the same";
  errorText.style.display = "block";
}

//validate username, email, password

function isValidEnteredData(username, email, password) {
  if (/^[a-zA-Z0-9_-]{3,}/.test(username)) {
    if (/^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]{2,3}$/.test(email)) {
      if (/^[a-zA-Z0-9]{5,}/.test(password)) {
        return true;
      } else {
        errorText.innerHTML = "Your password is not valid";
        errorText.style.display = "block";
      }
    } else {
      errorText.innerHTML = "Your email is not valid";
      errorText.style.display = "block";
    }
  } else {
    errorText.innerHTML = "Your username is not valid";
    errorText.style.display = "block";
  }
}
