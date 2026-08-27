/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2025 CollinDTurner All rights reserved.
 *******************************************************************************
*/

import * as THREE from 'three';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Three {

    constructor() {
        // get the container div
        this.container = $('#three-js-container');
        if (this.container.length === 0) {
            console.error('Container not found');
            return;
        }
        // set slide animation duration
        this.slideAnimationTime = 1500;

        // init three js animation
        this.initThreeJS();

        // slide three js in view
        $('#three-js-container').show("slide", { direction: "left"  }, this.slideAnimationTime);
    }

    initThreeJS() {
        // Set up the scene
        this.scene = new THREE.Scene();
    
        // Set up the camera
        this.camera = new THREE.PerspectiveCamera(75, this.container.width() / this.container.height(), 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        
        // Set up the renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.width(), this.container.height());
        this.renderer.shadowMap.enabled = true; // Enable shadows
        this.container.append(this.renderer.domElement);

        // load the backgoround texture (fake background)
        const textureLoader = new THREE.TextureLoader();
        this.scene.background = textureLoader.load('images/paper-texture-med.jpg');

        const bgGeometry = new THREE.PlaneGeometry(50, 50);  // Large plane as the background
        const bgMaterial = new THREE.MeshStandardMaterial({ 
            map: this.scene.background, 
            roughness: 0.8,
            side: THREE.DoubleSide
        });

        const bgPlane = new THREE.Mesh(bgGeometry, bgMaterial);
        bgPlane.position.set(0, 0, -5);  // Place it behind the scene
        bgPlane.receiveShadow = true;    // Allow it to receive shadows
        this.scene.add(bgPlane);
    
        // Ground Plane (for shadows)
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundTexture = textureLoader.load('images/paper-texture-med.jpg'); // Texture
        const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;  // Slightly below the main scene
        ground.receiveShadow = true;
        this.scene.add(ground);
    
        // Lighting (top left)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(-5, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Shadow settings
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;

        this.addCardWithText("My 3D Card");

    
        // Adjust canvas size on window resize
        window.addEventListener('resize', () => this.onWindowResize());
    
        // Start animation
        this.animate();
    }
    
    animate() {
        this.animationFrameID = requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = this.container.width() / this.container.height();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.width(), this.container.height());
    }

    addCardWithText(text = "Hello, Three.js!") {
        // Create card geometry and material
        const cardWidth = 4;
        const cardHeight = 2;
    
        const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
    
        // 🖼️ Create a canvas texture with text
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
    
        // Canvas size
        canvas.width = 512;
        canvas.height = 256;
    
        // Fill background color
        ctx.fillStyle = '#ffffff';  // Card color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        // Add text
        ctx.font = '40px Arial';
        ctx.fillStyle = '#333333';  // Text color
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        const cardMaterial = new THREE.MeshStandardMaterial({ map: texture });
    
        // Create the card mesh
        const card = new THREE.Mesh(cardGeometry, cardMaterial);
        card.position.set(0, 0, 0);  // Center the card in the scene
        card.castShadow = true;      // Enable shadow casting
        card.receiveShadow = true;   // Enable shadow receiving
    
        // Add the card to the scene
        this.scene.add(card);
    }
    

}

// initialize the Three class when the tab is created for threejs and is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded');
        return;
    }
    // only start if the page actually contains the container
    if (document.getElementById('three-js-container')) {
        new Three();
    }
});
