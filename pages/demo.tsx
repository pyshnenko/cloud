import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export default function NeonTest () {

    useEffect(()=>{
        let camera: any, stats: any, model: any;
			let composer: any, renderer: any, mixer: any, clock: any;
            let bloomPass: any;

			const params: any = {
				threshold: 0,
				strength: 1,
				radius: 0,
				exposure: 1
			};

			init();

			async function init() {

				const container = document.getElementById( 'container' );

				clock = new THREE.Clock();

				const scene = new THREE.Scene();

				camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
				camera.position.set( 0, 0, -10 );//( - 5, 2.5, - 3.5 );
				scene.add( camera );

				scene.add( new THREE.AmbientLight( 0xcccccc ) );

				const pointLight = new THREE.PointLight( 0xffffff, 100 );
				camera.add( pointLight );

				const loader = new GLTFLoader();
				const gltf = await loader.loadAsync( '/scene.glb' );//'models/gltf/PrimaryIonDrive.glb''https://spamigor.ru/library/threejs/examples/models/gltf/Parrot.glb'

				model = gltf.scene;
                model.position.y = -1.5;
                model.scale.set(0.5,0.5,0.5);
				scene.add( model );

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				renderer.toneMapping = THREE.ReinhardToneMapping;
				container?.appendChild( renderer.domElement );

				//

				const renderScene = new RenderPass( scene, camera );

				bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1, 0.4, 0.85 );
				bloomPass.threshold = params.threshold;
				bloomPass.strength = params.strength;
				bloomPass.radius = params.radius;

				const outputPass = new OutputPass();

				composer = new EffectComposer( renderer );
				composer.addPass( renderScene );
				composer.addPass( bloomPass );
				composer.addPass( outputPass );

				stats = new Stats();

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.maxPolarAngle = Math.PI * 1;
				controls.minDistance = 3;
				controls.maxDistance = 10;

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				const width = window.innerWidth;
				const height = window.innerHeight;

				camera.aspect = width / height;
				camera.updateProjectionMatrix();

				renderer.setSize( width, height );
				composer.setSize( width, height );

			}

			function animate() {

				const delta = clock.getDelta();
				let value = (Math.sin(Number(new Date())/1000)+1)*3;
                bloomPass.strength = value;
				model.rotation.y = ((Number(new Date())/1000)+1)/2;

				//mixer.update( delta );

				stats.update();

				composer.render();

			}
    }, [])

	const style = {
		margin: 2,
		position: 'fixed',
	}

    return (
		<Box>
			<Box sx={{
				position: 'relative',
				display: 'flex',
				zIndex: 1,
				flexDirection: 'column',
    			alignItems: 'center'
			}}>
				<Button sx={{...style}} variant="contained" onClick={()=>{window.location.href = 'https://spamigor.ru'}}>Домой</Button>	
				<Button sx={{...style, top: '10%', left: '10%'}} variant="contained" onClick={()=>{window.location.href = '/lines'}}>Линии</Button>	
				<Button sx={{...style, top: '10%', right: '10%'}} variant="contained" onClick={()=>{window.location.href = 'https://cloud.spamigor.ru'}}>Облако</Button>	
				<Button sx={{...style, top: '20%', left: '10%'}} variant="contained" onClick={()=>{window.location.href = 'https://ar.spamigor.ru'}}>AR</Button>
				<Button sx={{...style, top: '20%', right: '10%'}} variant="contained" onClick={()=>{window.location.href = '/three'}}>Three</Button>
				<Button sx={{...style, top: '30%', left: '10%'}} variant="contained" onClick={()=>{window.location.href = 'https://github.com/pyshnenko'}}>GIT</Button>
				<Button sx={{...style, top: '30%', right: '10%'}} variant="contained" onClick={()=>{window.location.href = 'https://gf.spamigor.ru'}}>Золотолесье</Button>
			</Box>
        	<Box id='container' style={{position: 'absolute', top: 0, left: 0}} />
		</Box>
    )
}