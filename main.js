console.clear();
const height = 255*2;

let strobo = false;

window.invertMode = false;
window.invertBack = false;
window.anim = false;

import {default as midi, askMidiPermissions, pressed} from '/veras1/midi.js';
import {default as audioInit, audioLoop, popInit} from '/veras1/audio.js';

let iCtrl1,iCtrl2,iCtrl3,iCtrl4,iCtrl5,iCtrl6,iCtrl7,iCtrl8;

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const kill = document.getElementById('kill');
const noise = document.getElementById('noiseFilter');

askMidiPermissions();
animate();
  
document.querySelector('#startAudio').addEventListener('click', startAudio);

function startAudio () {
  audioInit( (size) => {
    canvas.width = size*2;
    canvas.height = window.innerHeight;
  });
}
window.startAudio = startAudio;

function animate () {
  let currentDate = new Date().getTime();
  
  // update controls values
  iCtrl1 = Number(document.querySelector('#ctrl1').value);
  iCtrl2 = Number(document.querySelector('#ctrl2').value);
  iCtrl3 = Number(document.querySelector('#ctrl3').value);
  iCtrl4 = Number(document.querySelector('#ctrl4').value);
  iCtrl5 = Number(document.querySelector('#ctrl5').value);
  iCtrl6 = Number(document.querySelector('#ctrl6').value);
  iCtrl7 = Number(document.querySelector('#ctrl7').value);
  iCtrl8 = Number(document.querySelector('#ctrl8').value);
  
  canvas.height = window.innerHeight;
  ctx.clearRect(0,0,canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  
  const hw = parseInt(canvas.width/2);
  const hh = parseInt(canvas.height/2);
  
  const sx = Number(iCtrl4);
  const sy = Math.pow(iCtrl1, 4);
  
  const w = Math.ceil(sx);
  
  const audioData = audioLoop();
  
  if (strobo || pressed) window.invertBack = !window.invertBack;
  else window.invertBack = window.invertMode;
  
  if (audioData) {
    let n = 256
    let d = audioData.slice(0,n).reduce((s, a) => s + a, 0)/n;
    
    if (!strobo && !pressed && (d > 64 + (iCtrl6 * 20))) window.invertBack = !window.invertBack;
    if (!strobo && !pressed && (d < 64 + (iCtrl6 * 20))) window.invertBack = window.invertMode;
    
    for (let x=0; x<canvas.width; x++) {
      const xi = Math.floor(x*sx - (hw*sx) + hw);
      if (!window.invertBack) {
        if (x < hw) ctx.fillRect(xi, hh-audioData[hw-x]*sy, w, 2*audioData[hw-x]*sy);
        else ctx.fillRect(xi, hh-audioData[x-hw]*sy, w, 2*audioData[x-hw]*sy);
      } else {
        if (x < hw) {
          ctx.fillRect(xi, hh+audioData[hw-x]*sy, w, hh-audioData[hw-x]*sy);
          ctx.fillRect(xi, 0, w, hh-audioData[hw-x]*sy);
        }
        else {
          ctx.fillRect(xi, hh+audioData[x-hw]*sy, w, hh-audioData[x-hw]*sy);
          ctx.fillRect(xi, 0, w, hh-audioData[x-hw]*sy);
        }
      }
    }
  } else if (window.invertBack) ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.body.style.background = window.invertBack ? 'white' : 'black';
  
  if (window.invertBack && sx < 1) { // white stripes
    ctx.fillRect(0, 0, hw*(1-sx)+1, canvas.height);
    ctx.fillRect(canvas.width, 0, -(hw*(1-sx)+1), canvas.height);
  }
  
  const angle = iCtrl6;
  
  kill.children[1].setAttribute('dx', Math.cos(angle)*iCtrl5);
  kill.children[1].setAttribute('dy', Math.sin(angle)*iCtrl5);
  kill.children[3].setAttribute('dx', -1 * Math.cos(angle)*iCtrl5);
  kill.children[3].setAttribute('dy', -1 * Math.sin(angle)*iCtrl5);
  
  noise.children[1].setAttribute('scale',iCtrl3*1000);
  
  document.querySelector('#veras').style.transform = 'translate(-50%, -50%) scale(' + iCtrl7 + ')';
  updateShadow();
  
  let bpm = Number(document.querySelector('#bpm').value);
  document.documentElement.style.setProperty('--time', bpmToInterval(bpm)*4+'ms');
  let intervalMsec = bpmToInterval(bpm);
  
  if (intervalMsec <= 7 || window.anim) requestAnimationFrame(animate);
  else setTimeout(animate, Math.min(2000, parseInt(intervalMsec)));
}

function bpmToInterval (bpm) {
  let bps = bpm / 60;
  let intervalSec = 1 / bps;
  let intervalMsec = intervalSec * 1000;
  return intervalMsec;
}

function updateBpm () {
  let v = Number(document.querySelector('#bpm').value);
  document.querySelector('#ctrl2').value = Math.pow(v, 1/4);
  
  if (window.pop) {
    window.pop.document.querySelector('#bpm').value = v;
    window.pop.document.querySelector('#ctrl2').value = Math.pow(v, 1/4);
  }
}
updateBpm();
document.querySelector('#bpm').addEventListener('input', updateBpm);

document.querySelector('#ctrl2').addEventListener('input', () => {
  let v = Number(document.querySelector('#ctrl2').value);
  document.querySelector('#bpm').value = Math.round(Math.pow(v, 4));
  
  if (window.pop) {
    //window.pop.document.querySelector('#ctrl2').value = v;
    window.pop.document.querySelector('#bpm').value = Math.round(Math.pow(v, 4));
  }
});

function hideControls () {
  document.querySelector('#controls').style.display = 'none';
}
window.hideControls = hideControls;
document.querySelector('#hide').addEventListener('click', hideControls);


document.querySelector('#popInit').addEventListener('click', () => {
  window.pop = window.open("", "PopWindow", "width=606,height=120");
  
  window.pop.document.head.appendChild(document.querySelector('#style').cloneNode('deep'));
  window.pop.document.body.appendChild(document.querySelector('#controls').cloneNode('deep')); 
  
  const popJs = window.pop.document.createElement('script');
  popJs.src = 'pop.js';
  window.pop.document.body.appendChild(popJs);
  
  popInit();
  
  for (let i=1; i<=8; i++) {
    document.querySelector('#ctrl'+i).addEventListener('input', () => {
      let v = document.querySelector('#ctrl'+i).value;
      if (window.pop) window.pop.document.querySelector('#ctrl'+i).value = v;
    });
  }
});

window.addEventListener('resize', (evt) => {
  if (!window.pop) document.querySelector('#controls').style.display = 'block';
});

window.addEventListener('keydown', (event) => {
  if (event.key == ' ') {
    var n = (document.querySelector('#controls').style.display == 'block') ? 'none' : 'block';
    document.querySelector('#controls').style.display = n;
  }
  if (event.key == 'z') window.invertMode = !window.invertMode;
  if (event.key == 'x') strobo = true;
  if (event.key == 'c') switchAnim();
  if (event.key == 'v') restart();
});
window.addEventListener('keyup', (event) => {
  if (event.key == 'x') {
    strobo = false;
    window.invertBack = window.invertMode;
  }
});

window.addEventListener('touchstart', () => { strobo = true; });
window.addEventListener('touchend', () => { strobo = false; });

function switchAnim () {
  window.anim = !window.anim;
  document.querySelector('#veras').classList.toggle('anim', window.anim);
  if (!window.anim) document.getAnimations().forEach((animation) => {
    animation.cancel();
  }); else restart();
}
window.switchAnim = switchAnim;

function restart () {
  document.getAnimations().forEach((animation) => {
    animation.cancel();
    animation.play();
  });
}
window.restart = restart;

function updateShadow () {
  const hwords = 2, vwords = 12, fsize = 100, hpi = Math.PI/2;
  /*const colorLogo = 'rgba(255,255,255,'+Math.min(Math.max((iCtrl8)*4, 0), 1)+')';
  const colorLine = 'rgba(255,255,255,'+Math.min(Math.max((iCtrl8-0.4)*4, 0), 1)+')';
  const colorAll = 'rgba(255,255,255,'+Math.min(Math.max((iCtrl8-0.7)*4, 0), 1)+')';*/
  const colorLogo = 'var(--colorLogo)';
  const colorLine = 'var(--colorLine)';
  const colorAll = 'var(--colorAll)';
  let shadow = [];
  if (iCtrl8 == 0) shadow.push('0px '+'0px 0 '+colorLogo);
  else {
    for (let y=-vwords; y<=vwords; y++) {
      for (let x=-hwords; x<=hwords; x++) {
        if (y%2) { // half moved left
          shadow.push(Math.round((4.1*fsize)+(x*8.2*fsize))+'px '+y*fsize+'px 0 '+colorAll);
        } else {
          if (x==0 && y==0) { // logo
            shadow.push(Math.round(x*8.2*fsize)+'px '+y*fsize+'px 0 '+colorLogo);
          }
          else if (y==0) { // central line
            shadow.push(Math.round(x*8.2*fsize)+'px '+y*fsize+'px 0 '+colorLine);
          } else { // other words
            shadow.push(Math.round(x*8.2*fsize)+'px '+y*fsize+'px 0 '+colorAll);
          }
        }
      }
    }
  }
  document.querySelector('#veras').style.color = '#0000';
  document.querySelector('#veras').style['text-shadow'] = shadow.join(',');
  updateShadowColor();
}
updateShadow();

function updateShadowColor () {
  document.documentElement.style.setProperty('--colorLogo', 'rgba(255,255,255,'+Math.min(Math.max((iCtrl8)*4, 0), 1)+')');
  document.documentElement.style.setProperty('--colorLine', 'rgba(255,255,255,'+Math.min(Math.max((iCtrl8-0.4)*4, 0), 1)+')');
  document.documentElement.style.setProperty('--colorAll', 'rgba(255,255,255,'+Math.min(Math.max((iCtrl8-0.7)*4, 0), 1)+')');
}

//document.querySelector('#ctrl8').addEventListener('input', updateShadowColor);
