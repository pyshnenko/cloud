import React, { useEffect, useState, useRef} from 'react';
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Box from '@mui/material/Box';

export default function ThreeF () {

    const trig = useRef(true);

        useEffect(()=>{
        let camera: any, scene: any, renderer: any, controls: any, stats: any;

        let mesh: any, mesh2: any, lightP2: any[]=[];
        const elem = document.getElementById('WebGL-output');
        const amount = parseInt( window.location.search.slice( 1 ) ) || 20;
        const count = Math.pow( amount, 3 );
        const speed = 10, speedF = 0.01;
        const posRandom = 5;
        const offset = ( amount - 1 ) / 1;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2( 1, 1 );

        const color = new THREE.Color();
        const white = new THREE.Color().setHex( 0xffffff );

        init();
        animate();

        function init() {
            
            camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 200 );
            camera.position.set( amount, amount, amount );
            camera.lookAt( 0,0,0 );

            scene = new THREE.Scene();
            scene.background = new THREE.Color( 0x0f0f0f );

            /*const light = new THREE.HemisphereLight( 0xffffff, 0x888888, 0 );
            light.position.set( 0, 1, 0 );
            scene.add( light );*/

            /*const lightP1 = new THREE.PointLight( 0xff0000, 500, 100 );
            lightP1.position.set( 10, 10, 10 );
            scene.add( lightP1 );*/

            lightP2[0] = new THREE.PointLight( 0xffffff, 1000, 250 );
            lightP2[0].position.set( Math.random()*offset-offset/2, Math.random()*offset-offset/2, Math.random()*offset-offset/2 );
            scene.add( lightP2[0] );

            lightP2[1] = new THREE.PointLight( 0xff0000, 1000, 250 );
            lightP2[1].position.set( Math.random()*offset-offset/2, Math.random()*offset-offset/2, Math.random()*offset-offset/2 );
            scene.add( lightP2[1] );

            lightP2[2] = new THREE.PointLight( 0x00ff00, 1000, 250 );
            lightP2[2].position.set( Math.random()*offset-offset/2, Math.random()*offset-offset/2, Math.random()*offset-offset/2 );
            scene.add( lightP2[2] );

            lightP2[3] = new THREE.PointLight( 0x0000ff, 1000, 250 );
            lightP2[3].position.set( Math.random()*offset-offset/2, Math.random()*offset-offset/2, Math.random()*offset-offset/2 );
            scene.add( lightP2[3] );

            /*const lightP3 = new THREE.PointLight( 0x0000ff, 500, 100 );
            lightP3.position.set( 10, -10, -10 );
            scene.add( lightP3 );*/

            /*const lightP4 = new THREE.PointLight( 0xffffff, 500, 100 );
            lightP4.position.set( 0, 0, 0 );
            scene.add( lightP4 );*/

            const geometry = new THREE.IcosahedronGeometry( 0.01, 1 );
            const material = new THREE.MeshPhongMaterial( { color: 0xffffff } );

            mesh = new THREE.InstancedMesh( geometry, material, count );

            let i = 0;

            const matrix = new THREE.Matrix4();

            for ( let x = 0; x < amount; x ++ ) {

                for ( let y = 0; y < amount; y ++ ) {

                    for ( let z = 0; z < amount; z ++ ) {

                        matrix.setPosition( 
                            offset - x + (Math.random()*posRandom-posRandom/2), 
                            offset - y + (Math.random()*posRandom-posRandom/2), 
                            offset - z + (Math.random()*posRandom-posRandom/2) 
                        );
                        /*matrix.setPosition( 
                            x + (Math.random()*posRandom-posRandom/2), 
                            y + (Math.random()*posRandom-posRandom/2), 
                            z + (Math.random()*posRandom-posRandom/2) 
                        );*/

                        mesh.setMatrixAt( i, matrix );
                        mesh.setColorAt( i, color );

                        i ++;

                    }

                }

            }
            mesh.position.set(-offset/2,-offset/2,-offset/2)
            scene.add( mesh );
            
            const geometry2 = new THREE.SphereGeometry( 1, 32, 16 );
            const material2 = new THREE.MeshPhongMaterial( { color: 0xffffff } );

            mesh2 = new THREE.InstancedMesh( geometry2, material2, 1 );

            const matrix2 = new THREE.Matrix4();
            
            matrix2.setPosition(0,0,0);

            mesh2.setMatrixAt( 0, matrix2 );
            mesh2.setColorAt( 0, color );
            let lightS1 = new THREE.PointLight( 0xffffff, 1000, 250 );
            lightS1.position.set( 1,1,1 );
            mesh2.add( lightS1 );
            let lightS2 = new THREE.PointLight( 0xffffff, 1000, 250 );
            lightS2.position.set( 1,1,-1 );
            mesh2.add( lightS2 );
            let lightS3 = new THREE.PointLight( 0xffffff, 1000, 250 );
            lightS3.position.set( 1,-1,1 );
            mesh2.add( lightS3 );
            let lightS4 = new THREE.PointLight( 0xffffff, 1000, 250 );
            lightS4.position.set( 1,-1,-1 );
            mesh2.add( lightS4 );
            let lightS5 = new THREE.PointLight( 0xffffff, 1000, 250 );
            lightS5.position.set( -1,1,1 );
            mesh2.add( lightS5 );
            let lightS6 = new THREE.PointLight( 0xffffff, 1000, 250 );
            lightS6.position.set( -1,1,-1 );
            mesh2.add( lightS6 );
            let lightS7 = new THREE.PointLight( 0xffffff, 1000, 250 );
            lightS7.position.set( -1,-1,1 );
            mesh2.add( lightS7 );
            let lightS8 = new THREE.PointLight( 0xffffff, 1000, 250 );
            lightS8.position.set( -1,-1,-1 );
            mesh2.add( lightS8 );
            console.log(offset)
            mesh2.position.set(offset/2,offset/2,offset/2)
            scene.add( mesh2 );
            console.log(scene);

            const gui = new GUI();
            gui.add( mesh, 'count', 0, count*2 );

            renderer = new THREE.WebGLRenderer( { antialias: true } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
            if (elem !== null) elem.appendChild( renderer.domElement );

            controls = new OrbitControls( camera, renderer.domElement );
            /*controls.enableDamping = true;
            controls.enableZoom = false;
            controls.enablePan = false;*/
            
            controls.listenToKeyEvents( window ); // optional

            //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

            controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
            controls.dampingFactor = 0.05;

            controls.screenSpacePanning = false;

            controls.minDistance = amount/10;
            controls.maxDistance = amount;

            stats = new Stats();
            if (elem!==null) {
                elem.appendChild( stats.dom );
            }

            window.addEventListener( 'resize', onWindowResize );
            document.addEventListener( 'mousemove', onMouseMove );

        }

        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize( elem?.offsetWidth||0, elem?.offsetHeight||0 );

        }

        function onMouseMove( event: MouseEvent ) {

            event.preventDefault();

            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        }
        function animate() {
            requestAnimationFrame( animate );
            controls.update();
            raycaster.setFromCamera( mouse, camera );
            const intersection = raycaster.intersectObject( mesh );
            for (let i = 0; i<lightP2.length; i++) {
                let x = lightP2[i].position.x>offset?
                            lightP2[i].position.x - speed*Math.random() :
                                lightP2[i].position.x<-offset?
                                    lightP2[i].position.x + speed*Math.random() : 
                                        lightP2[i].position.x + speed*Math.random() - speed/2;
                let y = lightP2[i].position.y>offset?
                            lightP2[i].position.y - speed*Math.random() :
                                lightP2[i].position.y<-offset?
                                    lightP2[i].position.y + speed*Math.random() : 
                                        lightP2[i].position.y + speed*Math.random() - speed/2;
                let z = lightP2[i].position.z>offset?
                            lightP2[i].position.z - speed*Math.random() :
                                lightP2[i].position.z<-offset?
                                    lightP2[i].position.z + speed*Math.random() : 
                                        lightP2[i].position.z + speed*Math.random() - speed/2;
                lightP2[i].position.set(x,y,z)
            }
            let x = mesh2.position.x>offset?
                mesh2.position.x - speedF*Math.random() :
                mesh2.position.x<-offset?
                mesh2.position.x + speedF*Math.random() : 
                mesh2.position.x + speedF*Math.random() - speed/2;
            let y = mesh2.position.y>offset?
                mesh2.position.y - speedF*Math.random() :
                mesh2.position.y<-offset?
                mesh2.position.y + speedF*Math.random() : 
                mesh2.position.y + speedF*Math.random() - speed/2;
            let z = mesh2.position.z>offset?
                mesh2.position.z - speedF*Math.random() :
                mesh2.position.z<-offset?
                mesh2.position.z + speedF*Math.random() : 
                mesh2.position.z + speedF*Math.random() - speed/2;
            mesh2.position.set(x,y,z)
            if ( intersection.length > 0 ) {
                const instanceId = intersection[ 0 ].instanceId;
                mesh.getColorAt( instanceId, color );

                if ( color.equals( white ) ) {
                    mesh.setColorAt( instanceId, color.setHex( Math.random() * 0xffffff ) );
                    mesh.instanceColor.needsUpdate = true;
                }
            }
            render();
            stats.update();
        }

        function render() {
            renderer.render( scene, camera );
        }
    }, [])

    return (
        <Box id="WebGL-output" sx={{position: 'absolute', top: 0, left: 0, width: '99vw', height: '99vh'}}></Box>
    );
}