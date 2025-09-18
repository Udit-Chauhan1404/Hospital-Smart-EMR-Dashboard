let patients = JSON.parse(localStorage.getItem("patients")) || [];
let selectedPatient = null;

function saveData() {
  localStorage.setItem("patients", JSON.stringify(patients));
}

function renderPatients() {
  const list = document.getElementById("patientList");
  list.innerHTML = "";
  patients.forEach((p, idx) => {
    const div = document.createElement("div");
    div.className = "patient-card";
    div.innerText = p.name;
    div.onclick = () => selectPatient(idx);
    list.appendChild(div);
  });
}

function selectPatient(idx) {
  selectedPatient = idx;
  const p = patients[idx];
  document.getElementById("patientDetails").innerHTML = `
    <h2>${p.name}</h2>

    <div class="charts">
      <canvas id="chart${idx}" width="400" height="200"></canvas>
    </div>

    <div class="tests">
      <h3>Tests</h3>
      <ul>
        ${p.tests.map((t, i) => `<li>${t} <button onclick="deleteTest(${idx},${i})">❌</button></li>`).join("")}
      </ul>
      <button onclick="openForm('test')">+ Add Test</button>
    </div>

    <div class="notes">
      <h3>Notes</h3>
      <ul>
        ${p.notes.map((n, i) => `<li>${n} <button onclick="deleteNote(${idx},${i})">❌</button></li>`).join("")}
      </ul>
      <button onclick="openForm('note')">+ Add Note</button>
    </div>

    <div class="medicines">
      <h3>Medicines</h3>
      <ul>
        ${p.medicines.map((m, i) => `<li>${m} <button onclick="deleteMedicine(${idx},${i})">❌</button></li>`).join("")}
      </ul>
      <button onclick="openForm('medicine')">+ Add Medicine</button>
    </div>

    <div class="chat">
      <h3>AI Assistant</h3>
      <div class="chat-box" id="chatBox"></div>
      <input type="text" id="chatInput" placeholder="Ask AI..." />
      <button onclick="sendMessage()">Send</button>
    </div>
  `;
  renderChart(idx);
  addAIMessage("Hello Doctor! I am your AI assistant. You can ask me about your risk, medicines, recent notes, or tests.");
}

function renderChart(idx) {
  const ctx = document.getElementById(`chart${idx}`).getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May"],
      datasets: [{
        label: "Risk Factor",
        data: [12, 19, 3, 5, 2],
        borderColor: "blue",
        fill: false
      }]
    }
  });
}

function openForm(type) {
  const form = document.getElementById("form");
  form.classList.add("active");

  if (type === "patient") {
    form.innerHTML = `
      <h3>Add Patient</h3>
      <input id="patientName" placeholder="Name">
      <button onclick="addPatient()">Save</button>
      <button onclick="closeForm()">Cancel</button>
    `;
  } else if (type === "test") {
    form.innerHTML = `
      <h3>Add Test</h3>
      <input id="testName" placeholder="Test name">
      <button onclick="addTest()">Save</button>
      <button onclick="closeForm()">Cancel</button>
    `;
  } else if (type === "note") {
    form.innerHTML = `
      <h3>Add Note</h3>
      <input id="noteText" placeholder="Note">
      <button onclick="addNote()">Save</button>
      <button onclick="closeForm()">Cancel</button>
    `;
  } else if (type === "medicine") {
    form.innerHTML = `
      <h3>Add Medicine</h3>
      <input id="medicineText" placeholder="Medicine">
      <button onclick="addMedicine()">Save</button>
      <button onclick="closeForm()">Cancel</button>
    `;
  }
}

function closeForm() {
  document.getElementById("form").classList.remove("active");
}

function addPatient() {
  const name = document.getElementById("patientName").value;
  if (name) {
    patients.push({ name, tests: [], notes: [], medicines: [] });
    saveData();
    renderPatients();
    closeForm();
  }
}

function addTest() {
  const test = document.getElementById("testName").value;
  if (test && selectedPatient !== null) {
    patients[selectedPatient].tests.push(test);
    saveData();
    selectPatient(selectedPatient);
    closeForm();
  }
}

function deleteTest(pIdx, tIdx) {
  patients[pIdx].tests.splice(tIdx, 1);
  saveData();
  selectPatient(pIdx);
}

function addNote() {
  const note = document.getElementById("noteText").value;
  if (note && selectedPatient !== null) {
    patients[selectedPatient].notes.push(note);
    saveData();
    selectPatient(selectedPatient);
    closeForm();
  }
}

function deleteNote(pIdx, nIdx) {
  patients[pIdx].notes.splice(nIdx, 1);
  saveData();
  selectPatient(pIdx);
}

function addMedicine() {
  const medicine = document.getElementById("medicineText").value;
  if (medicine && selectedPatient !== null) {
    patients[selectedPatient].medicines.push(medicine);
    saveData();
    selectPatient(selectedPatient);
    closeForm();
  }
}

function deleteMedicine(pIdx, mIdx) {
  patients[pIdx].medicines.splice(mIdx, 1);
  saveData();
  selectPatient(pIdx);
}

function addAIMessage(msg) {
  const chatBox = document.getElementById("chatBox");
  const div = document.createElement("div");
  div.className = "chat-message ai";
  div.innerText = msg;
  chatBox.appendChild(div);
}

function addUserMessage(msg) {
  const chatBox = document.getElementById("chatBox");
  const div = document.createElement("div");
  div.className = "chat-message user";
  div.innerText = msg;
  chatBox.appendChild(div);
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;

  addUserMessage(msg);
  input.value = "";

  setTimeout(() => {
    addAIMessage("Hello Doctor! I am your AI assistant. You can ask me about your risk, medicines, recent notes, or tests.");
  }, 500);
}

renderPatients();
