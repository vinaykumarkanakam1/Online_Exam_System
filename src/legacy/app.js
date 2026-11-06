const DB_KEY="examify_db_v2", SESSION_KEY="examify_session_v1";
const DEPARTMENTS=["CSE","ECE","EEE","Mechanical","Civil","IT"];

const seed={
  users:[
    {id:"u1",name:"Demo Student",email:"student@example.com",password:"student123",role:"student",department:"CSE"},
    {id:"a1",name:"Administrator",email:"admin@example.com",password:"admin123",role:"admin"}
  ],
  exams:[
    {id:"e1",title:"Web Development Fundamentals",subject:"Computer Science",department:"CSE",duration:30,passing:40,published:true,
     questions:[
      {id:"q1",text:"Which language is used to structure web pages?",options:["CSS","HTML","SQL","Python"],answer:1,marks:2},
      {id:"q2",text:"Which CSS property changes text color?",options:["font-style","background","color","text-align"],answer:2,marks:2},
      {id:"q3",text:"Which keyword declares a block-scoped variable in JavaScript?",options:["var","let","define","dim"],answer:1,marks:2},
      {id:"q4",text:"What does DOM stand for?",options:["Document Object Model","Data Object Method","Digital Ordinance Map","Document Order Mode"],answer:0,marks:2},
      {id:"q5",text:"Which HTML element creates a hyperlink?",options:["<link>","<a>","<href>","<url>"],answer:1,marks:2},
      {id:"q6",text:"Which symbol starts an ID selector in CSS?",options:[".","#","@","$"],answer:1,marks:2},
      {id:"q7",text:"Which method converts JSON text into a JavaScript object?",options:["JSON.parse()","JSON.object()","JSON.decode()","JSON.read()"],answer:0,marks:2},
      {id:"q8",text:"Which HTTP method is commonly used to retrieve data?",options:["POST","PUT","GET","PATCH"],answer:2,marks:2}
     ]},
    {id:"e2",title:"JavaScript Essentials",subject:"Programming",department:"CSE",duration:20,passing:40,published:true,
     questions:[
      {id:"j1",text:"Which value represents an empty intentional value?",options:["null","empty","voided","zero"],answer:0,marks:2},
      {id:"j2",text:"Which array method adds an item to the end?",options:["shift()","push()","pop()","join()"],answer:1,marks:2},
      {id:"j3",text:"What is typeof []?",options:["array","list","object","collection"],answer:2,marks:2},
      {id:"j4",text:"Which operator checks strict equality?",options:["=","==","===","!="],answer:2,marks:2},
      {id:"j5",text:"Which keyword creates a constant binding?",options:["constant","fixed","const","static"],answer:2,marks:2}
     ]}
  ],
  results:[]
};

function db(){
  let data=JSON.parse(localStorage.getItem(DB_KEY)||"null");
  if(!data){
    const old=JSON.parse(localStorage.getItem("examify_db_v1")||"null");
    data=old||JSON.parse(JSON.stringify(seed));
    data.users=(data.users||[]).map(u=>u.role==="student"?({...u,department:u.department||"CSE"}):u);
    data.exams=(data.exams||[]).map(e=>({...e,department:e.department||"CSE"}));
    data.results=data.results||[];
    localStorage.setItem(DB_KEY,JSON.stringify(data));
  }
  return data;
}
function saveDB(data){localStorage.setItem(DB_KEY,JSON.stringify(data))}
function session(){return JSON.parse(localStorage.getItem(SESSION_KEY)||"null")}
function setSession(user){localStorage.setItem(SESSION_KEY,JSON.stringify({id:user.id,name:user.name,email:user.email,role:user.role,department:user.department||"CSE"}))}
function logout(){localStorage.removeItem(SESSION_KEY);location.href="index.html"}
function toast(msg,type="success"){const box=document.getElementById("toast");if(!box)return;const el=document.createElement("div");el.className="toast "+type;el.textContent=msg;box.appendChild(el);setTimeout(()=>el.remove(),3000)}
function openModal(id){document.getElementById(id)?.classList.add("show")}
function closeModal(id){document.getElementById(id)?.classList.remove("show")}

document.addEventListener("DOMContentLoaded",()=>{
  db();
  const menu=document.getElementById("menuToggle"), nav=document.getElementById("mainNav");
  menu?.addEventListener("click",()=>nav.classList.toggle("open"));
  document.querySelectorAll("[data-open-login]").forEach(b=>b.addEventListener("click",()=>{openModal("loginModal");setLoginRole(b.dataset.openLogin)}));
  document.querySelectorAll("[data-open-register]").forEach(b=>b.addEventListener("click",()=>openModal("registerModal")));
  document.querySelectorAll("[data-close-modal]").forEach(b=>b.addEventListener("click",()=>b.closest(".modal-backdrop").classList.remove("show")));
  document.querySelectorAll(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.remove("show")}));
  document.getElementById("loginForm")?.addEventListener("submit",handleLogin);
  document.getElementById("registerForm")?.addEventListener("submit",handleRegister);
  document.getElementById("logoutBtn")?.addEventListener("click",logout);
  document.getElementById("sideToggle")?.addEventListener("click",()=>document.getElementById("sidebar")?.classList.toggle("open"));
  setupSectionLinks();
  protectPage();
});
function setLoginRole(role){
  const title=document.getElementById("loginTitle"), sub=document.getElementById("loginSubtitle"), note=document.getElementById("demoNote"), hidden=document.getElementById("loginRole");
  if(!title)return; hidden.value=role;
  if(role==="admin"){title.textContent="Admin Login";sub.textContent="Access the examination control center.";note.innerHTML='Demo admin: <b>admin@example.com</b> / <b>admin123</b>'}
  else{title.textContent="Student Login";sub.textContent="Access your examination dashboard.";note.innerHTML='Demo student: <b>student@example.com</b> / <b>student123</b>'}
}
function handleLogin(e){
  e.preventDefault();
  const email=document.getElementById("loginEmail").value.trim().toLowerCase(), password=document.getElementById("loginPassword").value, role=document.getElementById("loginRole").value;
  const user=db().users.find(u=>u.email===email&&u.password===password&&u.role===role);
  if(!user){toast("Invalid credentials or role.","error");return}
  setSession(user);location.href=role==="admin"?"admin.html":"student.html";
}

function handleRegister(e){
  e.preventDefault();
  const name=document.getElementById("registerName").value.trim();
  const email=document.getElementById("registerEmail").value.trim().toLowerCase();
  const password=document.getElementById("registerPassword").value;
  const department=document.getElementById("registerDepartment").value;
  const data=db();
  if(data.users.some(u=>u.email===email)){toast("An account with this email already exists.","error");return}
  const user={id:"u"+Date.now(),name,email,password,role:"student",department};
  data.users.push(user);saveDB(data);setSession(user);toast("Registration successful. Welcome to Examify!");
  setTimeout(()=>location.href="student.html",400);
}

function protectPage(){
  const s=session(), page=location.pathname.split("/").pop();
  if((page==="student.html"||page==="result.html")&&(!s||s.role!=="student"))location.href="index.html";
  if(page==="admin.html"&&(!s||s.role!=="admin"))location.href="index.html";
}
function setupSectionLinks(){
  document.querySelectorAll("[data-section]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();switchStudentSection(a.dataset.section)}));
  document.querySelectorAll("[data-admin-section]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();switchAdminSection(a.dataset.adminSection)}));
  document.querySelectorAll("[data-goto]").forEach(a=>a.addEventListener("click",()=>switchStudentSection(a.dataset.goto)));
}
function switchStudentSection(name){
  const map={dashboard:"dashboardSection",exams:"examsSection",history:"historySection",profile:"profileSection",exam:"examSection"};
  document.querySelectorAll("#dashboardSection,#examsSection,#historySection,#profileSection,#examSection").forEach(x=>x.classList.remove("active"));
  document.getElementById(map[name])?.classList.add("active");
  document.querySelectorAll("[data-section]").forEach(x=>x.classList.toggle("active",x.dataset.section===name));
  const title={dashboard:"Dashboard",exams:"Available Exams",history:"My Results",profile:"Profile",exam:"Exam"}[name];
  document.getElementById("pageTitle")&&(document.getElementById("pageTitle").textContent=title);
  window.scrollTo({top:0,behavior:"smooth"});
}
function switchAdminSection(name){
  const map={overview:"adminOverview",exams:"adminExams",students:"adminStudents",results:"adminResults"};
  document.querySelectorAll("#adminOverview,#adminExams,#adminStudents,#adminResults").forEach(x=>x.classList.remove("active"));
  document.getElementById(map[name])?.classList.add("active");
  document.querySelectorAll("[data-admin-section]").forEach(x=>x.classList.toggle("active",x.dataset.adminSection===name));
  const title={overview:"Overview",exams:"Manage Exams",students:"Students",results:"Results"}[name];
  document.getElementById("adminPageTitle")&&(document.getElementById("adminPageTitle").textContent=title);
}
