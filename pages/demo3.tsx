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
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import DemoAccordeon from '../src/frontDesign/small/demoAccordeon';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});

const scale = 0.025;

const models: {name: string, x: number, y: number, z: number, rx: number, ry: number, rz: number}[] = [
	{name: '/scel.glb', x: 0, y: 0, z: -0.6, rx: 0, ry: 0, rz: 0},
	{name: '/PCB131.glb', x: -3.3, y: -0.85, z: -0.1, rx: 0, ry: 3.14, rz: 1.57},
	{name: '/PCB2.glb', x: -3.05, y: -0.6, z: 0.35, rx: 0, ry: 0, rz: 0},
	{name: '/PCB3.glb', x: -2.27, y: 1.16, z: 0.35, rx: 0, ry: 0, rz: 0}
]

const butts = [
	{top: 30, left: false, name: 'Золотолесье', url: 'https://gf.spamigor.ru', text: 'Начальная стадия форума ролевиков с казной, событиями и т д'},	
	{top: 30, left: true, name: 'GIT', url: 'https://github.com/pyshnenko', text: 'Мой гит'},
	{top: 20, left: false, name: 'THREE', url: '/three', text: 'THREE.JS. точки'},
	{top: 20, left: true, name: 'AR', url: 'https://ar.spamigor.ru', text: 'Дополненная реальность. Объект на маркере на изображении с камеры'},
	{top: 10, left: false, name: 'Облако', url: 'https://cloud.spamigor.ru', text: 'Облако наподобие Я.Диск. Можно создавать папки, скачивать папки (рекурсивно), загружать массово в том числе папки с вложениями'},
	{top: 10, left: true, name: 'Шарики', url: '/lines', text: 'Синхронизация 2 вкладок через локальное хранилище. Шарик вылетает в центре одной вкладки и прилетает к центру второй вкладки'},
	{top: 0, left: false, name: 'Домашняя', url: 'https://spamigor.ru', text: 'Домашняя страница. Если зарегистрироваться, будет чат со мной. Сообщения и файлы летят мне в телеграм'}
]

export default function NeonTest () {

    useEffect(()=>{
        let camera: any, stats: any, model: any[] = [];
			let composer: any, renderer: any, mixer: any, clock: any;
            let bloomPass: any;
			let group: any = new THREE.Group();
			const raycaster = new THREE.Raycaster();
			let groupInp: any = new THREE.Group();

			const scene = new THREE.Scene();

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
				scene.background = new THREE.Color(  0x292C2F );
				camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
				camera.position.set( 0, 0, -10 ); //( - 5, 2.5, - 3.5 );
				scene.add( camera );

				scene.add( new THREE.AmbientLight( 0xcccccc ) );

				const light = new THREE.HemisphereLight( 0xffffff, 0x080820, 10 );
				scene.add( light );

				const pointLight = new THREE.PointLight( 0xffffff, 100 );
				//camera.add( pointLight );

				const loaderF = new FontLoader();
				loaderF.load( 'https://spamigor.ru/library/threejs/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {

					const color = new THREE.Color( 0x006699 );

					const matDark = new THREE.MeshBasicMaterial( {
						color: color,
						side: THREE.DoubleSide
					} );

					const matLite = new THREE.MeshBasicMaterial( {
						color: color,
						transparent: true,
						opacity: 0.4,
						side: THREE.DoubleSide
					} );

					const message = '   Three.js\nStroke text.';

					const shapes = font.generateShapes( message, 10 );

					const geometryF = new THREE.ShapeGeometry( shapes );

					geometryF.computeBoundingBox();

					const xMid = - 0.05 * ( geometryF.boundingBox?.max.x||0 - (geometryF.boundingBox?.min.x||0) );

					geometryF.translate( xMid, 0, 0 );

					// make shape ( N.B. edge view not visible )

					const text = new THREE.Mesh( geometryF, matLite );
					text.position.z = - 150;
					text.scale.x = scale;
					text.scale.y = scale;
					text.scale.z = scale;
					scene.add( text );

					// make line shape ( N.B. edge view remains visible )

					/*const holeShapes: any[] = [];

					for ( let i = 0; i < shapes.length; i ++ ) {

						const shape = shapes[ i ];

						if ( shape.holes && shape.holes.length > 0 ) {

							for ( let j = 0; j < shape.holes.length; j ++ ) {

								const hole = shape.holes[ j ];
								holeShapes.push( hole );

							}

						}

					}

					shapes.push.apply( shapes, holeShapes );

					const style = SVGLoader.getStrokeStyle( 5, color.getStyle() );

					const strokeText = new THREE.Group();

					for ( let i = 0; i < shapes.length; i ++ ) {

						const shape = shapes[ i ];

						const points = shape.getPoints();

						const geometry = SVGLoader.pointsToStroke( points, style );

						geometry.translate( xMid, 0, 0 );

						const strokeMesh = new THREE.Mesh( geometry, matDark );
						strokeText.add( strokeMesh );

					}

					scene.add( strokeText );*/

				} );
				

				const loader = new GLTFLoader();
				for (let i = 0; i<models.length; i++) {
					const gltf = await loader.loadAsync( models[i].name );//'models/gltf/PrimaryIonDrive.glb''https://spamigor.ru/library/threejs/examples/models/gltf/Parrot.glb'
					
					model[i] = gltf.scene;
					model[i].position.y = models[i].y//-1 - PCB13  -1.51 -PCB3  -0.65 - PCB2  0 - scel
					model[i].position.x = models[i].x//-1 - PCB13  -0.64 - PCB3  -0.63 - PCB2  0 - scel
					model[i].position.z = models[i].z//0; // -0.6 scel

					model[i].rotation.x = models[i].rx;
					model[i].rotation.y = models[i].ry;
					model[i].rotation.z = models[i].rz;

					model[i].scale.set(scale,scale,scale);

					model[i].name = models[i].name
					//scene.add( model );

					groupInp.add( model[i] );
				}
				console.log(groupInp);

				/*const geometry = new THREE.BoxGeometry( 2*scale, 2*scale, 2*scale ); 
				const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
				const cube = new THREE.Mesh( geometry, material ); 
				group.add( cube );*/
				groupInp.position.x = 1.25;
				groupInp.position.y = -2.25;
				group.add(groupInp);
				scene.add( group );

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
				controls.maxDistance = 20;

				window.addEventListener( 'resize', onWindowResize );
			
				window.addEventListener( 'click', onMouseClick );
				window.addEventListener("touchstart", onTouch);

			}

			function onWindowResize() {

				const width = window.innerWidth;
				const height = window.innerHeight;

				camera.aspect = width / height;
				camera.updateProjectionMatrix();

				renderer.setSize( width, height );
				composer.setSize( width, height );

			}

			const mouse = new THREE.Vector2( 1, 1 );

			function onTouch( event: TouchEvent ) {

				event.preventDefault();
				mouse.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;
				click = true

			}

			function onMouseClick( event: MouseEvent ) {

				event.preventDefault();

				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
				click = true

			}

			let click: boolean = true;
			let moveId = {id: -1, sTime: 0, forw: true};

			function animate() {
				raycaster.setFromCamera( mouse, camera );
				const intersection = raycaster.intersectObject( scene );
				if (click) {
					if (intersection.length) {
						let dat: {id: number, name: string} | null = checkName(intersection[0].object);
						if (dat && dat.id>0 && (Math.abs(groupInp.children[dat.id].position.x - models[dat.id].x)<1)) 
							moveId = {id: dat.id, sTime: Number(new Date()), forw: true}
						else if (dat && dat.id>0 && (Math.abs(groupInp.children[dat.id].position.x - models[dat.id].x))>2.9) 
							moveId = {id: dat.id, sTime: Number(new Date()), forw: false}
					}
					click = false;
				}
				if ((moveId.id>=0)&&(moveId.id<groupInp.children.length)&&(moveId.sTime!==0)) {
					let bool1: boolean = (Math.abs(groupInp.children[moveId.id].position.x - models[moveId.id].x)>=3)
					if (bool1&&moveId.forw) {
						groupInp.children[moveId.id].position.x = models[moveId.id].x + (moveId.id===1 ? 3: -3);
						groupInp.children[moveId.id].position.z = models[moveId.id].z;
						moveId={id: -1, sTime: 0, forw: true};
					} else if (
						(moveId.id===1 && !moveId.forw && groupInp.children[moveId.id].position.x<=models[moveId.id].x) ||
						(moveId.id!==1 && !moveId.forw && groupInp.children[moveId.id].position.x>=models[moveId.id].x)
					) {
						groupInp.children[moveId.id].position.x = models[moveId.id].x;
						groupInp.children[moveId.id].position.z = models[moveId.id].z;
						moveId={id: -1, sTime: 0, forw: true};
					}
					else {
						groupInp.children[moveId.id].position.x += ((moveId.id===1?1:-1)*(moveId.forw ? 3 : -3)/2000) * (Number(new Date()) - moveId.sTime);
						let delta = Math.abs(groupInp.children[moveId.id].position.x - models[moveId.id].x);
						groupInp.children[moveId.id].position.z = models[moveId.id].z + ((moveId.id!==1?1:-1) * Math.sin(Math.PI*delta/3))
					}
					
				}
				const delta = clock.getDelta();
				let value = (Math.sin(Number(new Date())/1000)+1)/2;
                bloomPass.strength = 0.15;//value;
				group.rotation.y = 0//((Number(new Date())/1000)+1)/2;

				//mixer.update( delta );

				stats.update();

				composer.render();

			}

			function checkName (obj: any) {
				if ((obj.hasOwnProperty('name'))||(obj.hasOwnProperty('parent'))) {
					for (let i = 0; i< models.length; i++)
						if (obj.name === models[i].name) return {name: obj.name, id: i}
					return checkName(obj.parent)
				}
				else return null
			}
    }, [])

	const [expanded, setExpanded] = React.useState<string | false>(false);

	const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
		setExpanded(isExpanded ? panel : false);
	};

	const style = {
		margin: 2,
		position: 'fixed',
		width: '15%'
	}

    return (
		<Box>
			<ThemeProvider theme={darkTheme}>
				
			</ThemeProvider>
        	<Box id='container' style={{position: 'absolute', top: 0, left: 0}} />
		</Box>
    )
}