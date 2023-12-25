import {Engine, HemisphericLight, MeshBuilder, Scene, Vector3} from "@babylonjs/core";
import {BasicEnvironment} from "./environment/basicEnvironment.ts";

class BabylonApp {
    constructor() {
        const canvas = document.getElementById("babylonCanvas");
        const engine = new Engine((canvas as HTMLCanvasElement), true);
        const scene = new Scene(engine);

        const environment = new BasicEnvironment(scene);
        environment.buildScene((scene) => {
            new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
            MeshBuilder.CreateSphere("sphere", {diameter: 1}, scene);
        });


        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                this.showInspector(scene);
            }
        });

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }

    private showInspector(scene: Scene) {
        import("@babylonjs/core/Debug/debugLayer").then(() => {
            import("@babylonjs/inspector").then(() => {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            });
        });
    }

}

new BabylonApp();