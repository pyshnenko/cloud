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
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});

const scale = 1;
const way: number = 120 * scale;

const models: {name: string, x: number, y: number, z: number, rx: number, ry: number, rz: number, message?: string}[] = [
	{name: '/scel.glb', x: 0, y: 0, z: -24 * scale, rx: 0, ry: 0, rz: 0},
	{name: '/PCB131.glb', x: -132 * scale, y: -34 * scale, z: -4 * scale, rx: 0, ry: 3.14, rz: 1.57, message: 'Опорный генератор\nПитание +27В\nВыдает 100МГц\nsin'},
	{name: '/PCB2.glb', x: -122 * scale, y: -24 * scale, z: 14 * scale, rx: 0, ry: 0, rz: 0, message: 'Первый гетеродин\nПринимает 100МГц\nВыдает (0.2 - 8)ГГц\nsin'},
	{name: '/PCB3.glb', x: -90.8 * scale, y: 46.4 * scale, z: 14 * scale, rx: 0, ry: 0, rz: 0, message: 'Второй гетеродин\nПринимает 100МГц\nВыдает (0.2 - 8)ГГц\nsin'}
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
			let groupTextAll: any = new THREE.Group();

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
				camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 4000 * scale );
				camera.position.set( 0, 0, window.innerWidth<500 ? -1000 * scale : -400 * scale ); //( - 5, 2.5, - 3.5 );
				scene.add( camera );

				scene.add( new THREE.AmbientLight( 0xcccccc ) );

				const light = new THREE.HemisphereLight( 0xffffff, 0x080820, 10 );
				scene.add( light );

				const pointLight = new THREE.PointLight( 0xffffff, 100 );
				//camera.add( pointLight );

				const loaderF = new FontLoader();
				const loaderTTF = new TTFLoader();
				//loaderF.load( 'https://spamigor.ru/library/threejs/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {
					loaderTTF.load( '/sunday.ttf', function ( json ) {

					const color = new THREE.Color( 0x292C2F );
					let font = new Font( json );

					const matLite = new THREE.MeshBasicMaterial( {
						color: color,
						transparent: true,
						opacity: 1,
						side: THREE.DoubleSide
					} );

					for (let i = 1; i<models.length; i++) {
						let groupTextOp: any = new THREE.Group();

						const message: string = models[i].message || '';
						const shapes = font.generateShapes( message, 5 * scale );
						const geometryF = new THREE.ShapeGeometry( shapes );
						geometryF.computeBoundingBox();
						geometryF.translate( 0, 0, 0 );

						const text = new THREE.Mesh( geometryF, matLite );
						text.position.z = 1 * scale;
						text.position.x = -35 * scale;
						text.position.y = 10 * scale;
						text.scale.x = scale;
						text.scale.y = scale;
						text.scale.z = scale;
						groupTextOp.add( text );

						const text2 = new THREE.Mesh( geometryF, matLite );
						text2.position.z = -1 * scale;
						text2.position.x = 35 * scale;
						text2.position.y = 10 * scale;
						text2.rotation.y = Math.PI;
						text2.scale.x = scale;
						text2.scale.y = scale;
						text2.scale.z = scale;
						groupTextOp.add( text2 );

						const geometryPl = new THREE.PlaneGeometry( 80 * scale, 50 * scale );
						const materialPl = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
						const plane = new THREE.Mesh( geometryPl, materialPl );
						groupTextOp.add( plane );

						groupTextOp.position.x = (i===1 ? -1 : 1) * models[i].x;//120 * scale;
						groupTextOp.position.y = (models[i].y/scale + (i===1 ? 100 : (i ===2 ? -100 : 80))) * scale;//60 * scale;
						groupTextOp.visible = false;

						groupTextAll.add(groupTextOp)
					}

				} );

				scene.add(groupTextAll);
				console.log(groupTextAll)

				const loader = new GLTFLoader();
				for (let i = 0; i<models.length; i++) {
					const gltf = await loader.loadAsync( models[i].name );//'models/gltf/PrimaryIonDrive.glb''https://spamigor.ru/library/threejs/examples/models/gltf/Parrot.glb'
					
					model[i] = gltf.scene;
					model[i].position.y = models[i].y;//-1 - PCB13  -1.51 -PCB3  -0.65 - PCB2  0 - scel
					model[i].position.x = models[i].x;//-1 - PCB13  -0.64 - PCB3  -0.63 - PCB2  0 - scel
					model[i].position.z = models[i].z;//0; // -0.6 scel

					model[i].rotation.x = models[i].rx;
					model[i].rotation.y = models[i].ry;
					model[i].rotation.z = models[i].rz;

					model[i].scale.set(scale,scale,scale);

					model[i].name = models[i].name
					//scene.add( model );

					groupInp.add( model[i] );
				}
				console.log(groupInp);

				groupInp.position.x = 50 * scale;
				groupInp.position.y = -90 * scale;
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
				controls.minDistance = 120 * scale;
				controls.maxDistance = 1200 * scale;

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
						else if (dat && dat.id>0 && (Math.abs(groupInp.children[dat.id].position.x - models[dat.id].x))>=(way * 0.97)) 
							moveId = {id: dat.id, sTime: Number(new Date()), forw: false}
					}
					click = false;
				}
				if ((moveId.id>=0)&&(moveId.id<groupInp.children.length)&&(moveId.sTime!==0)) {
					let bool1: boolean = (Math.abs(groupInp.children[moveId.id].position.x - models[moveId.id].x)>=way)
					if (bool1&&moveId.forw) {
						groupInp.children[moveId.id].position.x = models[moveId.id].x + (moveId.id===1 ? way: -way);
						groupInp.children[moveId.id].position.z = models[moveId.id].z;
						groupTextAll.children[ moveId.id - 1 ].visible = true
						moveId={id: -1, sTime: 0, forw: true};
					} else if (
						(moveId.id===1 && !moveId.forw && groupInp.children[moveId.id].position.x<=models[moveId.id].x) ||
						(moveId.id!==1 && !moveId.forw && groupInp.children[moveId.id].position.x>=models[moveId.id].x)
					) {
						groupInp.children[moveId.id].position.x = models[moveId.id].x;
						groupInp.children[moveId.id].position.z = models[moveId.id].z;
						groupTextAll.children[ moveId.id - 1 ].visible = false
						moveId={id: -1, sTime: 0, forw: true};
					}
					else {
						groupInp.children[moveId.id].position.x += ((moveId.id===1?1:-1)*(moveId.forw ? way : -way)/2000) * (Number(new Date()) - moveId.sTime);
						let delta = Math.abs(groupInp.children[moveId.id].position.x - models[moveId.id].x);
						groupInp.children[moveId.id].position.z = models[moveId.id].z + ((moveId.id!==1?(40*scale):(-40*scale)) * Math.sin(Math.PI*delta/way))
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
				if (obj&&((obj.hasOwnProperty('name'))||(obj.hasOwnProperty('parent')))) {
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