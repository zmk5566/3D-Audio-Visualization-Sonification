import {InteractiveLineChart} from './LineCharter.js';
import { ThreeDimensionAuidoCore } from './3DMusicCore.js';
import {Simple3Dvis} from './Simple3Dvis.js';

export class StateTimer {
    constructor(audioctx,config) {
        this.audioctx = audioctx;
        this.timer = 0;
        this.time_consume = config.time_duration;
        this.config = config;
        this.stopped = true;
        this.refTime = 0;
        this.previousRef = -9999;
        this.intervalCall;
        this.chart = new InteractiveLineChart();
        this.vis3d = new Simple3Dvis(config,this.trigger_xr_input.bind(this));
        this.music_core ;
        this.totalData = [];
    }

    init(){
        this.chart.drawChart();
        this.vis3d.init();
        this.vis3d.animate();

    }

    initcore(){
        this.music_core= new ThreeDimensionAuidoCore(this.chart.gettotalData().length,this.config.audio_config)
        this.music_core.init();
    }

    get_global_config(){
        return this.config;
    }

    trigger_xr_input(){
        console.log("triggered xr input");
        this.start();

    }



    

    startAnim(time) {
  
        // Set left style to a function of time if it is not stopped
        if (!this.stopped) {
            this.timer = this.get_uniformed_time_elapse();
            if (this.timer>=1){
                console.log("ready to stop , current time elapse： " + this.timer);
                this.stop();
            }else{
            this.update_loop();
            window.requestAnimationFrame(this.startAnim.bind(this));
        }
        }
    }

    update_loop(){

 


        if (this.config.audio_config.mode === "spatial"){

        this.totalData = this.chart.trigger_line_movement(this.timer);
        this.totalData.forEach((d,i)=>{
            this.process_each_data_point(d,i);
        });
        //this.update_pan();
        // this.totalData.forEach((d,i)=>{
        //     this.process_each_pan_data_point(d,i);
        // })


        }else if(this.config.audio_config.mode === "pitchnpan"){
            //update only the passed time is over a threashold
            if (this.audioctx.now() - this.previousRef > this.config.audio_config.pitchnpan_interval){
                this.previousRef = this.audioctx.now();
                this.totalData = this.chart.trigger_line_movement(this.timer);
                this.totalData.forEach((d,i)=>{
                    this.process_each_data_point(d,i);
                })

            }
            this.totalData.forEach((d,i)=>{
                this.process_each_pan_data_point(d,i);
            })
        }else if(this.config.audio_config.mode === "running_pitch_pan"){
            //console.log("running pitch pan");
            //update only the passed time is over a threashold
            this.previousRef = this.audioctx.now();
            this.totalData = this.chart.trigger_line_movement(this.timer);
            this.totalData.forEach((d,i)=>{
                this.process_each_data_point(d,i);
            })
        }

        
        
        //console.log(this.chart.gettotalData()[2]);
    }

    update_config(config){
        this.stop();
        if (this.music_core == undefined){
            this.totalData = this.chart.gettotalData();
            //this.music_core = new ThreeDimensionAuidoCore(this.totalData.length,this.config.audio_config);
        }
        this.config = config;
        this.time_consume = config.time_duration;
        this.music_core.setConfig(config.audio_config);
        this.vis3d.setConfig(config);
    }

    update_pan(config){
        this.config = config;
        this.music_core.dynamic_update_config(config.audio_config);
        this.vis3d.update_pan(config);
    }

    process_each_pan_data_point(data_point,index){
        var [x_cord,y_cord,z_cord]= 
        value2DtoCartersian(this.config.radius,data_point.uniform_value,this.timer,0,1,-this.config.theta/2,+this.config.theta/2,0,1,-0.5,+0.5);
        console.log(data_point);
        var temp_coord = this.vis3d.get_localPoints(x_cord,y_cord,z_cord);
        console.log(temp_coord)
        this.music_core.updatePan(index,this.timer,temp_coord[1]*this.config.dynamic_scale,temp_coord[0]*this.config.dynamic_scale,temp_coord[2]*this.config.dynamic_scale);       
    }


    process_each_data_point(data_point,index){
        //console.log(index,"timer",this.timer,"value",data_point.uniform_value);

        if (this.config.audio_config.mode === "spatial"){
        var [x_cord,y_cord,z_cord]= 
            value2DtoCartersian(this.config.radius,this.timer,data_point.uniform_value,0,1,-this.config.theta/2,+this.config.theta/2,0,1,-0.5,+0.5);
            var temp_coord = this.vis3d.get_localPoints(x_cord,y_cord,z_cord);
            console.log( data_point.uniform_value, this.timer);
            
            this.music_core.playSpatialSound(index,data_point.uniform_value,temp_coord[1]*this.config.dynamic_scale,temp_coord[0]*this.config.dynamic_scale,temp_coord[2]*this.config.dynamic_scale,Tone.now());
            this.vis3d.update_point(index,y_cord*this.config.dynamic_scale,z_cord*this.config.dynamic_scale,-x_cord*this.config.dynamic_scale,data_point.color);
        } else
        if (this.config.audio_config.mode === "running_pitch_pan"){
        var [x_cord,y_cord,z_cord]= 

        value2DtoCartersian(this.config.radius,data_point.uniform_value,this.timer,0,1,-this.config.theta/2,+this.config.theta/2,0,1,-0.5,+0.5);
        var temp_coord = this.vis3d.get_localPoints(x_cord,y_cord,z_cord);

        this.music_core.playSpatialSound(index,this.timer,temp_coord[1]*this.config.dynamic_scale,temp_coord[0]*this.config.dynamic_scale,temp_coord[2]*this.config.dynamic_scale);
        this.vis3d.update_point(index,y_cord*this.config.dynamic_scale,z_cord*this.config.dynamic_scale,-x_cord*this.config.dynamic_scale,data_point.color);
  }
        
        
        else if(this.config.audio_config.mode === "pitchnpan"){
            console.log("pitchnpan");
            var [x_cord,y_cord,z_cord]= 
            value2DtoCartersian(this.config.radius,data_point.uniform_value,this.timer,0,1,-this.config.theta/2,+this.config.theta/2,0,1,-0.5,+0.5);
            var temp_coord = this.vis3d.get_localPoints(x_cord,y_cord,z_cord);
            console.log(x_cord,y_cord,z_cord);
            console.log(temp_coord);
            this.music_core.playPitchPanSound(index,this.timer,temp_coord[1]*this.config.dynamic_scale,temp_coord[0]*this.config.dynamic_scale,temp_coord[2]*this.config.dynamic_scale);
            this.vis3d.update_point(index,y_cord*this.config.dynamic_scale,z_cord*this.config.dynamic_scale,-x_cord*this.config.dynamic_scale,data_point.color);
        }
    }

    start(){
 
        console.log("started");
        console.log(this.audioctx.now());

        this.totalData = this.chart.gettotalData();
        //TouchList.totalData.update_config
        //this.music_core = new ThreeDimensionAuidoCore(this.totalData.length,this.config.audio_config);
        console.log(this.totalData.length);
        console.log("total channels of data:  "+ this.totalData.length); 
        
        this.timer = 0;
        this.refTime = 0;
        this.stopped = false;
        this.refTime = this.audioctx.now();

        this.chart.trigger_display_lines();
        window.requestAnimationFrame(this.startAnim.bind(this));
        this.vis3d.start_playing_points();

        
    }

    // init(){
    //     // this.vis3d.init();
    //     // this.chart.init();
    //     this.music_core.init();
    // }

    get_uniformed_time_elapse(){
        return (1-((this.time_consume-(this.audioctx.now() - this.refTime))/this.time_consume));
    }

    stop() {
        if (!this.stopped){
        console.log("stopped");
        this.timer = 0;
        this.stopped = true;
        this.refTime = 0;
        this.chart.trigger_end_display_lines();
        this.music_core.stopAllSound();
        this.vis3d.stop_playing_points();
        }else{
            console.log("already stopped");
        }

    }

    getState() {
        return this.stopped;
    }

    getTimer() {
        return this.timer;
    }


}


/*
    * in our case, r should be the distance from the center of the cylinder to the point and suppose to be fixed
    * theta should be the angle between the x-axis and the point
*/ 

