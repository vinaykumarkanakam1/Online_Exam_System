let currentExam=null,currentQuestion=0,answers=[],timerId=null,secondsLeft=0;

document.addEventListener("DOMContentLoaded",()=>{
 const s=session(); if(!s||s.role!=="student")return;
 document.getElementById("sideName").textContent=s.name;document.getElementById("headerName").textContent=s.name;
 document.getElementById("welcomeName").textContent=s.name.split(" ")[0];
 ["sideAvatar","headerAvatar","profileAvatar"].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=s.name.charAt(0).toUpperCase()});
 document.getElementById("profileName").textContent=s.name;document.getElementById("profileEmail").textContent=s.email;document.getElementById("profileDepartment").textContent=s.department||"CSE";document.getElementById("welcomeDepartment").textContent=s.department||"CSE";
 renderDashboard();renderResults();
});
function renderDashboard(){
 const data=db(), s=session(), dept=s.department||"CSE", published=data.exams.filter(e=>e.published&&(e.department==="ALL"||e.department===dept)), mine=data.results.filter(r=>r.userId===s.id);
 document.getElementById("availableCount").textContent=published.length;
 document.getElementById("completedCount").textContent=mine.length;
 document.getElementById("attemptedCount").textContent=mine.length;
 document.getElementById("averageScore").textContent=mine.length?Math.round(mine.reduce((a,r)=>a+r.percentage,0)/mine.length)+"%":"0%";
 document.getElementById("dashboardExams").innerHTML=published.slice(0,3).map(examCard).join("");
 document.getElementById("allExams").innerHTML=published.map(examCard).join("");
}
function examCard(e){
 const attempted=db().results.some(r=>r.userId===session().id&&r.examId===e.id);
 return `<article class="exam-card"><div class="exam-card-top"><div class="exam-card-icon">▣</div><span class="status-badge ${attempted?"pass":"live"}">${attempted?"COMPLETED":"AVAILABLE"}</span></div><h3>${escapeHtml(e.title)}</h3><p>${escapeHtml(e.subject)} • ${escapeHtml(e.department==="ALL"?"All Departments":e.department)}</p><div class="exam-meta"><span class="meta">◷ ${e.duration} min</span><span class="meta">▦ ${e.questions.length} questions</span><span class="meta">★ ${totalMarks(e)} marks</span></div>${attempted?'<button class="btn btn-secondary" disabled>Exam Already Attempted</button>':`<button class="btn btn-primary" onclick="startExam('${e.id}')">Start Exam →</button>`}</article>`
}
function totalMarks(e){return e.questions.reduce((a,q)=>a+Number(q.marks||1),0)}
function startExam(id){
 const data=db(), e=data.exams.find(x=>x.id===id), s=session();if(!e)return;
 if(!e.published){toast("This exam is not published.","error");return}
 if(e.department!=="ALL"&&e.department!==(s.department||"CSE")){toast("This exam is not assigned to your department.","error");return}
 if(data.results.some(r=>r.userId===s.id&&r.examId===e.id)){toast("You have already completed this exam. Each exam can be attempted only once.","error");renderDashboard();return}
 currentExam=e;currentQuestion=0;answers=new Array(e.questions.length).fill(null);secondsLeft=e.duration*60;
 switchStudentSection("exam");document.getElementById("examTitle").textContent=e.title;document.getElementById("examSubject").textContent=e.subject.toUpperCase();
 renderQuestion();renderPalette();startTimer();
}
function startTimer(){
 clearInterval(timerId);updateTimer();
 timerId=setInterval(()=>{secondsLeft--;updateTimer();if(secondsLeft<=0){clearInterval(timerId);finishExam(true)}},1000);
}
function updateTimer(){
 const el=document.getElementById("examTimer");if(!el)return;const m=Math.floor(secondsLeft/60).toString().padStart(2,"0"),s=(secondsLeft%60).toString().padStart(2,"0");el.textContent=`${m}:${s}`;el.classList.toggle("warning",secondsLeft<=300&&secondsLeft>60);el.classList.toggle("danger",secondsLeft<=60);
}
function renderQuestion(){
 const q=currentExam.questions[currentQuestion], chosen=answers[currentQuestion];
 document.getElementById("questionNumber").textContent=`Question ${currentQuestion+1} of ${currentExam.questions.length}`;
 document.getElementById("questionMarks").textContent=`${q.marks||1} mark${q.marks==1?"":"s"}`;
 document.getElementById("questionText").textContent=q.text;
 document.getElementById("options").innerHTML=q.options.map((o,i)=>`<label class="option ${chosen===i?"selected":""}"><input type="radio" name="answer" value="${i}" ${chosen===i?"checked":""}>${escapeHtml(o)}</label>`).join("");
 document.querySelectorAll(".option").forEach((el,i)=>el.addEventListener("click",()=>{answers[currentQuestion]=i;renderQuestion();renderPalette()}));
 document.getElementById("prevQuestion").disabled=currentQuestion===0;
 document.getElementById("nextQuestion").textContent=currentQuestion===currentExam.questions.length-1?"Review →":"Next →";
}
function renderPalette(){
 document.getElementById("palette").innerHTML=currentExam.questions.map((q,i)=>`<button class="${i===currentQuestion?"current ":""}${answers[i]!==null?"answered":""}" onclick="jumpQuestion(${i})">${i+1}</button>`).join("");
}
function jumpQuestion(i){currentQuestion=i;renderQuestion();renderPalette()}
document.getElementById("prevQuestion")?.addEventListener("click",()=>{if(currentQuestion>0){currentQuestion--;renderQuestion();renderPalette()}});
document.getElementById("nextQuestion")?.addEventListener("click",()=>{if(currentQuestion<currentExam.questions.length-1){currentQuestion++;renderQuestion();renderPalette()}else{confirmSubmit()}});
document.getElementById("submitExam")?.addEventListener("click",confirmSubmit);
function confirmSubmit(){
 const unanswered=answers.filter(a=>a===null).length;
 const msg=unanswered?`You have ${unanswered} unanswered question(s). Submit anyway?`:"Submit your exam now?";
 if(confirm(msg))finishExam(false);
}
function finishExam(auto=false){
 if(!currentExam)return;
 const s=session(), dataCheck=db();
 if(dataCheck.results.some(r=>r.userId===s.id&&r.examId===currentExam.id)){clearInterval(timerId);toast("This exam has already been submitted.","error");location.href="student.html";return}
 clearInterval(timerId);
 let correct=0,marks=0,total=totalMarks(currentExam);
 currentExam.questions.forEach((q,i)=>{marks+=answers[i]===q.answer?Number(q.marks||1):0;if(answers[i]===q.answer)correct++});
 const percentage=total?Math.round(marks/total*100):0;
 const result={id:"r"+Date.now(),userId:s.id,userName:s.name,examId:currentExam.id,examTitle:currentExam.title,date:new Date().toISOString(),correct,wrong:answers.filter((a,i)=>a!==null&&a!==currentExam.questions[i].answer).length,unanswered:answers.filter(a=>a===null).length,score:marks,total,percentage,passed:percentage>=currentExam.passing,auto};
 const data=db();data.results.push(result);saveDB(data);localStorage.setItem("examify_last_result",JSON.stringify(result));location.href="result.html";
}
function renderResults(){
 const s=session(), rows=db().results.filter(r=>r.userId===s.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
 const el=document.getElementById("resultTable");if(!el)return;
 el.innerHTML=rows.length?rows.map(r=>`<tr><td><b>${escapeHtml(r.examTitle)}</b></td><td>${formatDate(r.date)}</td><td>${r.score}/${r.total}</td><td><b>${r.percentage}%</b></td><td><span class="status-badge ${r.passed?"pass":"fail"}">${r.passed?"PASSED":"FAILED"}</span></td></tr>`).join(""):`<tr><td colspan="5" style="text-align:center;padding:35px;color:#94a3b8">No exam attempts yet.</td></tr>`;
}
function formatDate(d){return new Date(d).toLocaleDateString(undefined,{day:"2-digit",month:"short",year:"numeric"})}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
