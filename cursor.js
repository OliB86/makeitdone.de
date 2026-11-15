(function(){
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var calm=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(!fine||calm)return;
  var d=document,root=d.documentElement;
  var ring=d.createElement('div');ring.className='c-ring';
  ring.innerHTML='<i class="c-hand"></i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-8.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var dot=d.createElement('div');dot.className='c-dot';
  d.body.appendChild(ring);d.body.appendChild(dot);root.classList.add('c-on');
  var mx=-100,my=-100,rx=-100,ry=-100;
  d.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;dot.style.transform='translate('+mx+'px,'+my+'px)';root.classList.remove('c-out')});
  d.addEventListener('mouseout',function(e){if(!e.relatedTarget)root.classList.add('c-out')});
  d.addEventListener('mouseover',function(e){root.classList.toggle('c-hot',!!e.target.closest('a,button,[role=button]'))});
  d.addEventListener('mousedown',function(){root.classList.add('c-down')});
  d.addEventListener('mouseup',function(){root.classList.remove('c-down')});
  (function loop(){rx+=(mx-rx)*.2;ry+=(my-ry)*.2;ring.style.transform='translate('+rx+'px,'+ry+'px)';requestAnimationFrame(loop)})();
})();
