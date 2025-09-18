const API_URL = "https://backend-emr.onrender.com";
let patients = [];
let activePatient = null;
let vitalsChart = null;

// Load Patients
async function loadPatients() {
  const res = await fetch(`${API_URL}/patients`);
  patients = await res.json();
  renderPatients();
}

// Render Patients
function renderPatients() {
  const list = document.getElementById("patientList");
  list.innerHTML = "";
  patients.forEach(p => {
    const div = document.createElement("div");
    div.className = "patient-card";
    div.innerText = p.name;
    div.onclick = () => openPatient(p._id);
    list.appendChild(div);
  });
}

// Open Patient
async function openPatient(id) {
  try {
    const res = await fetch(`${API_URL}/patients/${id}`);
    if (!res.ok) throw new Error("Could not open patient.");
    activePatient = await res.json();

    document.getElementById("patientName").innerText = activePatient.name;
    document.getElementById("patientDetails").innerText = `${activePatient.age} | ${activePatient.gender}`;

    renderTests();
    renderNotes();
    renderVitals();
    resetChat();
  } catch (err) {
    alert(err.message);
  }
}

// Render Tests
function renderTests() {
  const list = document.getElementById("testList");
  list.innerHTML = "";
  activePatient.tests.forEach((t, i) => {
    const li = document.createElement("li");
    li.innerText = `${t.name}: ${t.result}`;
    const btn = document.createElement("button");
    btn.innerText = "❌";
    btn.onclick = () => deleteTest(i);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

// Render Notes
function renderNotes() {
  const list = document.getElementById("notesList");
  list.innerHTML = "";
  activePatient.notes.forEach(n => {
    const li = document.createElement("li");
    li.innerText = n;
    list.appendChild(li);
  });
}

// Render Vitals Chart
function renderVitals() {
  const ctx = document.getElementById("vitalsChart").getContext("2d");
  if (vitalsChart) vitalsChart.destroy();
  vitalsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["BP", "HR", "Temp"],
      datasets: [{
        label: "Vitals",
        data: [
          activePatient.vitals.bp || 0,
          activePatient.vitals.hr || 0,
          activePatient.vitals.temp || 0
        ],
        borderColor: "blue",
        fill: false
      }]
    }
  });
}

// Forms
function openPatientForm() { document.getElementById("patientForm").classList.add("active"); }
function closePatientForm() { document.getElementById("patientForm").classList.remove("active"); }
function openTestForm() { document.getElementById("testForm").classList.add("active"); }
function closeTestForm() { document.getElementById("testForm").classList.remove("active"); }
function openNoteForm() { document.getElementById("noteForm").classList.add("active"); }
function closeNoteForm() { document.getElementById("noteForm").classList.remove("active"); }

// Add Patient
async function addPatient() {
  const name = document.getElementById("p_name").value;
  const age = document.getElementById("p_age").value;
  const gender = document.getElementById("p_gender").value;

  await fetch(`${API_URL}/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, age, gender })
  });
  closePatientForm();
  loadPatients();
}

// Add Test
async function addTest() {
  const name = document.getElementById("t_name").value;
  const result = document.getElementById("t_result").value;

  await fetch(`${API_URL}/patients/${activePatient._id}/tests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, result })
  });
  closeTestForm();
  openPatient(activePatient._id);
}

// Delete Test
async function deleteTest(index) {
  await fetch(`${API_URL}/patients/${activePatient._id}/tests/${index}`, { method: "DELETE" });
  openPatient(activePatient._id);
}

// Add Note
async function addNote() {
  const text = document.getElementById("n_text").value;
  await fetch(`${API_URL}/patients/${activePatient._id}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  closeNoteForm();
  openPatient(activePatient._id);
}

// Chat
function resetChat() {
  const box = document.getElementById("chatBox");
  box.innerHTML = "";
  const welcome = document.createElement("div");
  welcome.className = "chat-message ai";
  welcome.innerText = "🤖 Hello Doctor! I am your AI assistant. You can ask me about your risk, medicines, recent notes, or tests.";
  box.appendChild(welcome);
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;

  const box = document.getElementById("chatBox");

  const userMsg = document.createElement("div");
  userMsg.className = "chat-message user";
  userMsg.innerText = text;
  box.appendChild(userMsg);

  const aiMsg = document.createElement("div");
  aiMsg.className = "chat-message ai";
  aiMsg.innerText = "🤖 (AI) I will analyze: " + text;
  box.appendChild(aiMsg);

  input.value = "";
  box.scrollTop = box.scrollHeight;
}

loadPatients();
