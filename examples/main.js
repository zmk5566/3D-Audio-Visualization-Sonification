import {StateTimer} from './js/StateTimer.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17/+esm';

console.log(Tone.context);
console.log(global_config);
var state_timer = new StateTimer(Tone.context,global_config);
state_timer.init();

var gui = new GUI();

var folder1 = gui.addFolder('General');
console.log(global_config);

folder1.add(global_config.audio_config, 'mode',  ['running_pitch_pan','pitchpan', 'spatial']).name('Mode').onChange( value => {
    state_timer.update_config(global_config);
} );

folder1.add(global_config, 'time_duration', 10, 60).step(1).name('Time Duration').onChange( value => {
    state_timer.update_config(global_config);
} );

folder1.add(global_config, 'dynamic_scale', 0.5, 3).step(1).name('Scale').onChange( value => {
    state_timer.update_config(global_config);
} );

folder1.add(global_config, 'radius', 0.5, 3).step(0.25).name('Radius').onChange( value => {
    state_timer.update_config(global_config);
} );

folder1.add(global_config, 'theta', Math.PI/6, 2*Math.PI).step(0.01).name('Theta').onChange( value => {
    state_timer.update_config(global_config);
} );

folder1.add(global_config.audio_config, 'pitchnpan_interval', 0.5,6).step(0.5).name('Interval').onChange( value => {
    state_timer.update_config(global_config);
} );





//var spectrum_display = folder1.add(global_config, 'spectrum_display').name('Spectrum Display');

var audio_config_folder = gui.addFolder('Audio Config');
audio_config_folder.close();
//var location_config = audio_config_folder.addFolder('Location');
var synths_folder = audio_config_folder.addFolder('Synths');
var audio_location_folder = audio_config_folder.addFolder('Audience Location');

audio_location_folder.add(global_config.audio_config.audience_location, 'pitch', -1, 1).step(0.05).name('X').onChange( value => {
    console.log("changed pitch")
    state_timer.update_config(global_config);
})

audio_location_folder.add(global_config.audio_config.audience_location, 'yaw', -1, 1).step(0.05).name('Y').onChange( value => {
    state_timer.update_config(global_config);
})

audio_location_folder.add(global_config.audio_config.audience_location, 'roll', -1, 1).step(0.05).name('Z').onChange( value => {
    state_timer.update_config(global_config);
})




global_config.audio_config.audio_channels.forEach((trem,i)=>{
    
    var single_channel = synths_folder.addFolder('Channel  ' + i);
    var osc_type = single_channel.addFolder('OSC Type');

    osc_type.add(global_config.audio_config.audio_channels[i].synth.oscillator, 'type', ['sine', 'square', 'triangle', 'sawtooth']).name('OSC').onChange( value => {
        console.log(value);
        state_timer.update_config(global_config);
    })

    var sub_folder = single_channel.addFolder('Tremolo Effect');
    sub_folder.add(global_config.audio_config.audio_channels[i].tremolo_effect, 'frequency', 0, 8).step(1).name('Frequency').onChange( value => {
        state_timer.update_config(global_config);
    })
    sub_folder.add(global_config.audio_config.audio_channels[i].tremolo_effect, 'depth', 0, 1).step(0.1).name('Depth').onChange( value => {
        state_timer.update_config(global_config);
    })

    sub_folder.add(global_config.audio_config.audio_channels[i], 'mute').name('Mute').onChange( value => {
        state_timer.update_config(global_config);
    })
    



})

function global_update_config(){
console.log("global update config");
state_timer.update_pan(global_config);

}

update_global_config =global_update_config;


document.getElementById("start").onclick = state_timer.start.bind(state_timer);
document.getElementById("pitch").onchange = () => {
    console.log('it changed'); // Do something
  }
document.getElementById("stop").onclick = state_timer.stop.bind(state_timer);

document.getElementById("init").onclick = state_timer.initcore.bind(state_timer);