const progress = document.querySelector('.progress span');

const updateProgress = () => {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  const value = max > 0 ? (doc.scrollTop / max) * 100 : 0;
  progress.style.width = value + '%';
};
updateProgress();
addEventListener('scroll', updateProgress, { passive: true });
addEventListener('resize', updateProgress);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const dialog = document.querySelector('.lightbox');
const dialogImg = dialog?.querySelector('img');
const closeBtn = dialog?.querySelector('button');

document.querySelectorAll('.archive-grid img').forEach((img) => {
  img.addEventListener('click', () => {
    if (!dialog || !dialogImg) return;
    dialogImg.src = img.src;
    dialogImg.alt = img.alt;
    dialog.showModal();
  });
});

closeBtn?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && dialog?.open) dialog.close();
});