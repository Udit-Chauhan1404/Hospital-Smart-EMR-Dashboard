const API_URL = "https://backend-emr.onrender.com"; 

let currentPatient = null;

// Fetch and display patients
async function loadPatients() {
  const res = await fetch(`${API_URL}/patients`);
  const patients = await res.json();

  const patientList = document.getElementById("patientList");
  patientList.innerHTML = "";

  patients.forEach(p => {
    const div = document.createElement("div");
    div.className = "patient-card";
    div.innerText = `${p.name} (${p.age}, ${p.gender})`;
    div.onclick = () => openPatient(p.id);
    patientList.appendChild(div);
  });
}

// Open a patient profile
async function openPatient(id) {
  try {
    const res = await fetch(`${API_URL}/patients/${id}`);
    if (!res.ok) throw new Error("Patient not found");
    currentPatient = await res.json();

    document.getElementById("placeholder").style.display = "none";
    document.getElementById("patientDetails").style.display = "block";

    document.getElementById("patientName").innerText = currentPatient.name;
    document.getElementById("patientAgeGender").innerText =
      `${currentPatient.age} years, ${currentPatient.gender}`;

    renderTests();
    renderNotes();
    renderMedicines();
    renderTimeline();

    // Reset chat
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";
    addAIMessage("Hello Doctor! I am your AI assistant. You can ask me about your risk, medicines, recent notes, or tests.");
  } catch (err) {
    alert("Could not open patient.");
  }
}

/* ------------ RENDERING FUNCTIONS ------------ */
function renderTests() {
  const list = document.getElementById("testsList");
  list.innerHTML = "";
  (currentPatient.tests || []).forEach((t, i) => {
    const div = document.createElement("div");
    div.innerHTML = `${t} <button onclick="deleteTest(${i})">❌</button>`;
    list.appendChild(div);
  });
}

function renderNotes() {
  const list = document.getElementById("notesList");
  list.innerHTML = "";
  (currentPatient.notes || []).forEach(n => {
    const div = document.createElement("div");
    div.innerText = n;
    list.appendChild(div);
  });
}

function renderMedicines() {
  const list = document.getElementById("medList");
  list.innerHTML = "";
  (currentPatient.medicines || []).forEach(m => {
    const li = document.createElement("li");
    li.innerText = m;
    list.appendChild(li);
  });
}

function renderTimeline() {
  const list = document.getElementById("timeline");
  list.innerHTML = "";
  (currentPatient.timeline || []).forEach(ev => {
    const li = document.createElement("li");
    li.innerText = ev;
    list.appendChild(li);
  });
}

/* ------------ ADD / DELETE ------------ */
async function addPatient() {
  const name = document.getElementById("pName").value;
  const age = document.getElementById("pAge").value;
  const gender = document.getElementById("pGender").value;

  const res = await fetch(`${API_URL}/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, age, gender, tests: [], notes: [], medicines: [], timeline: [] })
  });

  if (res.ok) {
    closeForm();
    loadPatients();
  }
}

async function addTest() {
  const test = prompt("Enter test result:");
  if (!test) return;

  currentPatient.tests.push(test);
  currentPatient.timeline.push(`Test added: ${test}`);

  await updatePatient();
  renderTests();
  renderTimeline();
}

async function deleteTest(index) {
  currentPatient.tests.splice(index, 1);
  currentPatient.timeline.push("A test was deleted");

  await updatePatient();
  renderTests();
  renderTimeline();
}

async function addNote() {
  const note = prompt("Enter note:");
  if (!note) return;

  currentPatient.notes.push(note);
  currentPatient.timeline.push(`Note added: ${note}`);

  await updatePatient();
  renderNotes();
  renderTimeline();
}

async function addMedicine() {
  const med = prompt("Enter medicine:");
  if (!med) return;

  currentPatient.medicines.push(med);
  currentPatient.timeline.push(`Medicine prescribed: ${med}`);

  await updatePatient();
  renderMedicines();
  renderTimeline();
}

/* ------------ BACKEND UPDATE ------------ */
async function updatePatient() {
  await fetch(`${API_URL}/patients/${currentPatient.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(currentPatient)
  });
}

/* ------------ CHAT ------------ */
function sendMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (!message) return;

  addUserMessage(message);

  // Fake AI response
  setTimeout(() => {
    addAIMessage("Hello Doctor! I am your AI assistant. You can ask me about your risk, medicines, recent notes, or tests.");
  }, 600);

  input.value = "";
}

function addUserMessage(msg) {
  const div = document.createElement("div");
  div.className = "chat-message user";
  div.innerText = msg;
  document.getElementById("chatBox").appendChild(div);
  scrollChat();
}

function addAIMessage(msg) {
  const div = document.createElement("div");
  div.className = "chat-message ai";
  div.innerText = msg;
  document.getElementById("chatBox").appendChild(div);
  scrollChat();
}

function scrollChat() {
  const chatBox = document.getElementById("chatBox");
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* ------------ FORM ------------ */
function showForm() {
  document.getElementById("patientForm").style.display = "block";
}

function closeForm() {
  document.getElementById("patientForm").style.display = "none";
}

/* ------------ INIT ------------ */
window.onload = loadPatients;
