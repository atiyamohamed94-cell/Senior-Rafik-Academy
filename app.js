const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const storeKey = "senior-rafik-academy-v1";
const seed = {
  students: [
    {id:1,name:"مريم أحمد",email:"maryam@example.com",level:"A2",score:88,status:"نشط"},
    {id:2,name:"عمر خالد",email:"omar@example.com",level:"A1",score:76,status:"نشط"},
    {id:3,name:"سلمى محمد",email:"salma@example.com",level:"A2",score:94,status:"نشط"},
    {id:4,name:"يوسف علي",email:"youssef@example.com",level:"A1",score:61,status:"محتاج متابعة"}
  ],
  lessons:[
    {id:101,title:"التحيات والتعارف",level:"A1",type:"فيديو + ملخص",description:"اتعلم تقول مرحبًا وتعرّف نفسك بالإيطالي: Ciao, mi chiamo…",published:true},
    {id:102,title:"أدوات التعريف في الإيطالي",level:"A1",type:"ملف PDF",description:"شرح مبسط لـ il, lo, la, l’ مع أمثلة وتدريبات.",published:true},
    {id:103,title:"الأفعال في المضارع",level:"A2",type:"درس تفاعلي",description:"تصريف الأفعال المنتظمة مع أمثلة من الحياة اليومية.",published:true}
  ],
  assignments:[
    {id:201,title:"واجب التحيات",due:"2026-11-01",level:"A1",description:"اكتب خمس جمل للتعريف بنفسك بالإيطالي.",status:"مفتوح"},
    {id:202,title:"تدريب أدوات التعريف",due:"2026-11-04",level:"A1",description:"حل التدريبات المرفقة في الدرس.",status:"مفتوح"}
  ],
  announcements:[{id:301,title:"أهلاً بيكم في الأكاديمية",body:"راجعوا الدروس الجديدة، وجهّزوا نفسكم للاختبار القادم. In bocca al lupo!",date:"اليوم"}],
  quizzes:[{id:401,title:"اختبار التحيات",level:"A1",questions:[{q:"إيه معنى Ciao؟",options:["مرحبًا / باي","شكرًا","من فضلك"],answer:0},{q:"إزاي تقول اسمي أحمد؟",options:["Sono fame","Mi chiamo Ahmed","Buona notte"],answer:1},{q:"إيه الرد الشائع على Come stai؟",options:["Mi chiamo","Bene, grazie","Arrivederci"],answer:1}]}],
  results:[], submissions:[], points:120
};
let db = loadData();
let currentRole = "teacher";
let currentPage = "overview";
let searchTerm = "";
let toastTimer;
function loadData(){try{const v=localStorage.getItem(storeKey);return v?JSON.parse(v):structuredClone(seed)}catch(e){return JSON.parse(JSON.stringify(seed))}}
function saveData(){localStorage.setItem(storeKey,JSON.stringify(db))}
function nextId(){return Date.now()+Math.floor(Math.random()*1000)}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function initials(n="SR"){return n.trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("")}
function showToast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2600)}
function dateLabel(){return new Intl.DateTimeFormat("ar-EG",{weekday:"long",day:"numeric",month:"long"}).format(new Date())}
$("#todayLabel").textContent=dateLabel();
const teacherNav=[["overview","▦","نظرة عامة"],["students","♙","إدارة الطلاب"],["lessons","▤","الدروس والملفات"],["assignments","✎","الواجبات"],["quizzes","✓","الامتحانات التفاعلية"],["grades","▥","الدرجات والمستوى"],["announcements","◉","الإعلانات"],["competitions","♜","المسابقات والمكافآت"]];
const studentNav=[["studentHome","⌂","الرئيسية"],["studentLessons","▤","دروسي"],["studentAssignments","✎","واجباتي"],["studentQuizzes","✓","الامتحانات"],["studentProgress","▥","مستواي"],["studentAnnouncements","◉","الإعلانات"]];
function renderNav(){
 const nav=currentRole==="teacher"?teacherNav:studentNav;
 $("#navigation").innerHTML='<p class="nav-label">القائمة الرئيسية</p>'+nav.map(([id,icon,label])=>`<button class="nav-link ${currentPage===id?'active':''}" data-page="${id}"><span class="nav-icon">${icon}</span><span>${label}</span></button>`).join("");
 $$(".nav-link").forEach(b=>b.addEventListener("click",()=>{currentPage=b.dataset.page;searchTerm="";render();closeMenu()}));
}
function stat(icon,label,value,note){return `<article class="stat-card"><div class="stat-top"><span class="stat-label">${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></article>`}
function heading(title,sub="",action=""){return `<div class="section-heading"><div><h2>${title}</h2>${sub?`<p>${sub}</p>`:""}</div>${action}</div>`}
function welcome(title,desc,italian="") {return `<section class="welcome"><div><h2>${title}</h2><p>${desc}</p>${italian?`<div class="italian">${italian}</div>`:""}</div><div class="welcome-art">🇮🇹</div></section>`}
function panel(title,body,extra=""){return `<section class="panel"><div class="panel-head"><h3>${title}</h3>${extra}</div>${body}</section>`}
function activity(icon,title,desc,time=""){return `<div class="activity"><div class="activity-icon">${icon}</div><div><strong>${title}</strong><p>${desc}</p></div>${time?`<time>${time}</time>`:""}</div>`}
function empty(title,desc){return `<div class="empty-state"><b>${title}</b>${desc}</div>`}
function teacherOverview(){
 const pending=db.submissions.filter(s=>s.status!=="تم التصحيح").length;
 return welcome("أهلاً يا سنيور رفيق 👋","كل اللي يخص أكاديمية الإيطالي في مكان واحد.","La lingua italiana apre nuove porte.").concat(
 `<div class="stats-grid" style="margin-top:18px">${stat("♙","إجمالي الطلاب",db.students.length,"طلاب مسجلون في النسخة التجريبية")}${stat("▤","الدروس المنشورة",db.lessons.filter(x=>x.published).length,"دروس متاحة للطلاب")}${stat("✎","واجبات مفتوحة",db.assignments.length+pending,"تحتاج متابعة")}${stat("✓","الاختبارات",db.quizzes.length,"اختبارات تفاعلية")}</div>`,
 `<div class="dashboard-grid">${panel("آخر النشاطات",`<div class="activity-list">${activity("▤","تم تجهيز دروس الإيطالي",`${db.lessons.length} دروس في مكتبة المحتوى`,"الآن")}${activity("✎","متابعة الواجبات",`${db.assignments.length} واجبات متاحة للطلاب`,"اليوم")}${activity("♙","قائمة الطلاب",`${db.students.length} طلاب في بيانات العرض التجريبي`,"اليوم")}</div>`,"<span>نظرة سريعة</span>")}${panel("مستوى الطلاب","<p style='font-size:11px;color:var(--muted);margin:0 0 16px'>متوسط الدرجات في بيانات العرض التجريبي</p>"+db.students.map(s=>`<div class="progress-row"><div class="progress-label"><span>${esc(s.name)}</span><span>${s.score}%</span></div><div class="progress"><span style="width:${s.score}%"></span></div></div>`).join(""))}</div>`,
 `<div class="notice" style="margin-top:17px">تنبيه: حالة الأونلاين الحقيقية وتسجيل الدخول والخروج مش مفعّلين في النسخة المحلية. هنحتاج قاعدة بيانات وتسجيل دخول آمن عشان نعرضهم بشكل صحيح.</div>`,
 heading("إجراءات سريعة","ابدأ بإدارة محتوى الأكاديمية")+
 `<div class="cards-grid">${quickCard("♙","إضافة طالب","سجّل طالبًا في بيانات العرض.","addStudent")}${quickCard("▤","إضافة درس","جهّز درسًا جديدًا في الإيطالي.","addLesson")}${quickCard("✎","إضافة واجب","حدّد المطلوب وموعد التسليم.","addAssignment")}</div>`
 );
}
function quickCard(icon,title,desc,action){return `<article class="data-card"><div class="card-icon">${icon}</div><h3>${title}</h3><p>${desc}</p><button class="btn btn-light" data-action="${action}">ابدأ الآن ←</button></article>`}
function studentsPage(){
 let list=db.students.filter(s=>(s.name+" "+s.email+" "+s.level).toLowerCase().includes(searchTerm.toLowerCase()));
 return heading("إدارة الطلاب","عرض وتحديث بيانات الطلاب",'<button class="btn btn-primary" data-action="addStudent">＋ إضافة طالب</button>')+`<div class="toolbar" style="margin-bottom:13px"><input class="search" id="searchInput" placeholder="ابحث باسم الطالب أو البريد أو المستوى..." value="${esc(searchTerm)}"></div>`+
 `<div class="table-wrap"><table><thead><tr><th>الطالب</th><th>المستوى</th><th>متوسط الدرجات</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>${list.map(s=>`<tr><td><div class="person"><span class="person-avatar">${esc(initials(s.name))}</span><span><strong>${esc(s.name)}</strong><small>${esc(s.email)}</small></span></div></td><td>${esc(s.level)}</td><td>${s.score}%</td><td><span class="tag ${s.status==="نشط"?"":"pending"}">${esc(s.status)}</span></td><td><div class="table-actions"><button class="small-btn" data-action="editStudent" data-id="${s.id}">تعديل</button><button class="small-btn" data-action="deleteStudent" data-id="${s.id}">حذف</button></div></td></tr>`).join("")||`<tr><td colspan="5">${empty("مفيش نتائج","جرّب كلمة بحث مختلفة.")}</td></tr>`}</tbody></table></div>`;
}
function lessonsPage(student=false){
 let list=db.lessons.filter(l=>(!student||l.published)&& (l.title+" "+l.level+" "+l.description).toLowerCase().includes(searchTerm.toLowerCase()));
 return (student?welcome("دروسك في الإيطالي","اختار الدرس اللي تحب تراجعه وامشِ خطوة بخطوة.","Andiamo!"):heading("الدروس والملفات","أنشئ الدروس ونظّم المحتوى للطلاب",'<button class="btn btn-primary" data-action="addLesson">＋ إضافة درس</button>'))+
 (student?heading("مكتبة الدروس","المحتوى المتاح لك"): `<div class="toolbar" style="margin:15px 0"><input class="search" id="searchInput" placeholder="ابحث عن درس..." value="${esc(searchTerm)}"></div>`)+
 `<div class="cards-grid">${list.map(l=>`<article class="data-card"><div class="card-icon">📘</div><span class="tag">${esc(l.level)}</span><h3 style="margin-top:10px">${esc(l.title)}</h3><p>${esc(l.description)}</p><div class="card-meta">${esc(l.type)} · ${l.published?"منشور":"مسودة"}</div><div class="card-actions">${student?`<button class="btn btn-primary" data-action="openLesson" data-id="${l.id}">افتح الدرس</button>`:`<button class="btn btn-light" data-action="editLesson" data-id="${l.id}">تعديل</button><button class="btn btn-light" data-action="toggleLesson" data-id="${l.id}">${l.published?"إخفاء":"نشر"}</button><button class="btn btn-danger" data-action="deleteLesson" data-id="${l.id}">حذف</button>`}</div></article>`).join("")||empty("لسه مفيش دروس","لما تضيف درس هيظهر هنا.")}</div>`;
}
function assignmentsPage(student=false){
 let list=db.assignments.filter(a=>(!student||a.status==="مفتوح")&&(a.title+" "+a.description).toLowerCase().includes(searchTerm.toLowerCase()));
 return heading(student?"واجباتي":"إدارة الواجبات",student?"الواجبات المطلوبة منك ومواعيد التسليم":"أنشئ الواجبات وتابع حالتها",student?"":'<button class="btn btn-primary" data-action="addAssignment">＋ إضافة واجب</button>')+
 `<div class="cards-grid">${list.map(a=>`<article class="data-card"><div class="card-icon">📝</div><span class="tag ${a.status==="مفتوح"?"pending":""}">${esc(a.status)}</span><h3 style="margin-top:10px">${esc(a.title)}</h3><p>${esc(a.description)}</p><div class="card-meta">المستوى ${esc(a.level)} · التسليم: ${esc(a.due||"غير محدد")}</div><div class="card-actions">${student?`<button class="btn btn-primary" data-action="submitAssignment" data-id="${a.id}">تسليم الواجب</button>`:`<button class="btn btn-light" data-action="editAssignment" data-id="${a.id}">تعديل</button><button class="btn btn-danger" data-action="deleteAssignment" data-id="${a.id}">حذف</button>`}</div></article>`).join("")||empty("مفيش واجبات حاليًا","أي واجب جديد هيظهر هنا.")}</div>`;
}
function quizzesPage(student=false){
 return heading(student?"الامتحانات التفاعلية":"إدارة الامتحانات",student?"اختبر نفسك وشوف نتيجتك":"أنشئ اختبارات قصيرة لتقييم فهم الطلاب",student?"":'<button class="btn btn-primary" data-action="addQuiz">＋ إنشاء اختبار</button>')+
 `<div class="cards-grid">${db.quizzes.map(q=>`<article class="data-card"><div class="card-icon">🧠</div><span class="tag">${esc(q.level)}</span><h3 style="margin-top:10px">${esc(q.title)}</h3><p>اختبار قصير من ${q.questions.length} أسئلة اختيار من متعدد.</p><div class="card-meta">${student?"جاهز للحل":"اختبار تفاعلي"}</div><div class="card-actions">${student?`<button class="btn btn-primary" data-action="takeQuiz" data-id="${q.id}">ابدأ الاختبار</button>`:`<button class="btn btn-light" data-action="editQuiz" data-id="${q.id}">تعديل</button><button class="btn btn-danger" data-action="deleteQuiz" data-id="${q.id}">حذف</button>`}</div></article>`).join("")||empty("مفيش امتحانات","أنشئ أول اختبار تفاعلي.")}</div>`;
}
function gradesPage(student=false){
 const results=db.results;
 if(student) return welcome("مستواك بيتقدم خطوة بخطوة","راجع نتائج اختباراتك وحافظ على الاستمرارية.","Ogni passo conta!")+`<div class="stats-grid" style="margin-top:18px">${stat("★","نقاطك",db.points,"نقاط العرض التجريبي")}${stat("✓","اختبارات مكتملة",results.length,"محاولات محفوظة على هذا الجهاز")}${stat("▥","متوسط نتيجتك",results.length?Math.round(results.reduce((n,r)=>n+r.percent,0)/results.length)+"%":"—","يظهر بعد حل الاختبارات")}${stat("♙","شاراتك",db.points>=100?1:0,"مكافآت تجريبية")}</div>`+heading("سجل الاختبارات","نتائج الاختبارات اللي حليتها")+resultsTable(results);
 return heading("الدرجات والمستوى","ملخص درجات الطلاب ونتائج الاختبارات")+`<div class="stats-grid" style="margin-bottom:18px">${stat("♙","الطلاب",db.students.length,"في بيانات العرض")}${stat("★","متوسط درجات الطلاب",db.students.length?Math.round(db.students.reduce((n,s)=>n+s.score,0)/db.students.length)+"%":"—","متوسط توضيحي")}${stat("✓","محاولات الاختبارات",results.length,"على هذا الجهاز")}${stat("✎","تسليمات الواجبات",db.submissions.length,"تسليمات تجريبية")}</div>`+`<div class="table-wrap"><table><thead><tr><th>الطالب</th><th>المستوى</th><th>الدرجة</th><th>مؤشر المستوى</th></tr></thead><tbody>${db.students.map(s=>`<tr><td>${esc(s.name)}</td><td>${esc(s.level)}</td><td>${s.score}%</td><td><div class="progress" style="min-width:100px"><span style="width:${s.score}%"></span></div></td></tr>`).join("")}</tbody></table></div>`+heading("نتائج الاختبارات","النتائج المحفوظة في المتصفح")+resultsTable(results);
}
function resultsTable(results){return `<div class="table-wrap"><table><thead><tr><th>الاختبار</th><th>النتيجة</th><th>التاريخ</th></tr></thead><tbody>${results.map(r=>`<tr><td>${esc(r.title)}</td><td><span class="tag">${r.percent}%</span></td><td>${esc(r.date)}</td></tr>`).join("")||`<tr><td colspan="3">${empty("لسه مفيش نتائج","حل اختبار تفاعلي عشان تظهر النتيجة هنا.")}</td></tr>`}</tbody></table></div>`}
function announcementsPage(student=false){
 return heading(student?"إعلانات الأكاديمية":"إدارة الإعلانات",student?"آخر الأخبار والتنبيهات":"انشر أخبار الأكاديمية للطلاب",student?"":'<button class="btn btn-primary" data-action="addAnnouncement">＋ إعلان جديد</button>')+
 `<div style="max-width:850px">${db.announcements.map(a=>`<article class="announcement" style="background:white;margin-bottom:12px;padding:18px"><div style="display:flex;justify-content:space-between;gap:10px"><strong>${esc(a.title)}</strong><span class="tag">${esc(a.date||"حديثًا")}</span></div><p>${esc(a.body)}</p>${student?"":`<div style="margin-top:12px"><button class="small-btn" data-action="editAnnouncement" data-id="${a.id}">تعديل</button> <button class="small-btn" data-action="deleteAnnouncement" data-id="${a.id}">حذف</button></div>`}</article>`).join("")||empty("مفيش إعلانات","الإعلانات الجديدة هتظهر هنا.")}</div>`;
}
function competitionsPage(){
 return welcome("التعلّم ممكن يبقى لعبة ممتعة 🏆","شجّع الطلاب بالنقاط والتحديات الأسبوعية.","Studia, gioca, vinci!")+heading("لوحة المكافآت","نظام نقاط تجريبي للعرض")+`<div class="cards-grid">${quickCard("⭐","نجم الأسبوع","كافئ الطالب الأكثر التزامًا.","rewardStudent")}${quickCard("🏁","تحدي المفردات","مسابقة كلمات إيطالية بين الطلاب.","createCompetition")}${quickCard("🎖️","شارة الاجتهاد","شجّع الاستمرارية وحل الواجبات.","rewardStudent")}</div><div class="notice" style="margin-top:17px">النقاط والمكافآت هنا نموذج أولي محفوظ محليًا. عند ربط قاعدة بيانات حقيقية، نقدر نخلي ترتيب الطلاب متزامنًا وآمنًا لكل المستخدمين.</div>`;
}
function studentHome(){
 return welcome("Ciao! أهلاً بيك في الأكاديمية 👋","كمّل دروسك، حل واجباتك، وخلّي مستواك في الإيطالي يتحسن كل يوم.","Un piccolo passo ogni giorno!")+`<div class="student-hero" style="margin-top:17px"><div><h2>أنت قادر تتقدم 💪</h2><p>راجع الدروس الجديدة وابدأ بالمهام اللي موعدها أقرب.</p></div><div class="points-bubble"><b>${db.points}</b><small>نقطة تجريبية ⭐</small></div></div><div class="stats-grid" style="margin-top:17px">${stat("📘","الدروس المتاحة",db.lessons.filter(l=>l.published).length,"دروس منشورة")}${stat("📝","الواجبات المفتوحة",db.assignments.length,"راجع مواعيد التسليم")}${stat("🧠","الامتحانات",db.quizzes.length,"اختبر مستواك")}${stat("🏅","نتائجك",db.results.length,"اختبارات تم حلها")}</div><div class="dashboard-grid">${panel("ابدأ من هنا",`<div class="activity-list">${activity("📘","راجع دروسك", "كمّل الدرس اللي فاتك.")}${activity("📝","حل الواجب", "ما تنساش موعد التسليم.")}${activity("🧠","جرّب اختبار", "اختبر معلوماتك بطريقة تفاعلية.")}</div>`)}${panel("آخر الإعلانات",db.announcements.slice(0,3).map(a=>`<div class="announcement"><strong>${esc(a.title)}</strong><p>${esc(a.body)}</p></div>`).join("")||empty("مفيش إعلانات","تابعنا قريبًا.") )}</div>`;
}
function render(){
 renderNav();
 const titles={overview:"لوحة التحكم",students:"إدارة الطلاب",lessons:"الدروس والملفات",assignments:"الواجبات",quizzes:"الامتحانات التفاعلية",grades:"الدرجات والمستوى",announcements:"الإعلانات",competitions:"المسابقات والمكافآت",studentHome:"الرئيسية",studentLessons:"دروسي",studentAssignments:"واجباتي",studentQuizzes:"الامتحانات",studentProgress:"مستواي",studentAnnouncements:"الإعلانات"};
 $("#pageTitle").textContent=titles[currentPage]||"أكاديمية الإيطالي";
 const views={overview:teacherOverview,students:studentsPage,lessons:()=>lessonsPage(false),assignments:()=>assignmentsPage(false),quizzes:()=>quizzesPage(false),grades:()=>gradesPage(false),announcements:()=>announcementsPage(false),competitions:competitionsPage,studentHome:studentHome,studentLessons:()=>lessonsPage(true),studentAssignments:()=>assignmentsPage(true),studentQuizzes:()=>quizzesPage(true),studentProgress:()=>gradesPage(true),studentAnnouncements:()=>announcementsPage(true)};
 $("#appContent").innerHTML=(views[currentPage]||teacherOverview)();
 const search=$("#searchInput");if(search){search.addEventListener("input",e=>{searchTerm=e.target.value;const pos=e.target.selectionStart;render();const next=$("#searchInput");next.focus();next.setSelectionRange(pos,pos)})}
}
$("#roleSelect").addEventListener("change",e=>{currentRole=e.target.value;currentPage=currentRole==="teacher"?"overview":"studentHome";render();showToast(currentRole==="teacher"?"تم فتح عرض المدرس التجريبي":"تم فتح عرض الطالب التجريبي")});
function openForm(title,fields,onSave){
 $("#dialogTitle").textContent=title;$("#formFields").innerHTML=fields.map(f=>`<div class="field"><label for="f_${f.name}">${f.label}${f.required===false?"":" *"}</label>${f.type==="textarea"?`<textarea id="f_${f.name}" name="${f.name}" ${f.required===false?"":"required"} placeholder="${esc(f.placeholder||"")}">${esc(f.value||"")}</textarea>`:f.type==="select"?`<select id="f_${f.name}" name="${f.name}">${f.options.map(o=>`<option value="${esc(o.value)}" ${String(o.value)===String(f.value)?"selected":""}>${esc(o.label)}</option>`).join("")}</select>`:`<input id="f_${f.name}" name="${f.name}" type="${f.type||"text"}" value="${esc(f.value||"")}" placeholder="${esc(f.placeholder||"")}" ${f.required===false?"":"required"}>`}</div>`).join("");
 const dialog=$("#itemDialog");dialog.showModal();
 const form=$("#itemForm");form.onsubmit=e=>{e.preventDefault();const values=Object.fromEntries(new FormData(form).entries());if(onSave(values)){dialog.close();saveData();render();showToast("تم الحفظ بنجاح")}};
}
function closeMenu(){$(".sidebar").classList.remove("open");$(".mobile-backdrop").classList.remove("show")}
function action(name,id){
 const get=(arr)=>arr.find(x=>String(x.id)===String(id));
 if(name==="addStudent")openForm("إضافة طالب",[{name:"name",label:"اسم الطالب"},{name:"email",label:"البريد الإلكتروني",type:"email"},{name:"level",label:"المستوى",type:"select",options:[{value:"A1",label:"A1 - مبتدئ"},{value:"A2",label:"A2 - أساسي"},{value:"B1",label:"B1 - متوسط"}]},{name:"score",label:"درجة مبدئية",type:"number",value:"0"}],v=>{db.students.push({id:nextId(),name:v.name,email:v.email,level:v.level,score:Math.min(100,Math.max(0,Number(v.score)||0)),status:"نشط"});return true});
 if(name==="editStudent"){const s=get(db.students);if(!s)return;openForm("تعديل بيانات الطالب",[{name:"name",label:"اسم الطالب",value:s.name},{name:"email",label:"البريد الإلكتروني",type:"email",value:s.email},{name:"level",label:"المستوى",type:"select",value:s.level,options:[{value:"A1",label:"A1"},{value:"A2",label:"A2"},{value:"B1",label:"B1"}]},{name:"score",label:"الدرجة",type:"number",value:s.score},{name:"status",label:"الحالة",type:"select",value:s.status,options:[{value:"نشط",label:"نشط"},{value:"محتاج متابعة",label:"محتاج متابعة"}]}],v=>{Object.assign(s,{name:v.name,email:v.email,level:v.level,score:Math.min(100,Math.max(0,Number(v.score)||0)),status:v.status});return true})}
 if(name==="deleteStudent"&&confirm("متأكد إنك عايز تحذف الطالب؟")){db.students=db.students.filter(x=>String(x.id)!==String(id));saveData();render();showToast("تم حذف الطالب")}
 if(name==="addLesson"||name==="editLesson"){const l=name==="editLesson"?get(db.lessons):{};openForm(name==="editLesson"?"تعديل درس":"إضافة درس",[{name:"title",label:"عنوان الدرس",value:l.title||""},{name:"level",label:"المستوى",type:"select",value:l.level||"A1",options:[{value:"A1",label:"A1"},{value:"A2",label:"A2"},{value:"B1",label:"B1"}]},{name:"type",label:"نوع المحتوى",value:l.type||"شرح + ملف"},{name:"description",label:"وصف الدرس",type:"textarea",value:l.description||""}],v=>{if(l.id)Object.assign(l,v);else db.lessons.unshift({id:nextId(),...v,published:false});return true})}
 if(name==="toggleLesson"){const l=get(db.lessons);l.published=!l.published;saveData();render();showToast(l.published?"تم نشر الدرس":"تم إخفاء الدرس")}
 if(name==="deleteLesson"&&confirm("تحذف الدرس؟")){db.lessons=db.lessons.filter(x=>String(x.id)!==String(id));saveData();render();showToast("تم حذف الدرس")}
 if(name==="addAssignment"||name==="editAssignment"){const a=name==="editAssignment"?get(db.assignments):{};openForm(name==="editAssignment"?"تعديل واجب":"إضافة واجب",[{name:"title",label:"عنوان الواجب",value:a.title||""},{name:"due",label:"موعد التسليم",type:"date",value:a.due||""},{name:"level",label:"المستوى",type:"select",value:a.level||"A1",options:[{value:"A1",label:"A1"},{value:"A2",label:"A2"},{value:"B1",label:"B1"}]},{name:"description",label:"المطلوب من الطالب",type:"textarea",value:a.description||""}],v=>{if(a.id)Object.assign(a,v);else db.assignments.unshift({id:nextId(),...v,status:"مفتوح"});return true})}
 if(name==="deleteAssignment"&&confirm("تحذف الواجب؟")){db.assignments=db.assignments.filter(x=>String(x.id)!==String(id));saveData();render();showToast("تم حذف الواجب")}
 if(name==="addAnnouncement"||name==="editAnnouncement"){const a=name==="editAnnouncement"?get(db.announcements):{};openForm(name==="editAnnouncement"?"تعديل إعلان":"إعلان جديد",[{name:"title",label:"عنوان الإعلان",value:a.title||""},{name:"body",label:"نص الإعلان",type:"textarea",value:a.body||""}],v=>{if(a.id)Object.assign(a,v);else db.announcements.unshift({id:nextId(),...v,date:"اليوم"});return true})}
 if(name==="deleteAnnouncement"&&confirm("تحذف الإعلان؟")){db.announcements=db.announcements.filter(x=>String(x.id)!==String(id));saveData();render();showToast("تم حذف الإعلان")}
 if(name==="addQuiz"||name==="editQuiz"){const q=name==="editQuiz"?get(db.quizzes):{};openForm(name==="editQuiz"?"تعديل اختبار":"إنشاء اختبار",[{name:"title",label:"عنوان الاختبار",value:q.title||""},{name:"level",label:"المستوى",type:"select",value:q.level||"A1",options:[{value:"A1",label:"A1"},{value:"A2",label:"A2"},{value:"B1",label:"B1"}]},{name:"q1",label:"السؤال الأول",value:q.questions?.[0]?.q||"إيه معنى Grazie؟"},{name:"o1",label:"الاختيار الأول",value:q.questions?.[0]?.options?.[0]||"شكرًا"},{name:"o2",label:"الاختيار الثاني",value:q.questions?.[0]?.options?.[1]||"مرحبًا"},{name:"o3",label:"الاختيار الثالث",value:q.questions?.[0]?.options?.[2]||"إلى اللقاء"},{name:"correct",label:"رقم الإجابة الصحيحة",type:"select",value:String(q.questions?.[0]?.answer??0),options:[{value:"0",label:"الاختيار الأول"},{value:"1",label:"الاختيار الثاني"},{value:"2",label:"الاختيار الثالث"}]}],v=>{const item={q:v.q1,options:[v.o1,v.o2,v.o3],answer:Number(v.correct)};if(q.id)Object.assign(q,{title:v.title,level:v.level,questions:[item,...q.questions.slice(1)]});else db.quizzes.unshift({id:nextId(),title:v.title,level:v.level,questions:[item]});return true})}
 if(name==="deleteQuiz"&&confirm("تحذف الاختبار؟")){db.quizzes=db.quizzes.filter(x=>String(x.id)!==String(id));saveData();render();showToast("تم حذف الاختبار")}
 if(name==="openLesson"){const l=get(db.lessons);alert(`${l.title}\n\n${l.description}\n\nنوع المحتوى: ${l.type}\n\nملحوظة: رفع ملفات فعلية غير مفعّل في النسخة المحلية.`)}
 if(name==="submitAssignment"){const a=get(db.assignments);openForm("تسليم الواجب",[{name:"student",label:"اسمك",value:"طالب تجريبي"},{name:"answer",label:"إجابتك أو رابط الملف",type:"textarea"}],v=>{db.submissions.push({id:nextId(),assignment:a.title,student:v.student,answer:v.answer,status:"بانتظار التصحيح"});showToast("تم تسجيل تسليم تجريبي");return true})}
 if(name==="takeQuiz"){takeQuiz(id)}
 if(name==="rewardStudent")openForm("تسجيل مكافأة تجريبية",[{name:"student",label:"اسم الطالب"},{name:"reason",label:"سبب المكافأة",value:"الالتزام وحل الواجبات"}],v=>{showToast(`مكافأة تجريبية لـ ${v.student}: ${v.reason}`);return true});
 if(name==="createCompetition")openForm("إنشاء مسابقة تجريبية",[{name:"title",label:"اسم المسابقة"},{name:"details",label:"تفاصيل المسابقة",type:"textarea"}],v=>{db.announcements.unshift({id:nextId(),title:"مسابقة: "+v.title,body:v.details,date:"اليوم"});currentPage="announcements";return true});
}
function takeQuiz(id){
 const q=db.quizzes.find(x=>String(x.id)===String(id));if(!q)return;
 $("#dialogTitle").textContent=q.title;$("#formFields").innerHTML=q.questions.map((item,i)=>`<div class="quiz-question"><h4>${i+1}. ${esc(item.q)}</h4><div class="quiz-options">${item.options.map((o,j)=>`<label class="quiz-option"><input type="radio" name="q_${i}" value="${j}" ${j===0?"required":""}> ${esc(o)}</label>`).join("")}</div></div>`).join("");
 const d=$("#itemDialog"),form=$("#itemForm");d.showModal();form.onsubmit=e=>{e.preventDefault();const fd=new FormData(form);let correct=0;q.questions.forEach((item,i)=>{if(Number(fd.get("q_"+i))===item.answer)correct++});const percent=Math.round(correct/q.questions.length*100);db.results.unshift({id:nextId(),title:q.title,percent,date:new Date().toLocaleDateString("ar-EG")});db.points+=Math.round(percent/10);saveData();d.close();render();showToast(`نتيجتك ${percent}% — أحسنت!`)}
}
$("#appContent").addEventListener("click",e=>{const b=e.target.closest("[data-action]");if(b)action(b.dataset.action,b.dataset.id)});
$("#closeDialog").addEventListener("click",()=>$("#itemDialog").close());$("#cancelDialog").addEventListener("click",()=>$("#itemDialog").close());
$("#menuToggle").addEventListener("click",()=>{$(".sidebar").classList.add("open");$(".mobile-backdrop").classList.add("show")});
const backdrop=document.createElement("div");backdrop.className="mobile-backdrop";document.body.appendChild(backdrop);backdrop.addEventListener("click",closeMenu);
render();
