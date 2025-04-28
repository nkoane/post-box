import { database } from "./util.ts";
const db = new database("browser-db");

const notify = (message: string) => {
  const notifier = document.getElementById("notify");
  if (notifier === null || notifier === undefined) {
    alert(messge);
    return;
  }

  notifier.innerText = `.${message.toLowerCase()}`;

  notifier.classList.add("opacity-100");
  setTimeout(() => {
    notifier.classList.remove("opacity-100");
  }, 3000);
};
type todo = {
  id: number;
  task: string;
  done: boolean;
};

const make_todo = (row: todo, index: number) => {
  const { id, task, done } = row;
  const item = document.createElement("li");
  const item_span = document.createElement("span");

  // span
  item_span.innerText = `${index + 1}: ${row.task}`;
  if (row.done) {
    item_span.classList.add("text-red-500");
  }
  item.appendChild(item_span);

  // checkbox
  const item_checkbox = document.createElement("input");
  item_checkbox.type = "checkbox";
  item_checkbox.checked = row.done;
  item_checkbox.classList.add("mr-2");
  item_checkbox.addEventListener("change", async () => {
    const res = await db.toggle_todo(id, item_checkbox.checked);
    if (res.ok === true) {
      item_span.classList.toggle("text-red-500");
    }
    notify(res.message);
  });
  item.appendChild(item_checkbox);

  // button
  const item_delete = document.createElement("button");
  item_delete.innerText = "delete";
  item_delete.classList.add("bg-red-500", "text-white", "p-2", "px-3");
  item_delete.addEventListener("click", async () => {
    const res = await db.delete_todo(row.id);
    if (res.ok === true) {
      item.remove();
    }
    notify(res.message);
  });

  item.appendChild(item_delete);
  item.classList.add("todo");
  return item;
};

const sort_todos = (todos: HTMLOListElement) => {
  const sorted = Array.from(todos.children).sort(
    (a, b) =>
      a.querySelector("input").checked - b.querySelector("input").checked,
  );
  todos.append(...sorted);
};

const make_todos = (todos: HTMLOListElement, rows: todo[]) => {
  rows
    .map((row, index) => {
      const item = make_todo(row, index);
      todos.appendChild(item);
    })
    .join("");
  sort_todos(todos);
};
document.addEventListener("DOMContentLoaded", async () => {
  const things = document.getElementById("things");
  const todos = document.querySelector(".todos");

  const task_master = document.getElementById("task-master");

  task_master.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const res = await db.add_todo(ev.target.elements.task.value, db);

    if (res.ok == true) {
      todos.appendChild(
        make_todo(
          {
            id: res.id as number,
            task: ev.target.elements.task.value,
            done: false,
          },
          todos.childElementCount,
        ),
      );
      sort_todos(todos);
      ev.target.reset();
    }
    notify(res.message);
  });

  const { rows } = await db.get().query(`SELECT * from todos ;`);
  if (rows.length > 0) make_todos(todos, rows);
});
