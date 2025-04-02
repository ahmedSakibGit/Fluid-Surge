import { useEffect, useRef } from "react";
import AppManager from "./App/AppManager";

const App = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const AppManagerRef = useRef<AppManager>(null);

    useEffect(() => {
        const init = async () => {
            if (!canvasRef.current) {
                return;
            }

            AppManagerRef.current = new AppManager(canvasRef.current);
            await AppManagerRef.current.init();
        };

        init();
    }, []);

    return <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default App;