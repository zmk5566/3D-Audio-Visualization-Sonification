export class ThreeDimensionAuidoCore {
    constructor(num_of_sources,audio_config) {
        this.num_of_sources = num_of_sources;
        this.panners = [];
        this.tremolo = [];
        this.synths = [];
        this.volumes = [];
        this.pitch_range = 12;
        this.pitch_start = 0;
        this.oscillators = [];
        this.audio_config =audio_config;
    }

    init() {
        console.log("audio core init");
        console.log("audio config");
        this.audio_config.audio_channels.forEach((config,i)=>{
            console.log(config);
            this.volumes[i] = new Tone.Volume(0).toDestination();
            this.panners[i] = new Tone.Panner3D({panningModel:"HRTF"}).connect(this.volumes[i]);
            this.tremolo[i] = new Tone.Tremolo({frequency:2^(config.tremolo_effect.frequency),depth:config.tremolo_effect.depth}).connect(this.panners[i]).start();
            //this.oscillators[i] = new Tone.Oscillator(440,config.synth.oscillator.type).connect(this.tremolo[i]);

            this.synths[i] = new Tone.Synth({
                oscillator: {
                  type: config.synth.oscillator.type
                },
                envelope: {
                  attack: config.synth.envelope.attack,
                  decay: config.synth.envelope.decay,
                  sustain: config.synth.envelope.sustain,
                  release: config.synth.envelope.release
                }
              }).connect(this.tremolo[i]);

            this.synths[i].triggerAttackRelease ("C4", 1, i, 1); 

        }) 
    }

    setConfig(audio_config){
        this.audio_config = audio_config;
        console.log(this.audio_config);
        this.audio_config.audio_channels.forEach((config,i)=>{
            this.tremolo[i].set({frequency:2^(config.tremolo_effect.frequency),depth:config.tremolo_effect.depth});
            //this.synths[i].volume.mute = config.mute;
            console.log(config.synth);
            this.synths[i].set({
                oscillator: {
                  type: config.synth.oscillator.type
                }
              }).connect(this.tremolo[i]);
              console.log(this.volumes[i]);
              this.volumes[i].set({"mute":true});
              this.volumes[i].mute=true;
              console.log(this.volumes[i]);

        })
    }
    dynamic_update_config(config){
        this.audio_config = config;
        console.log(config);
    }

    updatePan(index, timer_status, panX, panY, panZ){
      // console.log("update pan");
      // console.log(index,panX,panY,panZ);
      this.panners[index].setPosition(panX, panY, panZ);
      

    }

    playSpatialSound(index, uniform_data_height, panX, panY, panZ,now) {
      // first mode
      if (this.audio_config.audio_channels[index].mute==false){
        console.log(this.synths);
        console.log(uniform_data_height);
        this.synths[index].triggerAttack(this.caculate_freq(uniform_data_height),now);
        
        //this.synths[index].oscillator.frequency.value = this.caculate_freq(uniform_data_height);
        //this.oscillators[index].frequency.value = this.caculate_freq(uniform_data_height);
        this.panners[index].setPosition(panX, panY, panZ);
      }else{
        this.volumes[index].set({"mute":true});
      }
  }
  playPitchPanSound(index, timer_status, panX, panY, panZ) {
    var now  = Tone.now();
    var interval = this.audio_config.pitchnpan_interval/(this.num_of_sources+1);
    console.log("index",index,now+index*this.audio_config.pitchnpan_interval/(this.num_of_sources+1),now+(index+1)*this.audio_config.pitchnpan_interval/(this.num_of_sources+1))
    if (this.audio_config.audio_channels[index].mute==false){
      console.log(index,timer_status);
      this.synths[index].triggerAttack(this.caculate_freq(timer_status), now+index*interval);
      //this.synths[index].triggerRelease(now+interval*(index+1));
      this.panners[index].setPosition(panX, panY, panZ);
    }else{
      this.volumes[index].set({"mute":true});
    }
  }

    stopAllSound(){
        this.synths.forEach(function(element) { element.triggerRelease() })
    }

    caculate_freq(input_index){
        return 440* Math.pow(2, ((input_index)*this.pitch_range+this.pitch_start)/12);
      }
};