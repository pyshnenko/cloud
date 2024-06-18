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
				camera.position.set( - 5, 2.5, - 3.5 );
				scene.add( camera );

				scene.add( new THREE.AmbientLight( 0xcccccc ) );

				const pointLight = new THREE.PointLight( 0xffffff, 100 );
				camera.add( pointLight );

				const loader = new GLTFLoader();
				const gltf = await loader.loadAsync( '/scene.glb' );//'models/gltf/PrimaryIonDrive.glb''https://spamigor.ru/library/threejs/examples/models/gltf/Parrot.glb'

				model = gltf.scene;
                model.position.y = -1;
                model.position.z = -0.7;
                model.scale.set(0.5,0.5,0.5);
				scene.add( model );

				/*mixer = new THREE.AnimationMixer( model );
				const clip = gltf.animations[ 0 ];
				mixer.clipAction( clip.optimize() ).play();*/

				//

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				renderer.toneMapping = THREE.ReinhardToneMapping;
				container?.appendChild( renderer.domElement );

				//

				const renderScene = new RenderPass( scene, camera );

				bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
				bloomPass.threshold = params.threshold;
				bloomPass.strength = params.strength;
				bloomPass.radius = params.radius;

				const outputPass = new OutputPass();

				composer = new EffectComposer( renderer );
				composer.addPass( renderScene );
				composer.addPass( bloomPass );
				composer.addPass( outputPass );

				//

				stats = new Stats();
				//container?.appendChild( stats.dom );

				//

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.maxPolarAngle = Math.PI * 1;
				controls.minDistance = 3;
				controls.maxDistance = 8;

				//

				/*const gui = new GUI();

				const bloomFolder = gui.addFolder( 'bloom' );

				bloomFolder.add( params, 'threshold', 0.0, 1.0 ).onChange( function ( value ) {

					bloomPass.threshold = Number( value );

				} );

				bloomFolder.add( params, 'strength', 0.0, 3.0 ).onChange( function ( value ) {

					bloomPass.strength = Number( value );

				} );

				gui.add( params, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

					bloomPass.radius = Number( value );

				} );

				const toneMappingFolder = gui.addFolder( 'tone mapping' );

				toneMappingFolder.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {

					renderer.toneMappingExposure = Math.pow( value, 4.0 );

				} );*/

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

    return (
		<Box>
			<Box sx={{
				position: 'relative',
				display: 'flex',
				zIndex: 1,
				flexDirection: 'column',
    			alignItems: 'center'
			}}>
				<Box>
					<Button sx={{margin: 2}} variant="contained" onClick={()=>{window.location.href = '/lines'}}>Линии</Button>				
				</Box>
				<Box sx={{
					width: '100%',
					display: 'flex',
					justifyContent: 'space-around'
				}}>
					<Button sx={{margin: 2}} variant="contained" onClick={()=>{window.location.href = 'https://spamigor.ru'}}>Домой</Button>			
					<Button sx={{margin: 2}} variant="contained" onClick={()=>{window.location.href = 'https://cloud.spamigor.ru'}}>Облако</Button>	
				</Box>
				<Box sx={{
					width: '100%',
					display: 'flex',
					justifyContent: 'space-between'
				}}>
					<Button sx={{margin: 2}} variant="contained" onClick={()=>{window.location.href = 'https://ar.spamigor.ru'}}>AR</Button>
					<Button sx={{margin: 2}} variant="contained" onClick={()=>{window.location.href = '/three'}}>Three</Button>
				</Box>
				<Box sx={{
					width: '100%',
					display: 'flex',
					justifyContent: 'space-between'
				}}>
					<Button sx={{margin: 2}} variant="contained" onClick={()=>{window.location.href = 'https://github.com/pyshnenko'}}>GIT</Button>
					<Button sx={{margin: 2}} variant="contained" onClick={()=>{window.location.href = 'https://gf.spamigor.ru'}}>Золотолесье</Button>
				</Box>
			</Box>
        	<Box id='container' style={{position: 'absolute', top: 0, left: 0}} />
		</Box>
    )
}