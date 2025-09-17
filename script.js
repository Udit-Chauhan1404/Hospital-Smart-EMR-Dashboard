// ================== Demo Patients ==================
let patients = [
  {
    mrn: 1001,
    name: "Alice Johnson",
    age: 34,
    gender: "Female",
    cond: "Diabetes & Hypertension",
    tests: [
      { type: "glucose", value: 150, note: "Fasting", date: "2025-09-15" },
      { type: "glucose", value: 140, note: "Post-meal", date: "2025-09-16" },
      { type: "BP", value: 140, note: "Systolic", date: "2025-09-15" },
      { type: "BP", value: 90, note: "Diastolic", date: "2025-09-15" },
      { type: "cholesterol", value: 220, note: "Total", date: "2025-09-15" },
    ],
    notes: [{ text: "Patient advised diet control and exercise.", date: "2025-09-15" }],
  },
  {
    mrn: 1002,
    name: "Bob Smith",
    age: 45,
    gender: "Male",
    cond: "Hypertension & High Cholesterol",
    tests: [
      { type: "BP", value: 135, note: "Systolic", date: "2025-09-14" },
      { type: "BP", value: 85, note: "Diastolic", date: "2025-09-14" },
      { type: "cholesterol", value: 250, note: "Total", date: "2025-09-14" },
    ],
    notes: [{ text: "Encouraged daily walking and low-fat diet.", date: "2025-09-14" }],
  },
  {
    mrn: 1003,
    name: "Charlie Lee",
    age: 29,
    gender: "Male",
    cond: "Healthy",
    tests: [
      { type: "glucose", value: 95, note: "Fasting", date: "2025-09-10" },
      { type: "BP", value: 120, note: "Systolic", date: "2025-09-10" },
      { type: "BP", value: 75, note: "Diastolic", date: "2025-09-10" },
    ],
    notes: [{ text: "No issues detected.", date: "2025-09-10" }],
  },
  {
    mrn: 1004,
    name: "Diana Patel",
    age: 52,
    gender: "Female",
    cond: "High Cholesterol & Pre-diabetes",
    tests: [
      { type: "cholesterol", value: 240, note: "Total", date: "2025-09-12" },
      { type: "glucose", value: 125, note: "Fasting", date: "2025-09-12" },
    ],
    notes: [{ text: "Prescribed statins and diet modifications.", date: "2025-09-12" }],
  },
  {
    mrn: 1005,
    name: "Edward Kim",
    age: 38,
    gender: "Male",
    cond: "Pre-diabetes & Hypertension",
    tests: [
      { type: "glucose", value: 120, note: "Fasting", date: "2025-09-11" },
      { type: "BP", value: 130, note: "Systolic", date: "2025-09-11" },
      { type: "BP", value: 85, note: "Diastolic", date: "2025-09-11" },
    ],
    notes: [{ text: "Recommend exercise and diet.", date: "2025-09-11" }],
  },
  {
    mrn: 1006,
    name: "Fiona Chen",
    age: 50,
    gender: "Female",
    cond: "Diabetes",
    tests: [
      { type: "glucose", value: 160, note: "Fasting", date: "2025-09-10" },
      { type: "cholesterol", value: 230, note: "Total", date: "2025-09-10" },
    ],
    notes: [{ text: "Monitor glucose levels daily.", date: "2025-09-10" }],
  },
  {
    mrn: 1007,
    name: "George Brown",
    age: 60,
    gender: "Male",
    cond: "Hypertension",
    tests: [
      { type: "BP", value: 145, note: "Systolic", date: "2025-09-11" },
      { type: "BP", value: 95, note: "Diastolic", date: "2025-09-11" },
    ],
    notes: [{ text: "Check blood pressure twice a day.", date: "2025-09-11" }],
  },
  {
    mrn: 1008,
    name: "Hannah Davis",
    age: 42,
    gender: "Female",
    cond: "High Cholesterol",
    tests: [{ type: "cholesterol", value: 260, note: "Total", date: "2025-09-12" }],
    notes: [{ text: "Start statins immediately.", date: "2025-09-12" }],
  },
  {
    mrn: 1009,
    name: "Ian Wilson",
    age: 35,
    gender: "Male",
    cond: "Asthma",
    tests: [],
    notes: [{ text: "Prescribed inhaler.", date: "2025-09-13" }],
  },
  {
    mrn: 1010,
    name: "Julia Roberts",
    age: 47,
    gender: "Female",
    cond: "Diabetes & Hypertension",
    tests: [
      { type: "glucose", value: 155, note: "Fasting", date: "2025-09-14" },
      { type: "BP", value: 142, note: "Systolic", date: "2025-09-14" },
      { type: "BP", value: 88, note: "Diastolic", date: "2025-09-14" },
    ],
    notes: [{ text: "Recommended diet and exercise.", date: "2025-09-14" }],
  },
];
// ================== End Demo Patients ==================

let activeMRN = null;
let charts = {};

// =============== Render Patient List ===============
function renderPatientList(){
  const list=document.getElementById("patientList");
  const search=document.getElementById("search").value.toLowerCase();
  list.innerHTML="";
  patients.filter(p=>p.name.toLowerCase().includes(search)).forEach(p=>{
    const div=document.createElement("div");
    div.className="patient-card";
    div.onclick=()=>selectPatient(p.mrn);
    div.innerHTML=`<div class="patient-avatar">${p.name[0]}</div>
      <div class="patient-meta"><h3>${p.name}</h3>
      <p>${p.age} · ${p.gender}</p><small>${p.cond}</small></div>`;
    list.appendChild(div);
  });
}

// =============== Select Patient ===============
function selectPatient(mrn){
  activeMRN=mrn;
  const patient=patients.find(p=>p.mrn===mrn);
  document.getElementById("placeholder").style.display="none";
  document.getElementById("dashboard").style.display="block";
  document.getElementById("d_name").innerText=patient.name;
  document.getElementById("d_meta").innerText=`${patient.age} years · ${patient.gender}`;
  document.getElementById("d_mrn").innerText=patient.mrn;
  renderTests(); renderNotes(); renderInsights(); renderCharts(); renderTimeline();
}

// =============== Render Tests ===============
function renderTests(){
  const patient=patients.find(p=>p.mrn===activeMRN);
  document.getElementById("testsList").innerHTML=patient.tests.map(t=>`<div>${t.date}: ${t.type} = ${t.value} (${t.note})</div>`).join("");
}

// =============== Render Notes ===============
function renderNotes(){
  const patient=patients.find(p=>p.mrn===activeMRN);
  document.getElementById("notesArea").value=patient.notes.map(n=>`${n.date}: ${n.text}`).join("\n");
}

// =============== Render Insights ===============
function renderInsights(){
  const patient=patients.find(p=>p.mrn===activeMRN);
  let insights=[];
  patient.tests.forEach(t=>{
    if(t.type==="glucose"&&t.value>140)insights.push("⚠ High Glucose detected.");
    if(t.type==="cholesterol"&&t.value>200)insights.push("⚠ High Cholesterol detected.");
    if(t.type==="BP"&&t.note==="Systolic"&&t.value>130)insights.push("⚠ High Blood Pressure (Systolic).");
    if(t.type==="BP"&&t.note==="Diastolic"&&t.value>85)insights.push("⚠ High Blood Pressure (Diastolic).");
  });
  document.getElementById("insightsArea").innerHTML="<h3>🤖 AI Insights</h3>"+(insights.length?insights.map(i=>`<p>${i}</p>`).join(""):"<p>No issues.</p>");
}

// =============== Render Timeline ===============
function renderTimeline(){
  const patient=patients.find(p=>p.mrn===activeMRN);
  const timeline=document.getElementById("timeline");
  timeline.innerHTML="";
  patient.tests.concat(patient.notes).sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(ev=>{
    const li=document.createElement("li");
    li.innerHTML=`<span class="dot"></span><span class="event">${ev.date}: ${ev.type?ev.type+"="+ev.value:ev.text}</span>`;
    timeline.appendChild(li);
  });
}

// =============== Charts ===============
function renderCharts(){
  const ctx=document.getElementById("vitalsChart").getContext("2d");
  if(charts.vitals)charts.vitals.destroy();
  const patient=patients.find(p=>p.mrn===activeMRN);
  if(!patient)return;
  const labels=[...new Set(patient.tests.map(t=>t.date))].sort();
  const glucoseData=labels.map(d=>patient.tests.find(t=>t.date===d&&t.type==="glucose")?.value||null);
  const cholesterolData=labels.map(d=>patient.tests.find(t=>t.date===d&&t.type==="cholesterol")?.value||null);
  const bpSystolicData=labels.map(d=>patient.tests.find(t=>t.date===d&&t.type==="BP"&&t.note==="Systolic")?.value||null);
  const bpDiastolicData=labels.map(d=>patient.tests.find(t=>t.date===d&&t.type==="BP"&&t.note==="Diastolic")?.value||null);
  const datasets=[];
  const sel=document.getElementById("vitalSelect").value;
  if(sel==="all"||sel==="glucose")datasets.push({label:"Glucose",data:glucoseData,borderColor:"#22c55e",tension:0.3,fill:true});
  if(sel==="all"||sel==="cholesterol")datasets.push({label:"Cholesterol",data:cholesterolData,borderColor:"#f59e0b",tension:0.3,fill:true});
  if(sel==="all"||sel==="BP")datasets.push({label:"BP Systolic",data:bpSystolicData,borderColor:"#ef4444",tension:0.3,fill:false});
  if(sel==="all"||sel==="BP")datasets.push({label:"BP Diastolic",data:bpDiastolicData,borderColor:"#3b82f6",tension:0.3,fill:false});
  charts.vitals=new Chart(ctx,{type:'line',data:{labels,datasets},options:{responsive:true,plugins:{legend:{position:'top'}}}});
}

// =============== Add Patient ===============
function openAddPatient(){document.getElementById("addPatientCard").classList.add("active");}
function closeAddPatient(){document.getElementById("addPatientCard").classList.remove("active");}
function addPatientFromForm(){
  const name=document.getElementById("newName").value;
  const age=document.getElementById("newAge").value;
  const gender=document.getElementById("newGender").value;
  const cond=document.getElementById("newCond").value;
  if(!name||!age||!gender) return alert("Fill all fields!");
  const mrn=patients.length?Math.max(...patients.map(p=>p.mrn))+1:1001;
  patients.push({mrn,name,age:Number(age),gender,cond,tests:[],notes:[]});
  closeAddPatient(); renderPatientList();
}

// =============== Add Test ===============
function openAddTest(){document.getElementById("formAddTest").classList.add("active");}
function closeAddTest(){document.getElementById("formAddTest").classList.remove("active");}
function addTestToActive(){
  const type=document.getElementById("testType").value;
  const value=document.getElementById("testValue").value;
  const note=document.getElementById("testNote").value;
  const date=document.getElementById("testDate").value;
  if(!type||!value||!date) return alert("Fill all fields!");
  const patient=patients.find(p=>p.mrn===activeMRN);
  patient.tests.push({type,value:Number(value),note,date});
  closeAddTest(); renderTests(); renderInsights(); renderCharts(); renderTimeline();
}

// =============== Add Note ===============
function openAddNote(){document.getElementById("formAddNote").classList.add("active");}
function closeAddNote(){document.getElementById("formAddNote").classList.remove("active");}
function addNoteToActive(){
  const text=document.getElementById("noteText").value;
  if(!text) return alert("Enter note");
  const patient=patients.find(p=>p.mrn===activeMRN);
  const date=new Date().toISOString().split("T")[0];
  patient.notes.push({text,date});
  document.getElementById("noteText").value="";
  closeAddNote(); renderNotes(); renderTimeline();
}

// =============== Sidebar toggle for mobile ===============
function toggleSidebar(){document.getElementById("sidebar").classList.toggle("active");}

// =============== Initial render ===============
renderPatientList();
