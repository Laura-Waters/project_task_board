// DEPENDENCIES 
const taskNameInputEl = $('#task-name-input');
const taskDescriptionInputEl = $('#task-description-input');
const taskDateInputEl = $('#taskDueDate'); 
const taskFormEl = $('#task-form');
const tasksDisplayEl = $('#lane'); 

console.log(tasksDisplayEl);

function saveTasksToStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}; 

let nextId = JSON.parse(localStorage.getItem("nextId"));

// Retrieve tasks and nextId from localStorage
function readTasksFromStorage() {
    let tasks = JSON.parse(localStorage.getItem("tasks"));

    if (!tasks) {
        tasks = [];
    }

    return tasks; 
}; 


function createTaskCard(task) { 
    const taskCard = $('<div>')
        .addClass('card task-card draggable my-3')
        .attr('data-task-id', task.id);
    const cardHeader = $('<div>').addClass('card-header h4').text(task.name);
    const cardBody = $('<div>').addClass('card-body');
    const cardDescription = $('<p>').addClass('card-text').text(task.description);
    const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
    const cardDeleteBtn = $('<button>')
        .addClass('btn btn-danger delete')
        .text('Delete')
        .attr('data-task-id', task.id);
    cardDeleteBtn.on('click', handleDeleteTask);


  if (task.dueDate && task.status !== 'done') {
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

        
        if (now.isSame(taskDueDate, 'day')) {
            taskCard.addClass('bg-warning text-white');
        } else if (now.isAfter(taskDueDate)) {
            taskCard.addClass('bg-danger text-white');
            cardDeleteBtn.addClass('border-light');
        }
    }

    
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
  
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    const tasks = readTasksFromStorage();

    const todoList = $('#todo-cards');
    todoList.empty();

    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();

    const doneList = $('#done-cards');
    doneList.empty();

  
  for (let task of tasks) {
        if (task.status === 'to-do') {
        todoList.append(createTaskCard(task));
        } else if (task.status === 'in-progress') {
        inProgressList.append(createTaskCard(task));
        } else if (task.status === 'done') {
        doneList.append(createTaskCard(task));
        }
  }

  $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
        helper: function (e) {
        // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
        const original = $(e.target).hasClass('ui-draggable')
            ? $(e.target)
            : $(e.target).closest('.ui-draggable');
        // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
        return original.clone().css({
            width: original.outerWidth(),
        });
    },
  });

}

// Todo: create a function to handle deleting a task
function handleDeleteTask() {
    const taskId = $(this).attr('data-task-id');
    const tasks = readTasksFromStorage();

  
  tasks.forEach((task) => {
        if (task.id === taskId) {
            tasks.splice(tasks.indexOf(task), 1);
        }
  });

  saveTasksToStorage(tasks);
  renderTaskList();

}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();

    const taskName = taskNameInputEl.val().trim();
    const taskDescription = taskDescriptionInputEl.val().trim();
    const taskDate = taskDateInputEl.val();

    const newTask = {
        id: crypto.randomUUID(),
        name: taskName,
        description: taskDescription,
        dueDate: taskDate,
        status: 'to-do',
    };

    const tasks = readTasksFromStorage(); 
    tasks.push(newTask); 

    localStorage.setItem('tasks', JSON.stringify(tasks));
    console.log(tasks); 

    renderTaskList(); 

}; 


// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const tasks = readTasksFromStorage();

    const cardId = ui.draggable[0].dataset.taskId;

    const newStatus = event.target.id; 

    for (let task of tasks) {
        if (task.id === cardId) {
          task.status = newStatus;
        }
    }
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTaskList();

}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $('#taskDueDate').datepicker({
        changeMonth: true,
        changeYear: true,
    });

    // ? Make lanes droppable
    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });
});

$('#task-form').on('submit', handleAddTask); 

tasksDisplayEl.on('click', '.delete', handleDeleteTask);