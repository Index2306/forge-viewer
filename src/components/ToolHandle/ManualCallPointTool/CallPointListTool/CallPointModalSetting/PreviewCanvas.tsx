// import React, {useRef, useState} from 'react';
// import {useLoader} from "@react-three/fiber";
// import {TextureLoader} from 'three/src/loaders/TextureLoader';
// import {useTexture} from "@react-three/drei";
//
// const PreviewCanvas: React.FC<PreviewCanvasProps> = ({props}) => {
//     // This reference gives us direct access to the THREE.Mesh object
//     const ref = useRef()
//
//     // Hold state for hovered and clicked events
//     const [hovered, hover] = useState(false)
//     const [clicked, click] = useState(false)
//
//     // @ts-ignore
//     const props2  = useTexture({
//         map: '/assets/symbols/B02-0041.svg',
//         displacementMap: '/assets/symbols/B02-0041.svg',
//         normalMap: '/assets/symbols/B02-0041.svg',
//         roughnessMap: '/assets/symbols/B02-0041.svg',
//         aoMap: '/assets/symbols/B02-0041.svg',
//     })
//
//     return (
//         <>
//             <ambientLight intensity={2} />
//             <directionalLight />
//             <mesh
//                 {...props}
//                 ref={ref}
//                 matrixAutoUpdate={false}
//                 matrix={window.NOP_VIEWER?.model?.getPageToModelTransform(1)}
//             >
//                 <planeBufferGeometry attach="geometry" args={[0.3, 0.3]} />
//                 <meshStandardMaterial {...props2} />
//             </mesh>
//         </>
//     );
// };
//
// export default PreviewCanvas;
//
// interface PreviewCanvasProps {
//     props?: any
// }