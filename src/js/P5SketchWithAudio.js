import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

import Rectangle from './classes/Rectangle.js';

import audio from "../audio/rectangles-no-4.ogg";
import midi from "../audio/rectangles-no-4.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840;

        p.tempo = 96;

        p.barAsSeconds = Math.floor(((60 / p.tempo) * 4) * 100000) / 100000;

        p.barAsTicks = p.PPQ * 16;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    const noteSet1 = result.tracks[7].notes; // Sampler 1 - Dance Saw
                    const noteSet2 = result.tracks[1].notes; // Redurm 1 Copy - House Kit 05
                    const noteSet3 = result.tracks[0].notes; // Redurm 1 - Drum N Bass 03
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.scheduleCueSet(noteSet2, 'executeCueSet2', true);
                    p.scheduleCueSet(noteSet3, 'executeCueSet3', true);
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.colorMode(p.HSB);
            p.rectMode(p.CENTER);
            p.angleMode(p.DEGREES);
            p.populateRectanglesArray();
            p.frameRate(16);
            p.background(0);
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){
                p.reDraw();
            }
        }

        p.reDraw = () => {
            p.background(0);
            for (let i = 0; i < p.rectangles.length; i++) {
                const obj =  p.rectangles[i],
                    key = Object.keys(obj)[0],
                    rectangle = obj[key],
                    { x, y } = rectangle;
                rectangle.draw();
                rectangle.update();
                if (y === p.height && (x <= 0 || x >= p.width)) {
                    rectangle.reset();
                }
            }
        }

        p.rectangles = [];

        p.numOfCells = 32;

        p.resetCues = [18, 36, 54, 72, 90, 108, 126, 144, 162, 180, 198, 216];

        p.direction = 'left';

        p.executeCueSet1 = (note) => {
                const { ticks, midi, currentCue } = note,
                modulo = ticks % (p.barAsTicks * 2),
                xKey = p.direction === 'left' ? modulo / p.PPQ : (31 - modulo / p.PPQ),
                //key = modulo / p.PPQ + '-' + p.map(midi, 40, 47, 0, 7),
                key = xKey + '-' + Math.floor(p.random(0, 16)),
                //key = Math.floor(p.random(0, 32)) + '-' + Math.floor(p.random(0, 32)),
                obj = p.rectangles.find(o => Object.keys(o)[0] === key),
                rectangle = obj[key];

            if(p.resetCues.includes(currentCue)){
                p.resetOutline();
                p.direction = p.direction === 'left' ? 'right' : 'left';
            }

            rectangle.direction = p.direction;
            rectangle.width = 0;
            rectangle.height = 0;
            rectangle.animate = true;
            rectangle.drawOutline = true;
        }

        p.executeCueSet2 = (note) => {
            const { ticks, midi } = note,
                modulo = ticks % p.barAsTicks,
                lowerMap = p.direction === 'left' ?  22 : 9,
                upperMap = p.direction === 'left' ? 31 : 0,
                key = p.map(midi, 36, 45, 6, 15) + '-' + (31 - modulo / p.PPQ),
                obj = p.rectangles.find(o => Object.keys(o)[0] === key),
                rectangle = obj[key];
            if(modulo === 0){
                p.resetSwitchFill();
            }
            rectangle.switchFill = true;
            if(rectangle.currentFill === 'white'){
                rectangle.currentFill = rectangle.colour;
            }
            else {
                rectangle.currentFill = 'white';
            }
        }

        p.executeCueSet3 = (note) => {
            const { ticks, midi } = note,
                modulo = ticks % p.barAsTicks,
                lowerMap = p.direction === 'left' ? 22 : 9,
                upperMap = p.direction === 'left' ? 31 : 0,
                key = p.map(midi, 36, 45, 25, 16) + '-' + (31 - modulo / p.PPQ),
                obj = p.rectangles.find(o => Object.keys(o)[0] === key),
                rectangle = obj[key];
            rectangle.switchFill = true;
            if(rectangle.currentFill === 'white'){
                rectangle.currentFill = rectangle.colour;
            }
            else {
                rectangle.currentFill = 'white';
            }
        }

        p.resetOutline = () => {
            for (let i = 0; i < p.rectangles.length; i++) {
                const obj =  p.rectangles[i],
                    key = Object.keys(obj)[0],
                    rectangle = obj[key];
                rectangle.drawOutline = false;
            }
        }

        p.resetSwitchFill = () => {
            for (let i = 0; i < p.rectangles.length; i++) {
                const obj =  p.rectangles[i],
                    key = Object.keys(obj)[0],
                    rectangle = obj[key];
                rectangle.switchFill = false;
            }
        }

        p.populateRectanglesArray = () => {
            const width = p.width / p.numOfCells,
                height = p.height / p.numOfCells;
            for (let i = 0; i < p.numOfCells; i++) {
                for (let j = 0; j < p.numOfCells; j++) {
                    const x = parseInt(width * i + width /2),
                        y = parseInt(height * j + height /2), 
                        key = i + '-' + j,
                        hue = 360 / p.numOfCells * i,
                        brightness = 100 - 100 / p.numOfCells * j * 0.9,
                        saturation = 80 / p.numOfCells * j * 0.9 + 20,
                        colour = p.color(hue, saturation, 100),
                        obj = {};

                    obj[key] = new Rectangle(p, x, y, width, height, colour);
                    p.rectangles.push(obj);
                }
            }
        }

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
