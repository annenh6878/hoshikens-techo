
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {

    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');

    const target = tab.dataset.tab;
    document.getElementById(target).classList.add('active');
  });
});

const checks = document.querySelectorAll('.item input');
const progress = document.getElementById('progressNum');

function updateProgress(){
  const total = checks.length;
  const done = [...checks].filter(c=>c.checked).length;
  const percent = Math.round((done/total)*100);
  progress.textContent = percent + '%';
}

checks.forEach(c=>{
  c.addEventListener('change',updateProgress);
});

updateProgress();
