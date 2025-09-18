// script.js (API-enabled version with Delete Test & AI message)

// Globals
let patients = [];
let activePatient = null;
let vitalsChart = null;

// ---------- Fetch patients from backend ----------
async function fetchPatients() {
  try {
    const res = await fetch('/api/patients');
    patients = await res.json();
    renderPatientList();
  } catch (e) {
    console.error('Failed to fetch patients', e);
    alert('Could not load patients from server. Is the backend running?');
  }
}

// ---------- Sidebar ----------
function renderPatientList() {
  let list = document.getElementById("patientList");
  let search = document.getElementById("search").value.toLowerCase();
  list.innerHTML = "";
  patients
    .filter(p => p.name.toLowerCase().includes(search))
    .forEach(p => {
      let card = document.createElement("div");
      card.className = "patient-card";
      card.innerHTML = `<div class="patient-meta">
          <h3>${p.name}</h3>
          <p>${p.age || ''} | ${p.gender || ''}</p>
          <small>MRN: ${p.mrn}</small>
        </div>`;
      card.onclick = () => openDashboard(p.mrn);
      list.appendChild(card);
    });
}

let chatBox = document.getElementById("chatBox");
if (chatBox) chatBox.innerHTML = "";

// ---------- Dashboard ----------
async function openDashboard(mrn) {
  try {
    const res = await fetch(`/api/patients/${mrn}`);
    if (!res.ok) throw new Error('Patient not found');
    activePatient = await res.json();

    document.getElementById("placeholder").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    document.getElementById("d_name").innerText = activePatient.name;
    document.getElementById("d_meta").innerText = `${activePatient.age || ''} | ${activePatient.gender || ''}`;
    document.getElementById("d_mrn").innerText = activePatient.mrn;
    document.getElementById("d_cond").innerText = activePatient.cond || '';
    document.getElementById("d_risk").innerText = calculateRisk(activePatient) + "%";

    renderCharts();
    renderTests();
    renderNotes();
    renderMeds();
    renderInsights();
    renderTimeline();

    // chat welcome (always "Hello Doctor!")
    let chatBox = document.getElementById("chatBox");
    if (chatBox) {
      chatBox.innerHTML = "";
      let welcomeMsg = document.createElement("div");
      welcomeMsg.className = "chat-message ai";
      welcomeMsg.innerText = `🤖 Hello Doctor! I am your AI assistant. You can ask me about your risk, medicines, recent notes, or tests.`;
      chatBox.appendChild(welcomeMsg);
    }

    runAILab();
  } catch (e) {
    console.error(e);
    alert('Could not open patient.');
  }
}

// ---------- Charts ----------
function renderCharts() {
  if (!activePatient) return;
  let ctx = document.getElementById("vitalsChart").getContext("2d");
  let vital = document.getElementById("vitalSelect").value;

  let labels = [...new Set((activePatient.tests || []).map(t => t.date))].sort();
  let datasets = [];

  function addDataset(label, color, getValues) {
    datasets.push({ label, data: labels.map(getValues), borderColor: color, fill: false, tension:0.3 });
  }

  if (vital==="all" || vital==="glucose")
    addDataset("Glucose","#e67e22", d => {
      let t = (activePatient.tests||[]).find(t=>t.date===d && t.type==="glucose");
      return t?t.value:null;
    });
  if (vital==="all" || vital==="cholesterol")
    addDataset("Cholesterol","#8e44ad", d => {
      let t = (activePatient.tests||[]).find(t=>t.date===d && t.type==="cholesterol");
      return t?t.value:null;
    });
  if (vital==="all" || vital==="BP")
    addDataset("Systolic BP","#27ae60", d => {
      let t = (activePatient.tests||[]).find(t=>t.date===d && t.type==="BP");
      return t?t.value:null;
    });

  if(vitalsChart) vitalsChart.destroy();
  vitalsChart = new Chart(ctx,{ type:"line", data:{labels,datasets}, options:{responsive:true, plugins:{legend:{position:"bottom"}}}});
}

// ---------- Tests ----------
function renderTests() {
  let area = document.getElementById("testsList");
  area.innerHTML = "";
  (activePatient.tests || []).forEach(t=>{
    let div = document.createElement("div");
    div.innerText = `${t.date}: ${t.type} = ${t.value} (${t.note || ''})`;
    area.appendChild(div);
  });
}
function openAddTest(){ document.getElementById("formAddTest").classList.add("active"); }
function closeAddTest(){ document.getElementById("formAddTest").classList.remove("active"); }

async function addTestToActive(){
  let type=document.getElementById("testType").value;
  let val=document.getElementById("testValue").value;
  let note=document.getElementById("testNote").value;
  let date=document.getElementById("testDate").value||new Date().toISOString().split("T")[0];
  if(activePatient && type && val){
    const res = await fetch(`/api/patients/${activePatient.mrn}/tests`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ type, value: Number(val), note, date })
    });
    activePatient = await res.json();
    closeAddTest(); renderTests(); renderCharts(); renderInsights(); renderTimeline(); runAILab();
    await fetchPatients();
  }
}

// ---------- Delete last test ----------
async function deleteLastTest() {
  if (activePatient && activePatient.tests && activePatient.tests.length > 0) {
    const res = await fetch(`/api/patients/${activePatient.mrn}/tests/last`, { method: 'DELETE' });
    activePatient = await res.json();
    renderTests();
    renderCharts();
    renderTimeline();
    renderInsights();
    runAILab();
    await fetchPatients();
  } else {
    alert("No tests to delete.");
  }
}

// ---------- Notes ----------
function renderNotes(){
  let area=document.getElementById("notesList");
  area.innerHTML="";
  (activePatient.notes || []).forEach(n=>{
    let div=document.createElement("div");
    div.innerHTML=`${n.date}: ${n.text}`;
    area.appendChild(div);
  });
}
function openAddNote(){document.getElementById("formAddNote").classList.add("active");}
function closeAddNote(){document.getElementById("formAddNote").classList.remove("active");}
async function addNoteToActive(){
  let txt=document.getElementById("noteText").value;
  if(activePatient && txt){
    const res = await fetch(`/api/patients/${activePatient.mrn}/notes`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ text: txt })
    });
    activePatient = await res.json();
    closeAddNote(); renderNotes(); renderTimeline(); renderInsights(); runAILab();
    await fetchPatients();
  }
}
async function deleteLastNote(){ 
  if(activePatient){
    const res = await fetch(`/api/patients/${activePatient.mrn}/notes/last`, { method: 'DELETE' });
    activePatient = await res.json();
    renderNotes(); renderTimeline(); renderInsights(); runAILab();
    await fetchPatients();
  }
}

// ---------- Medicines ----------
function renderMeds(){
  let area=document.getElementById("medList");
  area.innerHTML="";
  (activePatient.medicines || []).forEach(m=>{
    let li=document.createElement("li");
    li.innerText=`${m.name} (${m.dose}) - ${m.freq}`;
    area.appendChild(li);
  });
}
function openAddMedicine(){document.getElementById("formAddMedicine").classList.add("active");}
function closeAddMedicine(){document.getElementById("formAddMedicine").classList.remove("active");}
async function addMedicineToActive(){
  let name=document.getElementById("medName").value;
  let dose=document.getElementById("medDose").value;
  let freq=document.getElementById("medFreq").value;
  let duration = document.getElementById("medDuration") ? document.getElementById("medDuration").value : undefined;
  if(activePatient && name && dose && freq){
    const res = await fetch(`/api/patients/${activePatient.mrn}/medicines`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name, dose, freq, duration })
    });
    activePatient = await res.json();
    closeAddMedicine(); renderMeds(); renderTimeline(); runAILab();
    await fetchPatients();
  }
}

// ---------- AI Insights ----------
function renderInsights(){
  let area=document.getElementById("insightsContent");
  let alerts = [];
  let latestGlucose = (activePatient.tests||[]).filter(t=>t.type==="glucose").slice(-1)[0];
  let latestBP = (activePatient.tests||[]).filter(t=>t.type==="BP").slice(-1)[0];
  let latestChol = (activePatient.tests||[]).filter(t=>t.type==="cholesterol").slice(-1)[0];
  if(latestGlucose && latestGlucose.value>140) alerts.push('<div class="alert alert-high">⚠ High Glucose: '+latestGlucose.value+'</div>');
  if(latestBP && latestBP.value>140) alerts.push('<div class="alert alert-high">⚠ High BP: '+latestBP.value+'</div>');
  if(latestChol && latestChol.value>200) alerts.push('<div class="alert alert-medium">⚠ High Cholesterol: '+latestChol.value+'</div>');
  if(alerts.length===0) alerts.push('<div class="alert alert-normal">✅ All vitals normal.</div>');
  if(area) area.innerHTML = alerts.join('');
}

// ---------- AI Lab ----------
function runAILab(){
  if(!activePatient) return;
  let lab = document.getElementById("aiLabResult");
  let risk = calculateRisk(activePatient);
  let level = risk>70?"High":risk>40?"Moderate":"Low";
  let nextTests = ["glucose","BP","cholesterol"].filter(t=>!((activePatient.tests||[]).some(x=>x.type===t))).join(", ");
  if(lab) lab.innerHTML = `<p><b>Predicted Risk Level:</b> ${level}</p>
                   <p><b>Suggested Next Tests:</b> ${nextTests||"All tests done"}</p>
                   <p><b>Notes Review Needed:</b> ${activePatient.notes && activePatient.notes.length>0 ? "Yes":"No"}</p>`;
}

// ---------- AI Chat ----------
function sendChat(){
  let input=document.getElementById("chatInput");
  let box=document.getElementById("chatBox");
  let msg=input.value.trim(); if(!msg) return;
  let userMsg=document.createElement("div"); userMsg.className="chat-message user"; userMsg.innerText="👨‍⚕️ "+msg;
  box.appendChild(userMsg);
  let aiMsg=document.createElement("div"); aiMsg.className="chat-message ai"; aiMsg.innerText="🤖 "+generateAIResponse(msg);
  box.appendChild(aiMsg);
  input.value=""; box.scrollTop=box.scrollHeight;
}
function generateAIResponse(msg){
  msg=msg.toLowerCase();
  if(!activePatient) return "Select a patient first.";
  if(msg.includes("risk")) return "Patient risk is approx "+calculateRisk(activePatient)+"% based on vitals.";
  if(msg.includes("medicine")) return "Review current medicines: "+(activePatient.medicines || []).map(m=>m.name).join(", ");
  if(msg.includes("summary")) return "Recent notes: "+((activePatient.notes||[]).slice(-2).map(n=>n.text).join(". ")||"No notes.");
  return "Ask me about risk, medicines, or patient summary.";
}

// ---------- Patient Management ----------
async function addPatientFromForm(){
  let name=document.getElementById("newName").value;
  let age=document.getElementById("newAge").value;
  let gender=document.getElementById("newGender").value;
  let cond=document.getElementById("newCond").value;
  if(name && age && gender){
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name, age: Number(age), gender, cond })
    });
    const newPatient = await res.json();
    closeAddPatient();
    await fetchPatients();
    openDashboard(newPatient.mrn);
  } else {
    alert('Please fill name, age and gender.');
  }
}
function openAddPatient(){document.getElementById("addPatientCard").classList.add("active");}
function closeAddPatient(){document.getElementById("addPatientCard").classList.remove("active");}

// ---------- Timeline ----------
function renderTimeline(){
  let timeline=document.getElementById("timeline");
  timeline.innerHTML="";
  let entries = [];
  (activePatient.tests||[]).forEach(t=>entries.push({date:t.date,txt:`Test: ${t.type}=${t.value}`}));
  (activePatient.notes||[]).forEach(n=>entries.push({date:n.date,txt:`Note: ${n.text}`}));
  (activePatient.medicines||[]).forEach(m=>entries.push({date:new Date().toISOString().split("T")[0],txt:`Medicine: ${m.name}`}));
  entries.sort((a,b)=>new Date(a.date)-new Date(b.date));
  entries.forEach(e=>{
    let li=document.createElement("li");
    li.innerText=`${e.date}: ${e.txt}`;
    timeline.appendChild(li);
  });
}

// ---------- Risk Calculation ----------
function calculateRisk(p){
  let r=0;
  let lastGlucose=(p.tests||[]).filter(t=>t.type==="glucose").slice(-1)[0];
  if(lastGlucose) r+=lastGlucose.value/2;
  let lastBP=(p.tests||[]).filter(t=>t.type==="BP").slice(-1)[0];
  if(lastBP) r+=lastBP.value/3;
  let lastChol=(p.tests||[]).filter(t=>t.type==="cholesterol").slice(-1)[0];
  if(lastChol) r+=lastChol.value/4;
  return Math.min(100,Math.round(r));
}

// ---------- Sidebar Toggle ----------
function toggleSidebar(){ document.getElementById("sidebar").classList.toggle("active"); }

// ---------- Initial Render ----------
fetchPatients();
