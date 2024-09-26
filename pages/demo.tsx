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

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});

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
				<Box sx={{
					position: 'relative',
					display: 'flex',
					zIndex: 1,
					flexDirection: 'column',
					alignItems: 'center'
				}}>	
					{butts.map((item: any)=>{
						return (
							<DemoAccordeon 
								top={item.top} 
								left={item.left} 
								url={item.url} 
								name={item.name} 
								key={item.name} 
								expanded={expanded} 
								setExpanded={setExpanded}
								text={item.text}
							/>	
						)
					})}
				</Box>
			</ThemeProvider>
        	<Box id='container' style={{position: 'absolute', top: 0, left: 0}} />
		</Box>
    )
}