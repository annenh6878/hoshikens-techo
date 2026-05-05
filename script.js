
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(target).classList.add('active');
  });
});

const departureChecks = document.querySelectorAll('#departure input[type="checkbox"]');
const doneCount = document.getElementById('doneCount');
const totalCount = document.getElementById('totalCount');
const percentText = document.getElementById('percentText');

function updateProgress(){
  const total = departureChecks.length;
  const done = Array.from(departureChecks).filter(item => item.checked).length;
  const percent = Math.round(done / total * 100);

  doneCount.textContent = done;
  totalCount.textContent = total;
  percentText.textContent = `${percent}% 準備完成`;
}

departureChecks.forEach(item => item.addEventListener('change', updateProgress));
updateProgress();
