/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2024 CollinDTurner All rights reserved.
 *******************************************************************************
*/
import * as THREE from 'three';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Three {

    constructor() {
        // get the container div
        this.container = $('#three-js-container');
        if (!this.container) {
            console.error('Container not found');
            return;
        }
        // hide some things
        $('#three-js-container').hide();
        $('#mini-map-container').hide();

        // set slide animation duration
        this.slideAnimationTime = 1500;
        
        // set the start and stop buttons
        $('#start-three-js').on('click', this.start.bind(this));
        $('#kill-three-js').on('click', this.kill.bind(this));
    }

    initThreeJS() {
        // Set up the scene
        this.scene = new THREE.Scene();

        // Set up the camera
        this.camera = new THREE.PerspectiveCamera(75, this.container.width() / this.container.height(), 0.1, 1000);
        this.camera.position.set(0, 10, 10);

        // Set up the renderer
        this.renderer = new THREE.WebGLRenderer();
        //this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.width(), this.container.height());
        this.container.append(this.renderer.domElement);

        // lighting
        const ambientLight = new THREE.AmbientLight(0x404040);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10).normalize();
        this.scene.add(ambientLight, directionalLight);

        // add the desk to the scene
        /*const mtlLoader = new MTLLoader();
        mtlLoader.load('/models/keyboard/razor-keyboard.mtl', (materials) => {
            materials.preload();
            // then load the .obj file using the materials
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load('/models/keyboard/razor-keyboard.obj', (object) => {
                // Scale the object down
                object.scale.set(0.01, 0.01, 0.01);
                this.scene.add(object);
            });
        });*/

        const gltfLoader = new GLTFLoader();
        gltfLoader.load(
            'models/desk/scene.gltf',
            function(gltf) {
                let desk = gltf.scene;
                desk.scale.set(0.1, 0.1, 0.1);
                this.scene.add(desk);
            }.bind(this)
        );
        
        // set up OrbitControls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // TESTING PURPOSES
        const gridHelper = new THREE.GridHelper(100, 100);
        this.scene.add(gridHelper);

        // Adjust canvas size on window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start the animation
        this.animate();
    }

    animate() {
        this.animationFrameID = requestAnimationFrame(this.animate.bind(this));
        // Rotate the cube
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = this.container.width() / this.container.height();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.width(), this.container.height());
    }

    start() {
        // init three js animation
        this.initThreeJS();
        // slide three js in view
        $('#three-js-info').hide("slide",      { direction: "right" }, this.slideAnimationTime);
        $('#three-js-container').show("slide", { direction: "left"  }, this.slideAnimationTime);
        $('#kill-three-js').show("slide",      { direction: "left"  }, this.slideAnimationTime);
    }

    kill() {
        // slide info into view
        $('#kill-three-js').hide("slide",      { direction: "left"  }, this.slideAnimationTime);
        $('#three-js-info').show("slide",      { direction: "right" }, this.slideAnimationTime);
        $('#three-js-container').hide("slide", { direction: "left"  }, this.slideAnimationTime, () => {
            // kill three js
            $('#three-js-container').find('canvas').remove();
            cancelAnimationFrame(this.animationFrameID);
        });
    }

}

// Initialize the Three class when the tab is created for threejs and is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded');
        return;
    }
    // init js
    new Three();
});