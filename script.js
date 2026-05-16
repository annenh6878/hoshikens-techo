
const defaultLists = {
  departure: [
  {
    date: "2026-06-01",
    text: "確認護照有效期限",
    done: false
  },
  {
    date: "2026-06-10",
    text: "申辦留學簽證",
    done: false
  },
  {
    date: "2026-06-29",
    text: "飛日本",
    done: false
  },
  {
    date: "2026-06-29",
    text: "ドーミー西長堀入住",
    done: false
  },
  {
    date: "2026-07-01",
    text: "新生說明會",
    done: false
  }
],
  shoppingBefore: [
    { text: "轉接頭", done: false },
    { text: "文件夾", done: false },
    { text: "旅行收納袋", done: false },
    { text: "常備藥", done: false }
  ],
  shoppingAfter: [
    { text: "棉被 / 枕頭 / 床包", done: false },
    { text: "衣架 / 收納盒", done: false },
    { text: "小夜燈", done: false },
    { text: "延長線 / 轉接頭", done: false },
    { text: "洗衣精 / 柔軟精", done: false },
    { text: "馬克杯", done: false }
  ]
};

const defaultTimeline = [
  { date: "2026-06-29", text: "飛日本・宿舍入住" },
  { date: "2026-06-30", text: "日用品採買日" },
  { date: "2026-07-01", text: "新生說明會" }
];

const defaultBudget = [
  { name: "宿舍", amount: 0 },
  { name: "交通", amount: 0 },
  { name: "伙食", amount: 0 },
  { name: "日用品", amount: 0 },
  { name: "儀式感", amount: 0 }
];

const state = {
  departure: load("departure", defaultLists.departure),
  shoppingBefore: load("shoppingBefore", defaultLists.shoppingBefore),
  shoppingAfter: load("shoppingAfter", defaultLists.shoppingAfter),
  timeline: load("timeline", defaultTimeline),
  budget: load("budget", defaultBudget)
};

function load(key, fallback){
  const saved = localStorage.getItem(`hoshiken-v9-${key}`);
  return saved ? JSON.parse(saved) : fallback;
}

function save(key){
  localStorage.setItem(`hoshiken-v9-${key}`, JSON.stringify(state[key]));
}

function renderList(name){
  const container = document.getElementById(`${name}List`);
  container.innerHTML = "";

  state[name]
  .slice()
  .sort((a, b) => (a.date || "9999-12-31").localeCompare(b.date || "9999-12-31"))
  .forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "list-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done;
    checkbox.addEventListener("change", () => {
      state[name][index].done = checkbox.checked;
      save(name);
      updateProgress(name);
    });

    const text = document.createElement("div");
    text.className = "item-text";
    text.textContent = item.text;
const edit = document.createElement("button");
edit.className = "edit-btn";
edit.type = "button";
edit.textContent = "修改";
edit.addEventListener("click", () => {
  const newText = prompt("修改項目", item.text);
  if (!newText) return;

  state[name][index].text = newText.trim();
  state[name][index].date = extractDate(newText.trim());

  save(name);
  renderList(name);
});
const edit = document.createElement("button");
edit.className = "edit-btn";
edit.type = "button";
edit.textContent = "修改";

edit.addEventListener("click", () => {
  const newText = prompt("修改項目", item.text);

  if (!newText) return;

  state[name][index].text = newText.trim();
  state[name][index].date = extractDate(newText.trim());

  save(name);
  renderList(name);
});
    const del = document.createElement("button");
    del.className = "delete-btn";
    del.type = "button";
    del.textContent = "×";
    del.addEventListener("click", () => {
      state[name].splice(index, 1);
      save(name);
      renderList(name);
      updateProgress(name);
    });

    row.appendChild(checkbox);
    row.appendChild(text);
    row.appendChild(edit);
    row.appendChild(del);
    row.appendChild(edit);
    container.appendChild(row);
  });

  updateProgress(name);
}

function updateProgress(name){
  const list = state[name];
  const total = list.length;
  const done = list.filter(item => item.done).length;
  const percent = total === 0 ? 0 : Math.round(done / total * 100);

  document.getElementById(`${name}Done`).textContent = done;
  document.getElementById(`${name}Total`).textContent = total;
  document.getElementById(`${name}Percent`).textContent = `${percent}%`;
  document.getElementById(`${name}Progress`).style.width = `${percent}%`;
}

document.querySelectorAll(".add-form").forEach(form => {
  form.addEventListener("submit", event => {
    event.preventDefault();
    const name = form.dataset.list;
    const input = form.querySelector("input");
    const text = input.value.trim();
    if(!text) return;
function extractDate(text) {
  const match = text.match(/(\d{1,2})\/(\d{1,2})/);
  if (!match) return "9999-12-31";

  const month = match[1].padStart(2, "0");
  const day = match[2].padStart(2, "0");

  return `2026-${month}-${day}`;
}
    state[name].push({ 
  date: extractDate(text), 
  text, 
  done:false 
});
    input.value = "";
    save(name);
    renderList(name);
  });
});

function renderTimeline(){
  const container = document.getElementById("timelineList");
  container.innerHTML = "";

  state.timeline.slice().sort((a,b) => a.date.localeCompare(b.date)).forEach((item) => {
    const realIndex = state.timeline.findIndex(x => x.date === item.date && x.text === item.text);
    const row = document.createElement("div");
    row.className = "timeline-row";

    const date = document.createElement("div");
    date.className = "timeline-date";
    date.textContent = formatShortDate(item.date);

    const text = document.createElement("div");
    text.textContent = item.text;

    const edit = document.createElement("button");
    edit.className = "edit-btn";
    edit.type = "button";
    edit.textContent = "修改";
    edit.addEventListener("click", () => {
      const newDate = prompt("修改日期（YYYY-MM-DD）", item.date);
      if(!newDate) return;
      const newText = prompt("修改行程內容", item.text);
      if(!newText) return;
      state.timeline[realIndex] = { date: newDate, text: newText.trim() };
      save("timeline");
      renderTimeline();
    });

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.type = "button";
    del.textContent = "×";
    del.addEventListener("click", () => {
      state.timeline.splice(realIndex, 1);
      save("timeline");
      renderTimeline();
    });

    row.appendChild(date);
    row.appendChild(text);
    row.appendChild(edit);
    row.appendChild(del);
    container.appendChild(row);
  });
}

document.getElementById("timelineForm").addEventListener("submit", event => {
  event.preventDefault();
  const dateInput = document.getElementById("timelineDate");
  const textInput = document.getElementById("timelineText");
  const date = dateInput.value;
  const text = textInput.value.trim();

  if(!date || !text) return;

  state.timeline.push({ date, text });
  dateInput.value = "";
  textInput.value = "";
  save("timeline");
  renderTimeline();
});

function renderBudget(){
  const container = document.getElementById("budgetList");
  container.innerHTML = "";

  state.budget.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "budget-row";

    const name = document.createElement("div");
    name.className = "budget-name";
    name.textContent = item.name;

    const amount = document.createElement("div");
    amount.className = "budget-amount";
    amount.textContent = `¥ ${Number(item.amount || 0).toLocaleString()}`;

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.type = "button";
    del.textContent = "×";
    del.addEventListener("click", () => {
      state.budget.splice(index, 1);
      save("budget");
      renderBudget();
    });

    row.addEventListener("click", (event) => {
      if(event.target === del) return;
      const newName = prompt("修改分類名稱", item.name);
      if(!newName) return;
      const newAmount = prompt("修改金額", item.amount);
      if(newAmount === null) return;
      state.budget[index] = { name: newName.trim(), amount: Number(newAmount) || 0 };
      save("budget");
      renderBudget();
    });

    row.appendChild(name);
    row.appendChild(amount);
    row.appendChild(del);
    container.appendChild(row);
  });

  updateBudgetTotal();
}

function updateBudgetTotal(){
  const total = state.budget.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  document.getElementById("budgetTotal").textContent = total.toLocaleString();
}

document.getElementById("budgetForm").addEventListener("submit", event => {
  event.preventDefault();
  const nameInput = document.getElementById("budgetName");
  const amountInput = document.getElementById("budgetAmount");
  const name = nameInput.value.trim();
  const amount = Number(amountInput.value) || 0;

  if(!name) return;

  state.budget.push({ name, amount });
  nameInput.value = "";
  amountInput.value = "";
  save("budget");
  renderBudget();
});

function formatShortDate(value){
  const date = new Date(value + "T00:00:00");
  return `${date.getMonth()+1}/${date.getDate()}`;
}

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove("active"));
    panels.forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(target).classList.add("active");
  });
});

function japaneseEraYear(date){
  if(date >= new Date(2019, 4, 1)){
    const year = date.getFullYear() - 2018;
    return `令和${year === 1 ? "元" : year}年`;
  }
  if(date >= new Date(1989, 0, 8)){
    const year = date.getFullYear() - 1988;
    return `平成${year === 1 ? "元" : year}年`;
  }
  return `${date.getFullYear()}年`;
}

function updateJapaneseDate(){
  const input = document.getElementById("diaryDate");
  const display = document.getElementById("jpDate");

  if(!input.value){
    display.textContent = "日期會顯示在這裡";
    return;
  }

  const date = new Date(input.value + "T00:00:00");
  const weekdaysJP = ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"];
  const western = `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`;
  const era = `${japaneseEraYear(date)}${date.getMonth()+1}月${date.getDate()}日`;
  const weekday = weekdaysJP[date.getDay()];

  display.textContent = `${western}｜${era}｜${weekday}`;
}

document.getElementById("diaryDate").addEventListener("change", updateJapaneseDate);

// photo upload
const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");
const clearPhoto = document.getElementById("clearPhoto");

const savedPhoto = localStorage.getItem("hoshiken-v9-photo");
if(savedPhoto){
  photoPreview.src = savedPhoto;
  photoPreview.style.display = "block";
  clearPhoto.style.display = "block";
}

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    photoPreview.src = reader.result;
    photoPreview.style.display = "block";
    clearPhoto.style.display = "block";
    localStorage.setItem("hoshiken-v9-photo", reader.result);
  };
  reader.readAsDataURL(file);
});

clearPhoto.addEventListener("click", () => {
  localStorage.removeItem("hoshiken-v9-photo");
  photoPreview.removeAttribute("src");
  photoPreview.style.display = "none";
  clearPhoto.style.display = "none";
  photoInput.value = "";
});

// drawing canvas
const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
let drawing = false;

function setupCanvas(){
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#7e6ea1";
  const saved = localStorage.getItem("hoshiken-v9-drawing");
  if(saved){
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = saved;
  }
}

function pointerPos(event){
  const rect = canvas.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
}

function startDraw(event){
  event.preventDefault();
  drawing = true;
  const pos = pointerPos(event);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function draw(event){
  if(!drawing) return;
  event.preventDefault();
  const pos = pointerPos(event);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function stopDraw(){
  drawing = false;
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
window.addEventListener("mouseup", stopDraw);
canvas.addEventListener("touchstart", startDraw, { passive:false });
canvas.addEventListener("touchmove", draw, { passive:false });
canvas.addEventListener("touchend", stopDraw);

document.getElementById("clearCanvas").addEventListener("click", () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  localStorage.removeItem("hoshiken-v9-drawing");
});

document.getElementById("saveCanvas").addEventListener("click", () => {
  localStorage.setItem("hoshiken-v9-drawing", canvas.toDataURL("image/png"));
});

renderList("departure");
renderList("shoppingBefore");
renderList("shoppingAfter");
renderTimeline();
renderBudget();
updateJapaneseDate();
setupCanvas();
