document.addEventListener("DOMContentLoaded",()=>{
 if(!session()||session().role!=="admin")return;
 renderAdmin();addQuestionBuilder();
 document.getElementById("newExamBtn")?.addEventListener("click",()=>{document.getElementById("examForm").reset();document.getElementById("builderQuestions").innerHTML="";addQuestionBuilder();openModal("examModal")});
 document.getElementById("addQuestion")?.addEventListener("click",addQuestionBuilder);
 document.getElementById("examForm")?.addEventListener("submit",createExam);
});
function renderAdmin(){
 const data=db(), results=data.results;
 document.getElementById("adminExamCount").textContent=data.exams.length;
 document.getElementById("adminStudentCount").textContent=data.users.filter(u=>u.role==="student").length;
 document.getElementById("adminAttemptCount").textContent=results.length;
 document.getElementById("adminAverage").textContent=results.length?Math.round(results.reduce((a,r)=>a+r.percentage,0)/results.length)+"%":"0%";
 document.getElementById("adminExamGrid").innerHTML=data.exams.map(adminExamCard).join("");
 const recent=[...results].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);
 document.getElementById("adminRecentResults").innerHTML=resultRows(recent);
 document.getElementById("adminResultsTable").innerHTML=resultRows([...results].sort((a,b)=>new Date(b.date)-new Date(a.date)),true)||`<tr><td colspan="5">No results yet.</td></tr>`;
 const students=data.users.filter(u=>u.role==="student");
 document.getElementById("studentsTable").innerHTML=students.map(u=>{const rs=results.filter(r=>r.userId===u.id);const avg=rs.length?Math.round(rs.reduce((a,r)=>a+r.percentage,0)/rs.length):0;const passed=rs.filter(r=>r.passed).length;return `<tr><td><b>${escapeHtml(u.name)}</b></td><td>${escapeHtml(u.email)}</td><td><span class="status-badge live">${escapeHtml(u.department||"CSE")}</span></td><td>${rs.length}</td><td>${avg}%</td><td>${passed}</td></tr>`}).join("");
 const deptRows=DEPARTMENTS.map(dept=>{const ds=students.filter(u=>(u.department||"CSE")==dept), dr=results.filter(r=>ds.some(u=>u.id===r.userId));const avg=dr.length?Math.round(dr.reduce((a,r)=>a+r.percentage,0)/dr.length):0;const pass=dr.length?Math.round(dr.filter(r=>r.passed).length/dr.length*100):0;return `<tr><td><b>${dept}</b></td><td>${ds.length}</td><td>${dr.length}</td><td>${avg}%</td><td>${pass}%</td></tr>`}).join("");
 document.getElementById("departmentPerformance").innerHTML=deptRows;
}
function adminExamCard(e){
 return `<article class="exam-card"><div class="exam-card-top"><div class="exam-card-icon">▣</div><span class="status-badge ${e.published?"live":"fail"}">${e.published?"PUBLISHED":"DRAFT"}</span></div><h3>${escapeHtml(e.title)}</h3><p>${escapeHtml(e.subject)} • ${escapeHtml(e.department==="ALL"?"All Departments":e.department||"CSE")}</p><div class="exam-meta"><span class="meta">◷ ${e.duration} min</span><span class="meta">▦ ${e.questions.length} questions</span><span class="meta">★ ${totalMarks(e)} marks</span></div><button class="btn btn-danger btn-full" onclick="deleteExam('${e.id}')">Delete Exam</button></article>`
}
function resultRows(rows,withDate=false){return rows.map(r=>`<tr><td><b>${escapeHtml(r.userName)}</b></td><td>${escapeHtml(r.examTitle)}</td>${withDate?`<td>${formatDate(r.date)}</td>`:""}<td>${r.score}/${r.total}</td><td><span class="status-badge ${r.passed?"pass":"fail"}">${r.percentage}% • ${r.passed?"Passed":"Failed"}</span></td></tr>`).join("")}
function addQuestionBuilder(){
 const box=document.getElementById("builderQuestions");if(!box)return;
 const index=box.children.length+1, div=document.createElement("div");div.className="builder-question";div.dataset.index=index;
 div.innerHTML=`<div class="builder-q-head"><b>Question ${index}</b><button type="button" class="remove-q">Remove</button></div><div class="question-fields"><input class="q-text" required placeholder="Enter question"><input class="q-option" required placeholder="Option A"><input class="q-option" required placeholder="Option B"><input class="q-option" required placeholder="Option C"><input class="q-option" required placeholder="Option D"><div class="correct-select"><label><input type="radio" name="correct${index}" value="0" checked> Correct: A</label><label><input type="radio" name="correct${index}" value="1"> Correct: B</label><label><input type="radio" name="correct${index}" value="2"> Correct: C</label><label><input type="radio" name="correct${index}" value="3"> Correct: D</label></div></div>`;
 div.querySelector(".remove-q").addEventListener("click",()=>{div.remove();[...box.children].forEach((x,i)=>{x.querySelector(".builder-q-head b").textContent=`Question ${i+1}`});});
 box.appendChild(div);
}
function createExam(e){
 e.preventDefault();const box=document.getElementById("builderQuestions"), qs=[...box.children];
 if(!qs.length){toast("Add at least one question.","error");return}
 const questions=qs.map((q,i)=>({id:"q"+Date.now()+i,text:q.querySelector(".q-text").value.trim(),options:[...q.querySelectorAll(".q-option")].map(x=>x.value.trim()),answer:Number(q.querySelector(`input[name="correct${q.dataset.index}"]:checked`).value),marks:2}));
 const data=db();data.exams.push({id:"e"+Date.now(),title:document.getElementById("newExamTitle").value.trim(),subject:document.getElementById("newExamSubject").value.trim(),department:document.getElementById("newExamDepartment").value,duration:Number(document.getElementById("newExamDuration").value),passing:Number(document.getElementById("newExamPass").value),published:true,questions});saveDB(data);closeModal("examModal");renderAdmin();toast("Exam created and published.");
}
function deleteExam(id){
 if(!confirm("Delete this exam? Existing result records will remain."))return;
 const data=db();data.exams=data.exams.filter(e=>e.id!==id);saveDB(data);renderAdmin();toast("Exam deleted.");
}
function totalMarks(e){return e.questions.reduce((a,q)=>a+Number(q.marks||1),0)}
function formatDate(d){return new Date(d).toLocaleDateString(undefined,{day:"2-digit",month:"short",year:"numeric"})}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
