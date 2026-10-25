const bar=document.querySelector('.progress span');
const update=()=>{const d=document.documentElement;const max=d.scrollHeight-d.clientHeight;bar.style.width=(max?d.scrollTop/max*100:0)+'%'};
update();addEventListener('scroll',update,{passive:true});addEventListener('resize',update);
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));