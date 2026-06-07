
const defaultLists = {
  departure: [
    { text: "確認護照有效期限", done: false },
    { text: "申辦留學簽證", done: false },
    { text: "6/29 飛日本", done: false },
    { text: "6/29 ドーミー西長堀入住", done: false },
    { text: "7/1 新生說明會", done: false }
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
  { date: "2026-06-29", text: "✈️ 飛往日本｜機票已確定" },
  { date: "2026-06-29", text: "🏠 ドーミー西長堀入住" },
  { date: "2026-06-30", text: "🧺 日用品採買日" },
  { date: "2026-07-01", text: "🏫 新生說明會" }
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
  budget: load("budget", defaultBudget),
  places: load("places", [])
};

function load(key, fallback){
  const saved = localStorage.getItem(`hoshiken-v9-${key}`);
  return saved ? JSON.parse(saved) : fallback;
}

function save(key){
  localStorage.setItem(`hoshiken-v9-${key}`, JSON.stringify(state[key]));
}

function extractDate(text) {
  const match = text.match(/(\d{1,2})\/(\d{1,2})/);
  if (!match) return "9999-12-31";

  const month = match[1].padStart(2, "0");
  const day = match[2].padStart(2, "0");

  return `2026-${month}-${day}`;
}

function renderList(name){
  const container = document.getElementById(`${name}List`);
  container.innerHTML = "";

  const sortedItems = state[name]
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      // 1. 完成的項目排最上面
      if (a.item.done !== b.item.done) {
        return a.item.done ? -1 : 1;
      }

      // 2. 同樣完成 / 未完成時，照日期排序
      const dateA = a.item.date || extractDate(a.item.text) || "9999-12-31";
      const dateB = b.item.date || extractDate(b.item.text) || "9999-12-31";

      return dateA.localeCompare(dateB);
    });

  sortedItems.forEach(({ item, index }) => {
    const row = document.createElement("div");
    row.className = "list-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done;

    checkbox.addEventListener("change", () => {
      state[name][index].done = checkbox.checked;
      save(name);
      renderList(name);
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
  const newText = prompt("修改項目內容", item.text);
  if (newText === null) return;

  const trimmed = newText.trim();
  if (!trimmed) return;

  state[name][index].text = trimmed;
  state[name][index].date = extractDate(trimmed);

  save(name);
  renderList(name);
  updateProgress(name);
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

    const actions = document.createElement("div");
    actions.className = "list-actions";
    actions.appendChild(edit);
    actions.appendChild(del);

    row.appendChild(checkbox);
    row.appendChild(text);
    row.appendChild(actions);
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


function renderPlaces(){
  const container = document.getElementById("placeList");
  container.innerHTML = "";

  state.places
    .slice()
    .sort((a,b) => b.date.localeCompare(a.date))
    .forEach((place) => {
      const index = state.places.findIndex(x => x.id === place.id);

      const card = document.createElement("div");
      card.className = "place-card";

      const head = document.createElement("div");
      head.className = "place-head";

      const titleWrap = document.createElement("div");
      const name = document.createElement("div");
      name.className = "place-name";
      name.textContent = place.name;
      if (place.mapUrl) {
  const pin = document.createElement("a");
  pin.className = "map-pin";
  pin.href = place.mapUrl;
  pin.target = "_blank";
  pin.rel = "noopener noreferrer";
  pin.textContent = "📍";
  name.appendChild(pin);
}

      const meta = document.createElement("div");
      meta.className = "place-meta";
      meta.textContent = `${formatShortDate(place.date)}・${place.type}・${place.area}`;

      titleWrap.appendChild(name);
      titleWrap.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "place-actions";

      const edit = document.createElement("button");
      edit.className = "edit-btn";
      edit.type = "button";
      edit.textContent = "修改";
      edit.addEventListener("click", () => {
        const newDate = prompt("修改日期（YYYY-MM-DD）", place.date);
        if(!newDate) return;
        const newName = prompt("修改店名 / 地點名稱", place.name);
        if(!newName) return;
        const newArea = prompt("修改地區", place.area);
        if(newArea === null) return;
        const newType = prompt("修改類型", place.type);
        if(newType === null) return;
        const newNote = prompt("修改心得", place.note);
        if(newNote === null) return;

        state.places[index] = {
          ...place,
          date: newDate,
          name: newName.trim(),
          area: newArea.trim(),
          type: newType.trim(),
          note: newNote.trim()
        };
        save("places");
        renderPlaces();
      });

      const del = document.createElement("button");
      del.className = "delete-btn";
      del.type = "button";
      del.textContent = "×";
      del.addEventListener("click", () => {
        state.places.splice(index, 1);
        save("places");
        renderPlaces();
      });

      actions.appendChild(edit);
      actions.appendChild(del);
      head.appendChild(titleWrap);
      head.appendChild(actions);

      const note = document.createElement("div");
      note.className = "place-note";
      note.textContent = place.note;

      card.appendChild(head);

      if(place.image){
        const img = document.createElement("img");
        img.className = "place-image";
        img.src = place.image;
        card.appendChild(img);
      }

      card.appendChild(note);
      container.appendChild(card);
    });
}

document.getElementById("placeForm").addEventListener("submit", event => {
  event.preventDefault();
  const date = document.getElementById("placeDate").value;
  const name = document.getElementById("placeName").value.trim();
  const area = document.getElementById("placeArea").value.trim();
  const type = document.getElementById("placeType").value;
  const mapUrl = document.getElementById("placeMapUrl").value.trim();
  const note = document.getElementById("placeNote").value.trim();
  const imageFile = document.getElementById("placeImage").files[0];

  if(!date || !name) return;

  const savePlace = (image = "") => {
    state.places.push({
  id: Date.now().toString(),
  date,
  name,
  area,
  type,
  mapUrl,
  note,
  image
});

    save("places");
    renderPlaces();
    document.getElementById("placeForm").reset();
  };

  if(imageFile){
    const reader = new FileReader();
    reader.onload = () => savePlace(reader.result);
    reader.readAsDataURL(imageFile);
  }else{
    savePlace("");
  }
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

["diaryDate","diaryMood","diaryText"].forEach(id => {
  const el = document.getElementById(id);
  const saved = localStorage.getItem(`hoshiken-v11-${id}`);
  if(saved) el.value = saved;
  el.addEventListener("input", () => {
    localStorage.setItem(`hoshiken-v11-${id}`, el.value);
    if(id === "diaryDate") updateJapaneseDate();
  });
});

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
renderPlaces();
updateJapaneseDate();
setupCanvas();

function getAllHoshikenData(){
  return {
    version: "v11",
    exportedAt: new Date().toISOString(),
    state,
    diary: {
      diaryDate: localStorage.getItem("hoshiken-v9-diaryDate") || "",
      diaryMood: localStorage.getItem("hoshiken-v9-diaryMood") || "",
      diaryText: localStorage.getItem("hoshiken-v9-diaryText") || "",
      photo: localStorage.getItem("hoshiken-v9-photo") || "",
      drawing: localStorage.getItem("hoshiken-v9-drawing") || "",
      diaryEntries: localStorage.getItem("hoshiken-v9-diaryEntries") || "[]"
    }
  };
}

function downloadBackup(){
  const data = getAllHoshikenData();
  const today = new Date().toISOString().slice(0, 10);
  const fileName = `hoshiken-backup-${today}.json`;

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

function restoreBackup(file){
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);

      if (!data.state) {
        alert("這個檔案不像星建備份檔喔。");
        return;
      }

      const keys = [
        "departure",
        "shoppingBefore",
        "shoppingAfter",
        "timeline",
        "budget",
        "places"
      ];

      keys.forEach(key => {
        const value = Array.isArray(data.state[key]) ? data.state[key] : [];

        state[key] = value;
        localStorage.setItem(`hoshiken-v9-${key}`, JSON.stringify(value));
      });

      if (data.diary) {
        Object.keys(data.diary).forEach(key => {
          localStorage.setItem(`hoshiken-v9-${key}`, data.diary[key] || "");
        });
      }

      alert("備份匯入完成！星建資料回來了 🩵");
      location.reload();

    } catch (error) {
      alert("備份讀取失敗，檔案可能壞掉或格式不對。");
      console.error(error);
    }
  };

  reader.readAsText(file);
}

document.getElementById("exportBackup").addEventListener("click", downloadBackup);

const importBackupBtn = document.getElementById("importBackupBtn");
const importBackupInput = document.getElementById("importBackup");

importBackupBtn.addEventListener("click", () => {
  importBackupInput.click();
});

importBackupInput.addEventListener("change", event => {
  alert("有選到備份檔，準備匯入");

  const file = event.target.files[0];
  if (!file) return;

  const ok = confirm("匯入備份會覆蓋目前星建資料，確定要繼續嗎？");
  if (!ok) {
    event.target.value = "";
    return;
  }

  restoreBackup(file);
  event.target.value = "";
});

function loadDiaryEntries(){
  const saved = localStorage.getItem("hoshiken-v9-diaryEntries");
  return saved ? JSON.parse(saved) : [];
}

function saveDiaryEntries(entries){
  localStorage.setItem("hoshiken-v9-diaryEntries", JSON.stringify(entries));
}

function renderDiaryEntries(){
  const container = document.getElementById("diaryList");
  if (!container) return;

  const entries = loadDiaryEntries();
  container.innerHTML = "";

  entries
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .forEach((entry, index) => {
      const card = document.createElement("div");
      card.className = "diary-entry-card";

      const date = document.createElement("div");
      date.className = "diary-entry-date";
      date.textContent = entry.date;

      const mood = document.createElement("p");
      mood.className = "diary-entry-mood";
      mood.textContent = entry.mood ? `今日心情：${entry.mood}` : "今日心情：未填";

      const text = document.createElement("p");
      text.className = "diary-entry-text";
      text.textContent = entry.text || "";

      const del = document.createElement("button");
      del.className = "delete-btn";
      del.type = "button";
      del.textContent = "×";
      del.addEventListener("click", () => {
        const ok = confirm("要刪除這篇日記嗎？");
        if (!ok) return;

        const currentEntries = loadDiaryEntries();
        currentEntries.splice(index, 1);
        saveDiaryEntries(currentEntries);
        renderDiaryEntries();
      });

      const toggle = document.createElement("button");
      toggle.className = "diary-entry-toggle";
      toggle.type = "button";
      toggle.textContent = `▸ ${entry.date}`;

      const body = document.createElement("div");
      body.className = "diary-entry-body";
      body.hidden = true;

      toggle.addEventListener("click", () => {
       body.hidden = !body.hidden;
       toggle.textContent = body.hidden ? `▸ ${entry.date}` : `▾ ${entry.date}`;
   });

      body.appendChild(mood);
      body.appendChild(text);

      
      if (entry.photo || entry.drawing) {
       const media = document.createElement("div");
       media.className = "diary-entry-media";

      if (entry.photo) {
       const img = document.createElement("img");
       img.className = "diary-entry-thumb";
       img.src = entry.photo;
       img.alt = "日記照片";

       img.style.width = "76px";
       img.style.height = "76px";
       img.style.maxWidth = "76px";
       img.style.maxHeight = "76px";
       img.style.objectFit = "cover";
       img.style.borderRadius = "18px";
       img.style.cursor = "pointer";
       img.style.display = "inline-block";
       img.style.flex = "0 0 76px";

        img.addEventListener("click", () => {
           openImageViewer(entry.photo);
        });

       media.appendChild(img);
     }

      if (entry.drawing) {
       const drawingImg = document.createElement("img");
       drawingImg.className = "diary-entry-thumb";
       drawingImg.src = entry.drawing;
       drawingImg.alt = "日記塗鴉";

        drawingImg.style.width = "76px";
        drawingImg.style.height = "76px";
        drawingImg.style.maxWidth = "76px";
        drawingImg.style.maxHeight = "76px";
        drawingImg.style.objectFit = "cover";
        drawingImg.style.borderRadius = "18px";
        drawingImg.style.cursor = "pointer";
        drawingImg.style.display = "inline-block";
        drawingImg.style.flex = "0 0 76px";
        
       drawingImg.addEventListener("click", () => {
         openImageViewer(entry.drawing);
       });
       media.appendChild(drawingImg);
     }

      body.appendChild(media);
}
      body.appendChild(del);
      
      card.appendChild(toggle);
      card.appendChild(body);
      container.appendChild(card);
    });
}

const saveDiaryBtn = document.getElementById("saveDiary");

if (saveDiaryBtn) {
  saveDiaryBtn.addEventListener("click", () => {
    const diaryMoodEl = document.getElementById("diaryMood");
    const diaryTextEl = document.getElementById("diaryText");

    const diaryMood = diaryMoodEl?.value.trim() || "";
    const diaryText = diaryTextEl?.value.trim() || "";

    const photoPreviewEl = document.getElementById("photoPreview");
    const photo = photoPreviewEl?.getAttribute("src") || localStorage.getItem("hoshiken-v9-photo") || "";

    const drawCanvasEl = document.getElementById("drawCanvas");
    let drawing = localStorage.getItem("hoshiken-v9-drawing") || "";

    if (drawCanvasEl) {
     const blankCanvas = document.createElement("canvas");
     blankCanvas.width = drawCanvasEl.width;
     blankCanvas.height = drawCanvasEl.height;

     const currentDrawing = drawCanvasEl.toDataURL("image/png");
     const blankDrawing = blankCanvas.toDataURL("image/png");

     if (currentDrawing !== blankDrawing) {
       drawing = currentDrawing;
    }
}

    if (!diaryMood && !diaryText && !photo && !drawing) {
  alert("先寫一點日記、放照片或畫塗鴉再保存喔 🩵");
  return;
}

    
    const now = new Date();
    const date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;

    const entries = loadDiaryEntries();


    entries.push({
     date,
     mood: diaryMood,
     text: diaryText,
     photo,
     drawing,
     createdAt: now.toISOString()
});

    saveDiaryEntries(entries);

    localStorage.setItem("hoshiken-v9-diaryMood", "");
    localStorage.setItem("hoshiken-v9-diaryText", "");

    if (diaryMoodEl) diaryMoodEl.value = "";
    if (diaryTextEl) diaryTextEl.value = "";

    localStorage.setItem("hoshiken-v9-photo", "");
    localStorage.setItem("hoshiken-v9-drawing", "");

    const photoPreview = document.getElementById("photoPreview");
    if (photoPreview) photoPreview.src = "";

    const canvas = document.getElementById("drawCanvas");
    if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

    renderDiaryEntries();


// 保存後清空日記輸入區
const clearDiaryMoodEl = document.getElementById("diaryMood");
const clearDiaryTextEl = document.getElementById("diaryText");

if (clearDiaryMoodEl) clearDiaryMoodEl.value = "";
if (clearDiaryTextEl) clearDiaryTextEl.value = "";

localStorage.setItem("hoshiken-v9-diaryMood", "");
localStorage.setItem("hoshiken-v9-diaryText", "");
localStorage.setItem("hoshiken-v9-photo", "");
localStorage.setItem("hoshiken-v9-drawing", "");

const clearPhotoPreview = document.getElementById("photoPreview");
if (clearPhotoPreview) {
  clearPhotoPreview.src = "";
  clearPhotoPreview.hidden = true;
}

const clearPhotoInput = document.getElementById("photoInput");
if (clearPhotoInput) {
  clearPhotoInput.value = "";
}

const clearCanvas = document.getElementById("drawCanvas");
if (clearCanvas) {
  const ctx = clearCanvas.getContext("2d");
  ctx.clearRect(0, 0, clearCanvas.width, clearCanvas.height);
}
    
    alert("今天的日記已經歸檔好了 🩵");
  });
}
function openImageViewer(src) {
  const viewer = document.getElementById("imageViewer");
  const viewerImg = document.getElementById("imageViewerImg");

  if (!viewer || !viewerImg) return;

  viewerImg.src = src;
  viewer.hidden = false;
}

function setupImageViewer() {
  const viewer = document.getElementById("imageViewer");
  const viewerImg = document.getElementById("imageViewerImg");
  const closeBtn = document.getElementById("closeImageViewer");

  if (!viewer || !viewerImg) return;
  viewer.addEventListener("click", () => {
    viewer.hidden = true;
    viewerImg.src = "";
  });

  viewerImg.addEventListener("click", (event) => {
    event.stopPropagation();
});

if (closeBtn) {
  closeBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    viewer.hidden = true;
    viewerImg.src = "";
  });
}
}

setupImageViewer();
renderDiaryEntries();
