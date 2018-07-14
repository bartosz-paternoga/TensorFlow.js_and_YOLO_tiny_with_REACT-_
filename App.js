import React, { Component } from 'react';
import * as tf from '@tensorflow/tfjs';
import yolo, { downloadModel } from 'tfjs-yolo-tiny';

import './App.css';
import Comp from './component1';



class App extends Component {

  state = {
      model:{},
      name: '',
      prediction:'',
      probability:''
    }


   startWebcam = () =>{
      
      navigator.getUserMedia (

        // constraints
              {
                 video: true,
                 audio: false
              },

        // successCallback
              function(a) {   
              const video = document.querySelector('video');

              video.srcObject = a; 

              },

        // errorCallback
              function() {}

      );

      this.main();

    } 

    

     stopWebcam = () => {

       window.location.reload();
       
     }  



     main = async () => {

      try {
       
        var model = await downloadModel();
        this.model = model;
        this.setState({model});      
        this.run();

      } catch(e) {
        console.error(e);
      }
    }



    run = async () => {
      while (true) {

        this.clearRects();
       
        const inputImage = this.capture();

        const t0 = performance.now();

        const prediction = await yolo(inputImage, this.model);

        const t1 = performance.now();

        console.log("YOLO inference took " + (t1 - t0) + " milliseconds.");


        prediction.forEach(i=> {
     
          const name = i.className;
          this.state.name= name;
          this.setState({name});

          const probability = ((i.classProb.toFixed(4))*100);
          this.state.probability= probability;
          this.setState({probability});
       
        });
        
        
         const a = prediction.length ;

          if( a !== 1) {

          const probability = '';
          this.state.probability= probability;
          this.setState({probability});
         
          const name = '';
          this.state.name = name;
          this.setState({name});
        } 



        prediction.forEach(box => {
          const {
            top, left, bottom, right, classProb, className,
          } = box;

          this.drawRect(left, top, right-left, bottom-top,
            `${className} Confidence: ${Math.round(classProb * 100)}%`)

        });


         await tf.nextFrame();

      }
    }

 

     drawRect = (x, y, w, h, text = '', color = 'blue') => {

      const webcamElem = document.getElementById('webcam-wrapper');
      const rect = document.createElement('div');
      rect.classList.add('rect');
      rect.style.cssText = `top: ${y}px; left: ${x}px; width: ${w}px; height: ${h}px; border-color: ${color}`;

      const label = document.createElement('div');
      label.classList.add('label');
      label.innerText = text;
      rect.appendChild(label);      
        
      webcamElem.appendChild(rect);
    }



    clearRects = () => {
      const rects = document.getElementsByClassName('rect');
      while(rects[0]) {
        rects[0].parentNode.removeChild(rects[0]);
      }
    }




      capture =  () => {
        return tf.tidy(() => {
          // Reads the image as a Tensor from the webcam <video> element.
          const webcamImage = tf.fromPixels(document.querySelector('video'));

          // Crop the image so we're using the center square of the rectangular
          // webcam.
          const croppedImage = this.cropImage(webcamImage);

          // Expand the outer most dimension so we have a batch size of 1.
          const batchedImage = croppedImage.expandDims(0);

          // Normalize the image between -1 and 1. 
          return batchedImage.toFloat().div(tf.scalar(255));
        });
      }


      cropImage =  (img) => {
          const size = Math.min(img.shape[0], img.shape[1]);
          const centerHeight = img.shape[0] / 2;
          const beginHeight = centerHeight - (size / 2);
          const centerWidth = img.shape[1] / 2;
          const beginWidth = centerWidth - (size / 2);
          return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
        }    




   render() {
        
        return (
                 <Comp
                 startWebcam = {this.startWebcam}
                 stopWebcam = {this.stopWebcam}
                 nameyolo = {this.state.name}
                 probability = {this.state.probability}

                 />
      
       );
    }

};


export default App;
