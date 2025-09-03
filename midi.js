let midi;

export default midi;

export let pressed = false;

export function askMidiPermissions () {
  
  navigator.permissions.query({ name: "midi" }).then((result) => {
    if (result.state !== 'granted') {
      document.querySelector('#message').innerHTML += `<p>NotAllowedError: MIDI Permission denied</p>`;
    } else {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    }
  });
  
}

function onMIDISuccess(midiAccess) {
  console.log('MIDI ON')
  document.querySelector('#message').innerHTML += `<p>MIDI ready!</p>`;
  midi = midiAccess; 
  midiAccess.inputs.forEach((entry) => { entry.onmidimessage = onMIDIMessage; });
}

function onMIDIMessage(event) {
  
  let str = `MIDI message received: `; /*at timestamp ${event.timeStamp} [${event.data.length} bytes]*/
  for (let i=0; i<event.data.length; i++) { 
    let character = event.data[i];
    str += `${i}: ${character} |`;
  }
  if (event.data[0] != 248) console.log(str);
  //document.querySelector('#message').innerHTML = str;
  
  if (event.data[0] == 153 && event.data[1] == 40 && event.data[2] > 0) window.invertMode = !window.invertMode;
  if (event.data[0] == 153 && event.data[1] == 41 && event.data[2] > 0) pressed = true;
  if (event.data[0] == 137 && event.data[1] == 41 && event.data[2] == 0 ) pressed = false;
  if (event.data[0] == 153 && event.data[1] == 42 && event.data[2] > 0) window.restart();
  if (event.data[0] == 153 && event.data[1] == 43 && event.data[2] > 0) window.switchAnim();
  
  for (let i=1; i<=8; i++) {
    let ctrl = document.querySelector('#ctrl'+i);
    if (event.data[0] == 176 && event.data[1] == 20+i) {
      const midiValue = Number(ctrl.min) + (Number(event.data[2])/127) * (Number(ctrl.max)-Number(ctrl.min))
      ctrl.value = midiValue;
      if (window.pop) {
        const popCtrl = window.pop.document.querySelector('#ctrl'+i);
        popCtrl.value = midiValue;
      }
      console.log('MIDI'+i+': '+ctrl.value);
    }
  }
  let bpm = Math.round(Math.pow(Number(document.querySelector('#ctrl2').value), 4));
  document.querySelector('#bpm').value = bpm;
  
  if (window.pop) {
    let bpm = Math.round(Math.pow(Number(document.querySelector('#ctrl2').value), 4));
  document.querySelector('#bpm').value = bpm;
  //console.log(v);
  }
  
}

function onMIDIFailure(msg) {
  document.querySelector('#message').innerHTML += `<p>MidiAccessError: ${msg}</p>`;
}

