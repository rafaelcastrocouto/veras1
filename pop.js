document.querySelector('#popInit').remove();

document.querySelector('#hide').addEventListener('click', window.opener.hideControls);

document.querySelector('#bpm').addEventListener('input', () => {
  let v = Number(document.querySelector('#bpm').value);
  document.querySelector('#ctrl2').value = Math.pow(v, 1/4);

  window.opener.document.querySelector('#bpm').value = v;
  window.opener.document.querySelector('#ctrl2').value = Math.pow(v, 1/4);
});

document.querySelector('#ctrl1').addEventListener('input', () => {
  let v = document.querySelector('#ctrl1').value;
  window.opener.document.querySelector('#ctrl1').value = v;
});

document.querySelector('#ctrl2').addEventListener('input', () => {
  let v = Number(document.querySelector('#ctrl2').value);
  document.querySelector('#bpm').value = Math.round(Math.pow(v, 4));
  
  window.opener.document.querySelector('#ctrl2').value = v;
  window.opener.document.querySelector('#bpm').value = Math.round(Math.pow(v, 4));
});

document.querySelector('#ctrl3').addEventListener('input', () => {
  let v = Number(document.querySelector('#ctrl3').value);
  window.opener.document.querySelector('#ctrl3').value = v;
});

document.querySelector('#ctrl4').addEventListener('input', () => {
  let v = Number(document.querySelector('#ctrl4').value);
  window.opener.document.querySelector('#ctrl4').value = v;
});

document.querySelector('#ctrl5').addEventListener('input', () => {
  let v = Number(document.querySelector('#ctrl5').value);
  window.opener.document.querySelector('#ctrl5').value = v;
});

document.querySelector('#ctrl6').addEventListener('input', () => {
  let v = Number(document.querySelector('#ctrl6').value);
  window.opener.document.querySelector('#ctrl6').value = v;
});

document.querySelector('#ctrl7').addEventListener('input', () => {
  let v = Number(document.querySelector('#ctrl7').value);
  window.opener.document.querySelector('#ctrl7').value = v;
});

document.querySelector('#ctrl8').addEventListener('input', () => {
  let v = Number(document.querySelector('#ctrl8').value);
  window.opener.document.querySelector('#ctrl8').value = v;
});
