const key = "TASKS";
const currentUserKey = "CURRENT_USER";
const currentLanguageKey = "CURRENT_LANGUAGE";
const currentUser = JSON.parse(localStorage.getItem(currentUserKey));
const allTasks = [];
const lists = document.querySelectorAll(".task-list");
const modal = document.querySelector(".modal");
const showModalButton = document.querySelector("#showModalButton");
const oKButton = document.querySelector("#addTaskButton");
const modalInputs = document.querySelectorAll(".form-control");
const errorText = document.querySelector(".error__text");
const allTasksList = document.querySelector("#allTasksList");
const todoTasksList = document.querySelector("#currentTasks");
const completedTasksList = document.querySelector("#completedTasks");
const sort = document.querySelector("#sort");
const signIn = document.querySelector(".signIn");
const todoTasksNumber = document.querySelector("#todoTasksNumber");
const completedTasksNumber = document.querySelector("#completedTasksNumber");
const changeTheme = document.querySelector("[type='checkbox']");
const greeting = document.querySelector(".greeting");
const flag = document.querySelector("#flag");
let words = document.querySelectorAll("[data-lng]");
let theme = "light";
let currentLanguage = "english";
let sortedTasks = [];
let editId;
let index;

getDataFromLocalStorage(key);

showModalButton.addEventListener("click", (e) => {
  e.preventDefault();
  editId = null;
  modalInputs.forEach((input) => {
    removeRedBorder(input);
  });

  clearForm(modalInputs);
});

oKButton.addEventListener("click", (e) => {
  e.preventDefault();

  if (isValidForm(modalInputs)) {
    let newTask = createNewTask();

    if (editId) {
      newTask.id = editId;
      allTasks.splice(index, 1);
    }

    allTasks.push(newTask);
    saveToLocalStorage(allTasks);
    drawTasksList(allTasks);

    clearForm(modalInputs);
    showHideModal();
  } else {
    showRedBorder(modalInputs);
  }
});

modalInputs.forEach((input) => {
  input.addEventListener("focus", hideRedBorderWrapper, false);
});

// drag-n-drop

todoTasksList.addEventListener("dragover", allowDrop);
todoTasksList.addEventListener("drop", drop);
completedTasksList.addEventListener("dragover", allowDrop);
completedTasksList.addEventListener("drop", drop);

//change language

flag.addEventListener("click", changeLanguage);

// Buttons edit/delete/complete clicked

allTasksList.addEventListener("click", (e) => {
  editId = null;
  const tableTask = e.target.closest("li");
  if (tableTask) {
    const chosenTask = allTasks.find((task) => {
      return task.id === tableTask.getAttribute("data-id");
    });
    index = allTasks.indexOf(chosenTask);

    if (e.target.classList.contains("complete")) {
      chosenTask.status = "completed";
      drawTasksList(allTasks);
    }

    if (e.target.classList.contains("delete")) {
      allTasks.splice(index, 1);
      drawTasksList(allTasks);
    }

    if (e.target.classList.contains("edit")) {
      showHideModal();
      modalInputs[0].value = chosenTask.title;
      modalInputs[1].value = chosenTask.text;

      let modalPriorityRadiobuttons = document.querySelectorAll(
        `[name="gridRadios"]`
      );
      modalPriorityRadiobuttons.forEach((radiobutton) => {
        if (radiobutton.value === chosenTask.priority) {
          radiobutton.checked = true;
        }
      });

      editId = chosenTask.id;
    }
    saveToLocalStorage(allTasks);
  }
});

// sorting tasks

sort.addEventListener("click", (e) => {
  e.preventDefault();
  sortArrayByDate(sortedTasks);
  drawTasksList(sortedTasks);
});

// change theme

changeTheme.addEventListener(
  "change",
  $(function () {
    $(changeTheme).change(function () {
      document.body.classList.toggle("darkTheme");
      theme = document.body.classList.contains("darkTheme") ? "dark" : "light";
      localStorage.setItem("CURRENT_THEME", JSON.stringify(theme));
      drawTasksList(allTasks);
    });
  })
);

function createNewTask() {
  let date = new Date();
  let newTask = {
    title: "",
    text: "",
  };
  Object.keys(newTask).forEach((value) => {
    let field = document.querySelector(`[name = '${value}']`);
    newTask[value] = field.value;
  });

  newTask.priority = document.querySelector(
    `[name="gridRadios"]:checked`
  ).value;
  newTask.time = `${getFormatedDate(date.getHours())}:${getFormatedDate(
    date.getMinutes()
  )} ${getFormatedDate(date.getDate())}.${getFormatedDate(
    date.getMonth() + 1
  )}.${getFormatedDate(date.getFullYear())}`;
  newTask.id = Math.random().toString();
  newTask.status = "new";
  newTask.user = currentUser;
  return newTask;
}

function drawTasksList(tasks) {
  todoTasksList.innerHTML = "";
  completedTasksList.innerHTML = "";

  let currentUserTasks = tasks.filter((task) => task.user == currentUser);

  currentUserTasks.forEach((task) => {
    let newItem = addNewTask(task);
    newItem.addEventListener("dragstart", drag);
    addBackgroundColor(newItem);
    if (task.status === "new") {
      todoTasksList.appendChild(newItem);
    } else if (task.status === "completed") {
      newItem.querySelector(".dropdown-menu.p-2.flex-column").innerHTML = `
    <button type="button" class="btn btn-danger w-100 delete" data-lng="delete">
      Delete
    </button>`;
      completedTasksList.appendChild(newItem);
    }
  });
  currentLanguage = JSON.parse(localStorage.getItem(currentLanguageKey));
  words = document.querySelectorAll("[data-lng]");
  setLanguage(words, currentLanguage);
  drawTaskNumbers();
}

function addNewTask(task) {
  let taskItem = document.createElement("li");
  taskItem.classList.add(
    "list-group-item",
    "d-flex",
    "w-100",
    "mb-2",
    "task__item"
  );
  taskItem.dataset.id = task.id;
  taskItem.draggable = true;
  taskItem.innerHTML = drawSingleTask(
    task.title,
    task.text,
    task.time,
    task.priority
  );

  return taskItem;
}

function showHideModal() {
  $("#exampleModal").modal("toggle");
}

function clearForm(inputs) {
  inputs.forEach((input) => (input.value = ""));
  let modalCheckbox = document.querySelector(`[name="gridRadios"]:checked`);
  if (modalCheckbox) {
    modalCheckbox.checked = false;
  }
}

function isValidForm(inputs) {
  const inputValues = [];
  const modalCheckbox = document.querySelector(`[name="gridRadios"]:checked`);

  inputs.forEach((input) => {
    if (input.value) {
      inputValues.push(input.value);
    }
  });

  if (inputValues.length === 2 && modalCheckbox) {
    return true;
  }
  return false;
}

function getFormatedDate(time) {
  return time < 10 ? "0" + time : time;
}

function drawSingleTask(title, text, time, priority) {
  let singleElement = `<div class="w-100 mr-2">
  <div class="d-flex w-100 justify-content-between">
    <h5 class="mb-1 task__title">${title}</h5>
    <div>
      <small class="task__priority" data-lng = "priority">priority</small>
      <small class="mr-2 task__priority" data-lng = ${priority}>${priority}</small>
      <small class="task__date">${time}</small>
    </div>
  </div>
  <p class="mb-1 w-100 task__text">${text}</p>
</div>
<div class="dropdown m-2 dropleft">
  <button
    class="btn btn-secondary h-100"
    type="button"
    id="dropdownMenuItem1"
    data-toggle="dropdown"
  >
    <i class="fas fa-ellipsis-v"></i>
  </button>
  <div class="dropdown-menu p-2 flex-column">
    <button type="button" class="btn btn-success complete w-100" data-lng="complete">
      Complete
    </button>
    <button type="button" class="btn btn-info w-100 my-2 edit" data-lng="edit">
      Edit
    </button>
    <button type="button" class="btn btn-danger w-100 delete" data-lng="delete">
      Delete
    </button>
  </div>
</div>`;
  return singleElement;
}

function saveToLocalStorage(task) {
  localStorage.setItem(key, JSON.stringify(task));
}

function showRedBorder(inputs) {
  errorText.style.display = "block";
  inputs.forEach((input) => {
    if (!input.value) {
      input.classList.add("invalid");
    }
  });
}

function hideRedBorder(input) {
  if (!input.target.value) {
    removeRedBorder(input.target);
  }
}

function hideRedBorderWrapper(input) {
  hideRedBorder(input);
}

function removeRedBorder(input) {
  input.classList.remove("invalid");
  errorText.style.display = "none";
}

function getDataFromLocalStorage(key) {
  setTheme();
  greetingUser();
  currentLanguage = JSON.parse(localStorage.getItem(currentLanguageKey));

  setLanguage(words, currentLanguage);
  drawTaskNumbers();

  if (localStorage.getItem(key)) {
    let savedTasksFromStorage = JSON.parse(localStorage.getItem(key));
    savedTasksFromStorage.forEach((task) => {
      allTasks.push(task);
    });
    drawTasksList(allTasks);
  }
}

function sortArrayByDate() {
  sortedTasks = allTasks.reverse();
  return sortedTasks;
}

function greetingUser() {
  greeting.innerHTML = `${currentUser}!`;
}

function setTheme() {
  let savedTheme = JSON.parse(localStorage.getItem("CURRENT_THEME"));
  savedTheme === "dark" ? document.body.classList.add("darkTheme") : null;
}

function addBackgroundColor(taskLi) {
  let singleTask = allTasks.find((task) => task.id === taskLi.dataset.id);
  if (singleTask.priority === "low") {
    if (document.body.classList.contains("darkTheme")) {
      taskLi.style.backgroundColor = "#557655";
    } else {
      taskLi.style.backgroundColor = "#90dc90";
    }
  } else if (singleTask.priority === "medium") {
    if (document.body.classList.contains("darkTheme")) {
      taskLi.style.backgroundColor = "#8f8f60";
    } else {
      taskLi.style.backgroundColor = "#eeeeaa";
    }
  } else if (singleTask.priority === "high") {
    if (document.body.classList.contains("darkTheme")) {
      taskLi.style.backgroundColor = "#805050";
    } else {
      taskLi.style.backgroundColor = "#f08686";
    }
  }
}

function drawTaskNumbers() {
  let todoTasks = allTasks.filter(
    (task) => task.user === currentUser && task.status === "new"
  );
  todoTasksNumber.innerHTML = `(${todoTasks.length})`;
  let completedTasks = allTasks.filter(
    (task) => task.user === currentUser && task.status === "completed"
  );
  completedTasksNumber.innerHTML = `(${completedTasks.length})`;
}

//change language functions

function changeLanguage() {
  currentLanguage = JSON.parse(localStorage.getItem(currentLanguageKey));

  if (currentLanguage === "english") {
    currentLanguage = "russian";
  } else {
    currentLanguage = "english";
  }
  words = document.querySelectorAll("[data-lng]");
  setLanguage(words, currentLanguage);
  saveLanguageToLocalStorage();
  drawTasksList(allTasks);
}

function saveLanguageToLocalStorage() {
  localStorage.setItem(currentLanguageKey, JSON.stringify(currentLanguage));
}

function setLanguage(fields, language) {
  fields.forEach((field) => {
    fetch("https://vadzim-su.github.io/todo/translate.json")
      .then((data) => data.json())
      .then((data) => (field.innerHTML = data[language][field.dataset.lng]));
  });
}

// drag-n-drop functions

function allowDrop(e) {
  e.preventDefault();
}

function drag(e) {
  e.dataTransfer.setData("data-id", e.target.dataset.id);
}

function drop(e) {
  let dragedDataId = e.dataTransfer.getData("data-id");
  let dragedTask = allTasks.find((task) => task.id === dragedDataId);
  let listId = e.target.closest("ul").id;

  if (listId === "currentTasks" && dragedTask.status === "completed") {
    dragedTask.status = "new";
  }
  if (listId === "completedTasks" && dragedTask.status === "new") {
    dragedTask.status = "completed";
  }
  saveToLocalStorage(allTasks);
  drawTasksList(allTasks);
}
