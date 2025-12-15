document.addEventListener('DOMContentLoaded', function(){
  const refsToggle = document.getElementById('toggle-refs');
  const refsList = document.getElementById('refs-list');
  if (refsToggle && refsList) {
    refsToggle.addEventListener('click', () => {
      const hidden = refsList.style.display === 'none';
      refsList.style.display = hidden ? 'block' : 'none';
      refsToggle.textContent = hidden ? 'Hide' : 'Show';
      refsToggle.setAttribute('aria-expanded', hidden ? 'true' : 'false');
    });
  }

  Array.from(document.querySelectorAll('a.ref')).forEach(a=>{
    a.setAttribute('target','_blank');
    a.setAttribute('rel','noopener noreferrer');
  });

  const closeBtn = document.getElementById('close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (window.parent && typeof window.parent.closeViewer === 'function') {
        window.parent.closeViewer();
      } else {
        window.close();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (window.parent && typeof window.parent.closeViewer === 'function') {
        window.parent.closeViewer();
      }
    }
  });
});
