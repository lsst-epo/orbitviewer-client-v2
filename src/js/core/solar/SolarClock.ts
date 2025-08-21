import { MathUtils } from "@fils/math";
import { Clock } from "three";
import { SolarTimeManager } from "./SolarTime";
import { CLOCK_SETTINGS } from "../Globals";

const HRSPSEC = 60*60*1000;

/**
 * Solar Clock
 * This class takes care of handling the simulation clock
 */
export class SolarClock {
    private iClock:Clock;
    private date:Date;
    private paused:boolean = false;
    private started:boolean = false
    private elapsedTime:number = 0;
    private speed:number = 0;
    private targetSpeed:number = 0;
    private edge1:Date = new Date('1900-01-01T00:00:00');
    private edge2:Date = new Date('2100-01-01T00:00:00');

    private todayRef = Date.now() * .001;

    private isLive:boolean = true;
    private timeDifference:number = 0;

    /**
     * 
     * @param clock - internal clock for handling ellapsed time
     */
    constructor(clock:Clock) {
        this.iClock = clock;
        this.date = new Date();        
        this.iClock.stop();

        window['solar'] = this;
    }

    get live():boolean {
        return this.isLive;
    }

    /**
     * Elapsed time
     */
    get time():number {
        // console.log(this.date.getTime() * .001);
        // return this.elapsedTime;
        return this.date.getTime() * .001 - this.todayRef;
    }

    /**
     * Get Date
     */
    get currentDate():Date {
        return this.date;
    }

    /**
     * Sets the number of hours equivalent per second.
     * 0 means real-time, 1 one hour per second, 2 two hours per second, etc.
     */
    set hoursPerSec(speed:number) {
        // const v = Math.max(0, value);
        this.targetSpeed = speed;
    }

    /**
     * The number of hours equivalent per second.
     * 0 means real-time, 1 one hour per second, 2 two hours per second, etc.
     */
    get hoursPerSec():number {
        return this.targetSpeed;
    }

    /**
     * Whether the clock is playing or not
     */
    get playing():boolean {
        return !this.paused && this.started;
    }


    /**
     * 
     * @returns true if the clock is in edge, false otherwise
     */
    get isInEdge():boolean {
        return this.date.getTime() >= this.edge2.getTime();
    }

    /**
     * Starts internal clock
     * 
     * @param date - The date where the simulation needs to start. Default: now
     */
    start(date:Date=new Date()) {
        if(this.started) return;
        this.elapsedTime = 0;
        this.date = date;
        this.iClock.start();
        this.paused = false;
        this.started = true;
    }

    /**
     * Starts internal clock
     * 
     * @param date - The date where the simulation needs to be set. Default: now
     */
    setDate(date:Date=new Date()) {        
        this.date = date;
        const now = new Date();
        this.timeDifference = Math.abs(now.getTime() - date.getTime());
    }

    /**
     * Stops internal clock
     */
    stop() {
        if(!this.started) return;
        this.iClock.stop();
        this.started = false;
    }

    /**
     * Pauses clock
     */
    pause() {
        if(!this.started) return;
        if(this.paused) return;
        this.paused = true;
        this.elapsedTime = this.iClock.elapsedTime;
        this.iClock.stop();
    }

    /**
     * Resumes clock
     */
    resume() {
        if(!this.started) return;
        if(!this.paused) return;
        this.paused = false;
        this.iClock.start();
    }

    reset() {
        this.stop();
        this.todayRef = Date.now() * .001;
        CLOCK_SETTINGS.speed = 0;
        this.targetSpeed = this.speed = 0;
        this.timeDifference = 0;
    }

    goLive() {
        this.reset();
        this.start();
        this.isLive = true;
    }

    /**
     * Updates clock
     * 
     * @returns current MJD
     */
    update(): number {
        const dt = this.iClock.getDelta();

        if(!this.paused && this.iClock.running) {
            this.elapsedTime = this.iClock.getElapsedTime();
        }

        if(Math.abs(this.targetSpeed) > 0 || this.paused || this.timeDifference > 2000) this.isLive = false;

        if(Math.abs(this.targetSpeed-this.speed) < .01) {
            this.speed = this.targetSpeed;
        } else {
            this.speed = MathUtils.lerp(this.speed, this.targetSpeed, .16);
        }
        
        this.date.setTime(this.date.getTime() + dt * 1000 + this.speed * HRSPSEC * dt);
        
        // cap
        if(this.date.getTime() < this.edge1.getTime()) {
            this.date.setTime(this.edge1.getTime())
        }

        if(this.date.getTime() > this.edge2.getTime()) {
            this.date.setTime(this.edge2.getTime())
        }        
        
        return SolarTimeManager.getMJDonDate(this.date);
    }

}