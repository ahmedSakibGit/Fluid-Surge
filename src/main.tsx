import * as BABYLON from "@babylonjs/core";
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
  
(globalThis as any).BABYLON = BABYLON;
createRoot(document.getElementById('root')!).render(
    <App />
)
