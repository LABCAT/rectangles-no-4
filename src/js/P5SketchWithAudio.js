import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

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

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    const noteSet1 = result.tracks[7].notes; // Sampler 1 - Dance Saw
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
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
            p.background(0);
            p.populateRectanglesArray();
            console.log(p.rectangles);
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){
                for (let i = 0; i < p.rectanglesToDraw.length; i++) {
                    const {x, y, width, height, colour } = p.rectanglesToDraw[i];
                    p.fill(colour);
                    p.rect(x,y, width, height)
                }
            }
        }

        p.rectangles = [];

        p.rectanglesToDraw = [];

        p.index = 0;

        p.executeCueSet1 = (note) => {
           p.rectanglesToDraw = p.rectangles[p.index];
           p.index++;
           if(p.index > 4) {
               p.index = 0;
           }
        }

        p.populateRectanglesArray = () => {
            for (let i = 0; i < 5; i++) {
                p.rectangles[i] = [];
                if(i){
                    const prevRects = p.rectangles[i - 1];
                    for (let j = 0; j < prevRects.length; j++) {
                        const { width, height } = prevRects[j],
                            newWidth = width /2,
                            newHeight = height /2;
                        for (let x = 0; x < p.width; x = x + newWidth) {
                            for (let y = 0; y < p.height; y = y + newHeight) {
                                p.rectangles[i].push(
                                    {
                                        x: x,
                                        y: y,
                                        width: newWidth,
                                        height: newHeight,
                                        colour: p.color(255, p.random(0, 255), 255),
                                    }
                                );
                                
                            }
                        }
                    }
                }
                else {
                    p.rectangles[i].push(
                        {
                            x: 0,
                            y: 0,
                            width: p.width,
                            height: p.height,
                            colour: p.color(255, p.random(0, 255), 255),
                        }
                    );
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
