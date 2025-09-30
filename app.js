const $ = (s, el=document)=>el.querySelector(s);
const $$ = (s, el=document)=>Array.from(el.querySelectorAll(s));

const state = {
  order: 'logical', // or 'recent'
  q: '',
  progress: JSON.parse(localStorage.getItem('guto.progress') || '{}')
};

const cardsEl = $('#cards');
const qEl = $('#q');
const orderBtn = $('#order');

function render(){
  let list = [...window.VIDEOS];
  if(state.order==='recent') list = list.reverse();
  if(state.q){
    const q = state.q.toLowerCase();
    list = list.filter(v => v.title.toLowerCase().includes(q) || v.tags.join(' ').toLowerCase().includes(q));
  }
  cardsEl.innerHTML = '';
  list.forEach((v,i)=> cardsEl.appendChild(card(v,i)));
}

function card(v, idx){
  const root = document.createElement('article');
  root.className = 'card';
  root.innerHTML = `
    <h3>${v.title}</h3>
    <div class="badges">${v.tags.map(t=>`<span class="badge">${t}</span>`).join('')} <span class="badge">${v.minutes} min</span></div>
    <p class="desc">${v.description}</p>
    <div class="actions">
      <button class="btn" data-play>Ver</button>
      <a class="btn ghost" href="${v.url}" target="_blank" rel="noopener">Abrir en YouTube</a>
    </div>
    <div class="progress"><span style="width:${(state.progress[v.id]||0)}%"></span></div>
  `;
  root.querySelector('[data-play]').addEventListener('click', ()=> openModal(v));
  return root;
}

qEl.addEventListener('input', e=>{ state.q = e.target.value.trim(); render(); });
orderBtn.addEventListener('click', ()=>{
  state.order = state.order==='logical' ? 'recent' : 'logical';
  orderBtn.textContent = 'Orden: ' + (state.order==='logical' ? 'Lógico' : 'Recientes');
  render();
});

// Modal logic
const modal = $('#modal');
const mTitle = $('#mTitle');
const mDesc = $('#mDesc');
const mMeta = $('#mMeta');
const player = $('#player');
const playerNotice = $('#playerNotice');
const openYT = $('#openYT');
const playBtn = $('#play');

function openModal(v){
  mTitle.textContent = v.title;
  mDesc.textContent = v.description;
  mMeta.textContent = v.tags.join(' · ');
  openYT.href = v.url;
  player.src = 'about:blank';
  playerNotice.classList.add('hidden');
  modal.showModal();

  // Play on button click to respect autoplay policies
  playBtn.onclick = (e)=>{
    e.preventDefault();
    // Embed using the privacy-enhanced domain (nocookie). Allow JS API for progress tracking.
    const src = `https://www.youtube-nocookie.com/embed/${v.id}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
    player.src = src;
  };

  // Track basic progress when user closes
  modal.addEventListener('close', ()=>{
    state.progress[v.id] = 100; // simple: mark as visto
    localStorage.setItem('guto.progress', JSON.stringify(state.progress));
    render();
    player.src = 'about:blank';
  }, {once:true});

  // Fallback if embed is blocked (error 153)
  player.addEventListener('error', ()=>{
    playerNotice.classList.remove('hidden');
  }, {once:true});
}

render();
