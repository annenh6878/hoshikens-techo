
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(target).classList.add('active');
  });
});

const checks = document.querySelectorAll('#departure input[type="checkbox"]');
const doneCount = document.getElementById('doneCount');
const totalCount = document.getElementById('totalCount');
const percentText = document.getElementById('percentText');
const progressBar = document.getElementById('progressBar');

function updateProgress(){
  const total = checks.length;
  const done = [...checks].filter(c => c.checked).length;
  const percent = Math.round(done / total * 100);
  doneCount.textContent = done;
  totalCount.textContent = total;
  percentText.textContent = percent + '% 準備完成';
  progressBar.style.width = percent + '%';
}

checks.forEach(c => c.addEventListener('change', updateProgress));
updateProgress();
