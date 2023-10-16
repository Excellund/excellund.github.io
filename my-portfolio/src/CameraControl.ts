import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';
export {};

class CameraControl {
    zoomMode: boolean = false
    press: boolean = false
    sensitivity: number = 0.02
  
    constructor(renderer: THREE.Renderer, public camera: THREE.PerspectiveCamera, updateCallback:() => void){
        renderer.domElement.addEventListener('mousemove', (event: { button: number; movementX: number; movementY: number; }) => {
            if(!this.press){ return }
  
            if(event.button == 0){
                rotateAboutPoint(camera, new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), -event.movementX/100, true, Math.PI / 6, Math.PI / 3);
                rotateAboutPoint(camera, new THREE.Vector3(0,0,0), new THREE.Vector3(1,0,0), -event.movementY/100, true, Math.PI / 6, Math.PI / 3);
            }
  
            updateCallback()
        })    

        function rotateAboutPoint(obj, point, axis, theta, pointIsWorld) {
            pointIsWorld = pointIsWorld === undefined ? false : pointIsWorld;
        
            if (pointIsWorld) {
                if (obj.parent) {
                    obj.parent.localToWorld(obj.position);
                }
            }
        
            obj.position.sub(point);
        
            // Calculate the current rotation angle
            const currentAngle = obj.position.angleTo(axis);
        
            obj.position.applyAxisAngle(axis, theta);
        
            // Reorient the object to look at the specified point
            obj.lookAt(point);
        
            if (pointIsWorld) {
                if (obj.parent) {
                    obj.parent.worldToLocal(obj.position);
                }
            }
        
            if (obj.parent) {
                // Rotate the object around the specified axis by the difference in angles
                obj.rotateOnAxis(axis, angleDifference);
            }
        }
        
        
  
        renderer.domElement.addEventListener('mousedown', () => { this.press = true })
        renderer.domElement.addEventListener('mouseup', () => { this.press = false })
        renderer.domElement.addEventListener('mouseleave', () => { this.press = false })
  
        document.addEventListener('keydown', (event): void => {
            if(event.key == 'Shift'){
                this.zoomMode = true
            }
        })
  
        document.addEventListener('keyup', (event): void => {
            if(event.key == 'Shift'){
                this.zoomMode = false
            }
        })
  
        renderer.domElement.addEventListener('mousewheel', (event: { preventDefault: () => void; deltaY: number; }) => {
            const point = new THREE.Vector3(0,0,0);

            event.preventDefault(); /// prevent scrolling
  
            let zoom = this.camera.zoom; // take current zoom value
            zoom += event.deltaY * -0.002; /// adjust it
            zoom = Math.min(Math.max(1, zoom), 4); /// clamp the value

            this.camera.zoom = zoom /// assign new zoom value
            this.camera.updateProjectionMatrix(); /// make the changes take effect
            camera.lookAt(point);
  
            updateCallback()
        })
    }
  }

  export default CameraControl;