const loginButton = document.querySelector("#login");
const modalInputs = document.querySelectorAll(".form-control");
const currentUserKey = "CURRENT_USER";
const allUsersKey = "USERS";
const allUsers = JSON.parse(localStorage.getItem(allUsersKey));
const errorText = document.querySelector("#errorText");

loginButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (isValidForm(modalInputs)) {
    if (isUserExist(modalInputs[0])) {
      let currentUser = allUsers.find(
        (user) => user.username === modalInputs[0].value
      );

      if (currentUser.password === modalInputs[1].value) {
        localStorage.setItem(
          currentUserKey,
          JSON.stringify(currentUser.username)
        );
        location.href = "../../indexmain.html";
      } else {
        showErrorText("Wrong password");
      }
    } else {
      showErrorText("User with such username don't exist");
    }
  } else {
    showNotValidFields(modalInputs);
  }
});

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

function isUserExist(input) {
  let isExist = false;
  allUsers.forEach((user) => {
    if (user.username === input.value) {
      isExist = true;
    }
  });
  return isExist;
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

function showErrorText(text) {
  errorText.style.display = "block";
  errorText.innerHTML = text;
}
