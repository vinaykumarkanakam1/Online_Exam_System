document.addEventListener("DOMContentLoaded",()=>{
 const r=JSON.parse(localStorage.getItem("examify_last_result")||"null");if(!r){location.href="student.html";return}
 document.getElementById("resultTitle").textContent=r.passed?"Congratulations!":"Keep Practicing!";
 document.getElementById("resultSubtitle").textContent=r.passed?"You passed the examination successfully.":"You completed the exam. Review your answers and try again.";
 document.getElementById("resultPercentage").textContent=r.percentage+"%";
 document.getElementById("resultCorrect").textContent=r.correct;
 document.getElementById("resultWrong").textContent=r.wrong;
 document.getElementById("resultUnanswered").textContent=r.unanswered;
 document.getElementById("resultTotal").textContent=r.total;
 if(!r.passed){document.getElementById("resultIcon").classList.add("fail");document.getElementById("resultIcon").textContent="!"}
});
