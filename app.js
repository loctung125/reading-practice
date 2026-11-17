const $ = id => document.getElementById(id);
let bank = [], active = null, answers = [], submitted = false, startedAt = 0, timerId = null, session = 0;
const STORAGE = 'reading-lab-history-v1';
const getHistory = () => {try{return JSON.parse(localStorage.getItem(STORAGE)) || []}catch{return []}};
const escapeHtml = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize = s => String(s||'').normalize('NFKC').trim().toLowerCase().replace(/[“”‘’]/g,"'").replace(/[.,!?;:]+$/g,'').replace(/\s+/g,' ');
const optionKey = s => s.match(/^([A-G]|i{1,3}|iv|v|vi|vii)\./i)?.[1] || s;
function prettifyPassage(raw){
  let text = raw.replace(/\s+(?=(?:A\.|B\.|C\.|D\.|E\.)\s+[A-Z])/g,'\n\n');
  // Keep original English text, but provide readable paragraphs even when PDF extraction loses breaks.
  text = text.replace(/(?<=[.!?])\s+(?=(?:However|In addition|Unfortunately|The study|The team|During|Later|In 19\d\d|In 20\d\d|One of the|As their name|The researchers|At first|By 19\d\d|In April|The voyage|The nesting season|The main reasons|The plan is|Bich became|Most people|There is now|A few days later)\b)/g,'\n\n');
  return text.split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${escapeHtml(p)}</p>`).join('');
}
function openView(name){ ['welcome','exam','history'].forEach(id=>$(id).classList.toggle('hidden',id!==name));window.scrollTo({top:0,behavior:'instant'}) }
function updateHeader(){const h=getHistory();$('historyCount').textContent=h.length;$('completedCount').textContent=h.length;$('setCount').textContent=bank.length;$('questionCount').textContent=bank.reduce((n,s)=>n+s.questions.length,0)}
function pickRandom(){
  const last = Number(sessionStorage.getItem('reading-last-id')||'-1');
  const pool=bank.map((_,i)=>i).filter(i=>i!==last);
  const idx=pool[Math.floor(Math.random()*pool.length)];sessionStorage.setItem('reading-last-id',idx);return bank[idx]
}
function newExam(){
  if(active&&!submitted&&answers.some(a=>a&&a.length)&&!confirm('Bạn đang làm dở. Bạn có chắc muốn đổi đề không?'))return;
  active=pickRandom();answers=Array(active.questions.length).fill(null);submitted=false;session++;
  $('examTitle').textContent=active.title;$('examCounter').textContent=`SESSION ${String(session).padStart(2,'0')}`;
  $('examMeta').textContent=`${active.questions.length} câu hỏi · Đề được chọn ngẫu nhiên`;
  $('passage').innerHTML=prettifyPassage(active.passage);$('passage').scrollTop=0;
  $('result').classList.add('hidden');$('submitBtn').classList.remove('hidden');$('nextBtn').classList.add('hidden');
  renderQuestions();refreshProgress();openView('exam');startedAt=Date.now();clearInterval(timerId);tick();timerId=setInterval(tick,1000)
}
function tick(){const seconds=Math.floor((Date.now()-startedAt)/1000);$('timer').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`}
function renderQuestions(){
  const root=$('questions');root.innerHTML='';
  active.questions.forEach((q,i)=>{
    const wrap=document.createElement('div');wrap.className='question';
    wrap.innerHTML=`<div class="question-number">QUESTION ${String(i+1).padStart(2,'0')}</div><h3>${escapeHtml(q.prompt)}</h3>`;
    if(q.type==='fill'){
      const input=document.createElement('input');input.className='answer-input';input.placeholder='Nhập đáp án của bạn...';input.autocomplete='off';input.value=answers[i]||'';
      input.addEventListener('input',()=>{answers[i]=input.value;refreshProgress()});wrap.append(input)
    }else{
      const opts=document.createElement('div');opts.className='option-grid';
      q.options.forEach((option,j)=>{
        const key=optionKey(option);const label=document.createElement('label');label.className='option';
        const input=document.createElement('input');input.type=q.type==='multi'?'checkbox':'radio';input.name=`q${i}`;input.value=key;
        input.checked=q.type==='multi'?Array.isArray(answers[i])&&answers[i].includes(key):answers[i]===key;
        input.addEventListener('change',()=>{if(q.type==='multi'){const now=Array.isArray(answers[i])?[...answers[i]]:[];answers[i]=input.checked?[...now,key]:now.filter(k=>k!==key)}else answers[i]=key;refreshProgress()});
        label.append(input,document.createTextNode(option));opts.append(label)
      });wrap.append(opts)
    }
    root.append(wrap)
  });
  $('instructions').textContent='Điền đáp án hoặc chọn phương án. Câu chọn HAI đáp án cần tích đúng hai lựa chọn. Bạn có thể xem lại đoạn đọc trong lúc làm bài.'
}
function refreshProgress(){const n=answers.filter(a=>Array.isArray(a)?a.length>0:!!String(a||'').trim()).length;$('progressText').textContent=`${n} / ${answers.length}`;$('progressBar').style.width=`${n/answers.length*100}%`}
function correct(q,a){if(q.type==='multi')return Array.isArray(a)&&a.length===q.answer.length&&a.every(x=>q.answer.includes(x));if(q.type==='choice')return normalize(a)===normalize(q.answer);const variants=[q.answer,...(q.options||[])];return variants.some(x=>normalize(x)===normalize(a))}
function showAnswer(q){return q.type==='multi'?q.answer.join(', '):q.answer}
function submit(){
  if(submitted)return;
  const missing=answers.filter(a=>Array.isArray(a)?!a.length:!String(a||'').trim()).length;
  if(missing&&!confirm(`Bạn còn ${missing} câu chưa trả lời. Vẫn nộp bài?`))return;
  submitted=true;clearInterval(timerId);let score=0;
  active.questions.forEach((q,i)=>{
    const good=correct(q,answers[i]);if(good)score++;
    const row=$('questions').children[i];row.querySelectorAll('input').forEach(input=>input.disabled=true);
    const note=document.createElement('div');note.className=`feedback ${good?'right':'wrong'}`;
    note.textContent=good?`✓ Chính xác · ${showAnswer(q)}`:`✗ Đáp án đúng: ${showAnswer(q)}`;row.append(note)
  });
  const percentage=Math.round(100*score/answers.length);$('result').innerHTML=`<strong>${score} / ${answers.length}</strong><p>Đúng ${percentage}% · Thời gian ${$('timer').textContent}. Xem đáp án ngay bên dưới từng câu.</p>`;
  $('result').classList.remove('hidden');$('submitBtn').classList.add('hidden');$('nextBtn').classList.remove('hidden');
  const history=getHistory();history.unshift({title:active.title,score,total:answers.length,seconds:Math.round((Date.now()-startedAt)/1000),date:new Date().toLocaleString('vi-VN')});localStorage.setItem(STORAGE,JSON.stringify(history.slice(0,100)));updateHeader();$('result').scrollIntoView({behavior:'smooth',block:'center'});
}
function showHistory(){const h=getHistory();$('historyContent').innerHTML=h.length?`<table><thead><tr><th>THỜI GIAN</th><th>BÀI ĐỌC</th><th>KẾT QUẢ</th><th>THỜI LƯỢNG</th></tr></thead><tbody>${h.map(r=>`<tr><td>${escapeHtml(r.date)}</td><td>${escapeHtml(r.title)}</td><td>${r.score}/${r.total}</td><td>${Math.floor(r.seconds/60)}m ${r.seconds%60}s</td></tr>`).join('')}</tbody></table>`:'<p class="empty">Chưa có lượt luyện tập nào. Hãy bắt đầu một đề nhé!</p>';openView('history')}
$('startBtn').addEventListener('click',newExam);$('newBtn').addEventListener('click',newExam);$('nextBtn').addEventListener('click',newExam);$('submitBtn').addEventListener('click',submit);$('historyBtn').addEventListener('click',showHistory);$('backBtn').addEventListener('click',()=>openView(active?'exam':'welcome'));$('homeLink').addEventListener('click',e=>{e.preventDefault();openView('welcome')});$('fontBtn').addEventListener('click',()=>$('passage').classList.toggle('big'));
fetch('data/questions.json').then(r=>{if(!r.ok)throw Error('Không mở được dữ liệu');return r.json()}).then(data=>{bank=data;updateHeader()}).catch(error=>{document.querySelector('.welcome-copy>p').textContent='Không tải được ngân hàng câu hỏi. Hãy chạy dự án bằng Live Server hoặc python -m http.server 5500, không mở trực tiếp index.html.';$('startBtn').disabled=true;console.error(error)});
