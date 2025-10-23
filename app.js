// Store function with closure
function createStore(storageKey) {
  let state = JSON.parse(localStorage.getItem(storageKey)) || [];

  function persist() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  return {
    add(task) {
      state.push(task);
      persist();
      return [...state]; // returning a clone of the state
    },
    toggle(id) {
      state = state.map(task => task.id === id ? {...task, done: !task.done} : task);
      persist();
      return [...state]; 
    },
    remove(id) {
      state = state.filter(task => task.id !== id);
      persist();
      return [...state];
    },
    list() {
      return [...state]; // returns a clone of the state
    }
  };
}

// Initialize store with unique storage key
const SID4 = '1234';  // Replace with actual SID4 value
const store = createStore(`focustasks_${SID4}`);

// Escape user input to prevent XSS
function escapeHTML(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// Update live analytics in header
function updateAnalytics() {
  const tasks = store.list();
  const { active, done, pct } = summarize(tasks);
  document.getElementById('analytics').textContent = `Active: ${active} · Done: ${done} · Done %: ${pct}%`;
}

// Summarize tasks into active, done, and percentage
function summarize(tasks) {
  const active = tasks.filter(task => !task.done).length;
  const done = tasks.filter(task => task.done).length;
  const pct = done ? (done / (active + done)) * 100 : 0;
  return { active, done, pct: pct.toFixed(1) };
}

// Add task event
document.getElementById('add-task').addEventListener('click', () => {
  const title = document.getElementById('new-task').value.trim();
  if (title === '') {
    alert('Please enter a valid task title.');
    return;
  }

  const newTask = {
    id: Date.now() + Math.random().toString(36).substr(2, 9),  // Unique ID based on timestamp and random string
    title: escapeHTML(title),
    done: false
  };

  store.add(newTask);
  renderTasks();
  updateAnalytics();
  document.getElementById('new-task').value = ''; // Clear input field
});

// Render tasks in the UI
function renderTasks() {
  const activeList = document.getElementById('active-list');
  const doneList = document.getElementById('done-list');

  activeList.innerHTML = '';
  doneList.innerHTML = '';

  const tasks = store.list();
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `${task.title} 
      <button class="toggle-btn" data-id="${task.id}">${task.done ? 'Undo' : 'Done'}</button>
      <button class="delete-btn" data-id="${task.id}">Delete</button>`;
    
    if (task.done) {
      li.classList.add('done');
      doneList.appendChild(li);
    } else {
      activeList.appendChild(li);
    }
  });
}

// Event delegation for task actions (toggle and delete)
document.getElementById('task-list').addEventListener('click', (e) => {
  if (e.target.classList.contains('toggle-btn')) {
    const taskId = e.target.getAttribute('data-id');
    store.toggle(taskId);
    renderTasks();
    updateAnalytics();
  } else if (e.target.classList.contains('delete-btn')) {
    const taskId = e.target.getAttribute('data-id');
    store.remove(taskId);
    renderTasks();
    updateAnalytics();
  }
});

// Initialize app by rendering tasks and updating analytics
renderTasks();
updateAnalytics();
