var audioContext, analyser, audioData;

export default function audioInit (cb) {
  document.querySelector('#updateDevices').addEventListener('click', updateDevices);
  document.querySelector('#getUserMedia').addEventListener('click', startInput);
  document.querySelector('#audioDestination').addEventListener('click', startOutput);
  
  searchOutput(cb, true);
}

export function popInit () {
  window.pop.document.querySelector('#startAudio').addEventListener('click', audioInit);
  window.pop.document.querySelector('#updateDevices').addEventListener('click', updateDevices);
  window.pop.document.querySelector('#getUserMedia').addEventListener('click', startInput);
  window.pop.document.querySelector('#audioDestination').addEventListener('click', startOutput);
}

function updateDevices () {
  searchInput();
  searchOutput();
}

export function audioLoop () {
  if (analyser && audioData) analyser.getByteFrequencyData(audioData);
  return audioData;
}

function msg (str) {
  document.querySelector('#message').innerHTML = str;
  if (window.pop) window.pop.document.querySelector('#message').innerHTML = str;
}

function errFun (err) {
  document.querySelector('#message').innerHTML = `<p>${err.name}: ${err.message}</p>`;
  if (window.pop) window.pop.document.querySelector('#message').innerHTML = `<p>${err.name}: ${err.message}</p>`;
}

function audioNode (opt) {
  //console.log(opt)
  const node = document.createElement('li');
  node.textContent = opt.name || 'Audio Node';
  return node;
}

function addToInterface (query, node) {
  document.querySelector(query).innerHTML = '';
  document.querySelector(query).appendChild(node);
  
  if (window.pop) {
    window.pop.document.querySelector(query).innerHTML = '';
    window.pop.document.querySelector(query).appendChild(node);
  }
}

function addToList (query, devices) {
  document.querySelector('#'+query+'DevicesList').innerHTML = '';
  if (window.pop) window.pop.document.querySelector('#'+query+'DevicesList').innerHTML = '';
  
  devices.forEach((device) => {
    if (device.kind=='audio'+query && device.deviceId.length==64) {
      const opt = new Option(device.label || 'Default', device.deviceId);
      document.querySelector('#'+query+'DevicesList').options.add(opt);
      if (window.pop) window.pop.document.querySelector('#'+query+'DevicesList').options.add(opt);
    }
  });
  
  
  msg(`found ${document.querySelector('#'+query+'DevicesList').options.length} `+query+`devices`);
}

function searchOutput (cb, autoStart) {
  msg('searching input devices...');
  try {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      addToList('output', devices);
      if (autoStart) startOutput(cb, autoStart);
    });
  } catch (err) { errFun(err); }
}


function startOutput (cb, autoStart) {
  msg('connecting output...');
  try {
    if (audioContext?.close) audioContext.close();
    audioContext = new AudioContext({
      latencyHint: 'interactive',
      sampleRate: 48000,
      sinkId: document.querySelector('#outputDevicesList').value,
    });
    if (audioContext.state == 'suspended') {
      audioContext.resume();
    }
    
    msg('output connected');
    
    addToInterface('#outputInterface', audioNode({
      name: document.querySelector('#outputDevicesList option:checked')?.textContent || 'Default', 
      channels: audioContext.destination.channelCount, 
      sampleRate: audioContext.sampleRate, 
      id: audioContext.sinkId, 
      latency: audioContext.baseLatency+audioContext.outputLatency,
      close: audioContext.close
    }));
    
    if (autoStart) askInputPermission(cb, autoStart);
    
  } catch (err) { errFun(err); }
}

function askInputPermission (cb, autoStart) {
  //ask permission for input
  navigator.permissions.query({ name: "microphone" }).then((result) => {
    if (result.state !== 'granted') {
      msg(`NotAllowedError: Microphone Permission denied`);
    } else {
      searchInput(cb, autoStart);
    }
  });
}

function searchInput (cb, autoStart) {
  msg('searching input devices...');
  try {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      addToList('input', devices);
    });
    if (autoStart) startInput(cb);
  } catch (err) { errFun(err); }
}


function startInput (cb) {
  msg('connecting input...');
  try {
    
    const opts = { 'optional': [{ 'sourceId': document.querySelector('#inputDevicesList').value }] };
    navigator.mediaDevices.getUserMedia({audio: opts}).then((stream) => {
      
      msg('input connected');
      addToInterface('#inputInterface', audioNode({
        name: document.querySelector('#inputDevicesList option:checked')?.textContent || 'Default', 
        id: stream.id, 
        active: stream.active,
        stream: stream
      }))
      
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const streamSrc = audioContext.createMediaStreamSource(stream);
      streamSrc.connect(analyser);
      audioData = new Uint8Array(analyser.frequencyBinCount);
      //streamSrc.connect(audioContext.destination);
      
      if(cb) cb(analyser.frequencyBinCount);
      
    }).catch(errFun);
    
  } catch (err) { errFun(err); }
}

