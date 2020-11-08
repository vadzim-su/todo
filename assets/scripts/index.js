const key = "toDoList";
const allTasks = [];
const modal = document.querySelector(".modal");
const showModalButton = document.querySelector("#showModalButton");
const oKButton = document.querySelector("#addTaskButton");
const modalInputs = document.querySelectorAll(".form-control");
const errorText = document.querySelector(".error__text");
const allTasksList = document.querySelector("#allTasksList");
const todoTasksList = document.querySelector("#currentTasks");
const completedTasksList = document.querySelector("#completedTasks");
let editId;
let index;

getDataFromLocalStorage(key);

oKButton.addEventListener("click", (e) => {
  e.preventDefault();

  if (isValidForm()) {
    newTask = createNewTask();

    // if (editId) {
    //   newTask.id = editId;
    //   allTasks.splice(index, 1);
    // }
    allTasks.push(newTask);

    saveToLocalStorage(allTasks);
    drawTaskToList(newTask);
    clearForm();
    showHideModal();
  } else {
    showRedBorder();
  }
});

modalInputs.forEach((input) => {
  input.addEventListener("focus", hideRedBorderWrapper, false);
});

function createNewTask() {
  let date = new Date();
  let newTask = {
    title: "",
    text: "",
  };

  Object.keys(newTask).forEach((value) => {
    let field = document.querySelector(`[placeholder = '${value}']`);
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

  return newTask;
}

function drawTaskToList(task) {
  let newItem = addNewTask(task);
  if (task.status === "new") {
    if (editId) {
      ///
    } else {
      todoTasksList.appendChild(newItem);
    }
  } else if (task.status === "completed") {
    newItem.querySelector(".dropdown-menu.p-2.flex-column").innerHTML = `
    <button type="button" class="btn btn-danger w-100 delete">
      Delete
    </button>`;
    completedTasksList.appendChild(newItem);
  }
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

function clearForm() {
  modalInputs.forEach((input) => (input.value = ""));
  let modalCheckbox = document.querySelector(
    `[placeholder = "priority"]:checked`
  );
  modalCheckbox.checked = false;
}

function isValidForm() {
  const inputValues = [];
  const modalCheckbox = document.querySelector(
    `[placeholder = "priority"]:checked`
  );

  modalInputs.forEach((input) => {
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
      <small class="mr-2 task__priority">${priority} priority</small>
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
    <button type="button" class="btn btn-success complete w-100">
      Complete
    </button>
    <button type="button" class="btn btn-info w-100 my-2 edit">
      Edit
    </button>
    <button type="button" class="btn btn-danger w-100 delete">
      Delete
    </button>
  </div>
</div>`;
  return singleElement;
}

function saveToLocalStorage(arr) {
  localStorage.setItem("toDoList", JSON.stringify(arr));
}

function showRedBorder() {
  errorText.style.display = "block";
  modalInputs.forEach((input) => {
    if (!input.value) {
      input.classList.add("invalid");
    }
  });
}

function hideRedBorder(field) {
  if (!field.target.value) {
    field.target.classList.remove("invalid");
    errorText.style.display = "none";
  }
}

function hideRedBorderWrapper(input) {
  hideRedBorder(input);
}

function getDataFromLocalStorage(key) {
  if (localStorage.getItem(key)) {
    let savedTasksFromStorage = JSON.parse(localStorage.getItem(key));
    savedTasksFromStorage.forEach((task) => {
      allTasks.push(task);
      drawTaskToList(task);
    });
  }
}

// Buttons clicked

allTasksList.addEventListener("click", (e) => {
  const tableTask = e.target.closest("li");
  if (tableTask) {
    const chosenTask = allTasks.find((task) => {
      return task.id === tableTask.getAttribute("data-id");
    });
    index = allTasks.indexOf(chosenTask);

    if (e.target.classList.contains("complete")) {
      chosenTask.status = "completed";
      todoTasksList.removeChild(tableTask);
      drawTaskToList(chosenTask);
    }

    if (e.target.classList.contains("delete")) {
      chosenTask.status = "deleted";
      tableTask.closest("ul").removeChild(tableTask);
      allTasks.splice(index, 1);
    }

    if (e.target.classList.contains("edit")) {
      showHideModal();
      modalInputs[0].value = chosenTask.title;
      modalInputs[1].value = chosenTask.text;

      let modalPriorityCheckbox = document.querySelectorAll(
        `[name="gridRadios"]`
      );
      modalPriorityCheckbox.forEach((checkbox) => {
        if (checkbox.value === chosenTask.priority) {
          checkbox.setAttribute("checked", "true");
        }
      });

      editId = chosenTask.id;
    }
  }
  saveToLocalStorage(allTasks);
});

//remove all appendChild and removeChild, drawTask(allTasks)!!!!!!!!!!!!

// drag-n-drop

// currentTasks.ondragover = allowDrop;
// completedTasks.ondragover = allowDrop;

// function allowDrop(e) {
//   e.preventDefault();
// }
// let taskItem = document.querySelector(".task__item");
// taskItem.ondragstart = drag;

// function drag(e) {
//   e.dataTransfer.setData("class", e.target.class);
// }

// currentTasks.ondrop = drop;
// completedTasks.ondrop = drop;

// function drop(e) {
//   let itemClass = e.dataTransfer.getData("class");
//   e.target.append(document.querySelector(itemClass));
// }
