const $ = (id) => document.getElementById(id);
const KEY = 'focus-tasks-v1';
const initial = [
 {id:1,title:'Собрать структуру проекта',description:'Подготовить HTML, CSS и JavaScript для демо.',priority:'high',date:'',done:true,created:1},
 {id:2,title:'Добавить поиск и фильтрацию',description:'Поиск по названию и фильтр по приоритету.',priority:'medium',date:'',done:false,created:2},
 {id:3,title:'Проверить адаптивность интерфейса',description:'Убедиться, что приложение удобно на телефоне.',priority:'low',date:'',done:false,created:3}
];
let tasks = JSON.parse(localStorage.getItem(KEY) || 'null') || initial;
let filter = 'all', editingId = null;
const labels = {high:'Высокий приоритет',medium:'Средний приоритет',low:'Низкий приоритет'};
const save = () => localStorage.setItem(KEY, JSON.stringify(tasks));
function render(){
 const done=tasks.filter(t=>t.done).length, active=tasks.length-done;
 $('totalStat').textContent=tasks.length; $('doneStat').textContent=done; $('leftStat').textContent=active;
 $('doneHint').textContent=(tasks.length?Math.round(done/tasks.length*100):0)+'% завершено';
 $('navAll').textContent=tasks.length; $('navActive').textContent=active; $('navDone').textContent=done;
 const q=$('search').value.toLowerCase(), p=$('priorityFilter').value, sort=$('sort').value;
 let list=tasks.filter(t=>(filter==='all'||(filter==='done'?t.done:!t.done))&&
   (t.title+' '+t.description).toLowerCase().includes(q)&&(p==='all'||t.priority===p));
 if(sort==='priority') list.sort((a,b)=>({high:0,medium:1,low:2}[a.priority]-{high:0,medium:1,low:2}[b.priority]));
 if(sort==='az') list.sort((a,b)=>a.title.localeCompare(b.title,'ru'));
 if(sort==='newest') list.sort((a,b)=>b.created-a.created);
 $('listTitle').textContent=({all:'Все задачи',active:'В работе',done:'Завершённые'})[filter];
 $('countLabel').textContent=list.length+' задач';
 $('taskList').innerHTML=list.length?list.map(t=>`<article class="task ${t.done?'completed':''}">
 <button class="check" data-action="toggle" data-id="${t.id}" aria-label="Изменить статус">${t.done?'✓':''}</button>
 <div class="task-content"><div class="task-title">${escapeHtml(t.title)}</div>
 ${t.description?`<div class="task-desc">${escapeHtml(t.description)}</div>`:''}
 <div class="meta"><span class="pill ${t.priority}">${labels[t.priority]}</span>${t.date?`<span class="due">Срок: ${new Date(t.date+'T00:00:00').toLocaleDateString('ru-RU')}</span>`:''}</div></div>
 <div class="actions"><button class="icon-btn" data-action="edit" data-id="${t.id}" title="Редактировать">✎</button><button class="icon-btn" data-action="delete" data-id="${t.id}" title="Удалить">×</button></div></article>`).join(''):'<div class="empty"><strong>Задач пока нет</strong>Добавьте задачу или измените параметры поиска.</div>';
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function openModal(task=null){
 editingId=task?.id??null; $('modalTitle').textContent=task?'Редактировать задачу':'Новая задача';
 $('taskTitle').value=task?.title||''; $('taskDescription').value=task?.description||'';
 $('taskPriority').value=task?.priority||'medium'; $('taskDate').value=task?.date||'';
 $('modalBackdrop').classList.add('show'); $('taskTitle').focus();
}
function closeModal(){$('modalBackdrop').classList.remove('show');$('taskForm').reset();editingId=null;}
$('openModal').addEventListener('click',()=>openModal());
$('closeModal').addEventListener('click',closeModal);
$('modalBackdrop').addEventListener('click',e=>{if(e.target===$('modalBackdrop'))closeModal();});
$('taskForm').addEventListener('submit',e=>{
 e.preventDefault(); const data={title:$('taskTitle').value.trim(),description:$('taskDescription').value.trim(),priority:$('taskPriority').value,date:$('taskDate').value};
 if(!data.title)return;
 if(editingId!==null){tasks=tasks.map(t=>t.id===editingId?{...t,...data}:t);}
 else tasks.push({id:Date.now(),...data,done:false,created:Date.now()});
 save();closeModal();render();
});
$('taskList').addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b)return;
 const id=Number(b.dataset.id),action=b.dataset.action,task=tasks.find(t=>t.id===id);
 if(action==='toggle')task.done=!task.done;
 if(action==='delete'&&confirm('Удалить эту задачу?'))tasks=tasks.filter(t=>t.id!==id);
 if(action==='edit')return openModal(task);
 save();render();
});
document.querySelectorAll('.nav').forEach(b=>b.addEventListener('click',()=>{
 document.querySelectorAll('.nav').forEach(n=>n.classList.remove('active'));b.classList.add('active');filter=b.dataset.filter;render();
}));
['search','priorityFilter','sort'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',render));
render();
