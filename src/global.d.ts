export { };

declare module '*.glb';
declare module '*.png';

declare module 'meshline' {
  export const MeshLineGeometry: any;
  export const MeshLineMaterial: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
      // Three.js/React Three Fiber elements
      mesh: any;
      planeGeometry: any;
      shaderMaterial: any;
      boxGeometry: any;
      sphereGeometry: any;
      meshBasicMaterial: any;
      meshStandardMaterial: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      spotLight: any;
      group: any;
      scene: any;
      camera: any;
      perspectiveCamera: any;
      orthographicCamera: any;
    }
  }
}