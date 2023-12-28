import {Color3, Engine, PointLight, Scene, Vector3} from "@babylonjs/core";
import {ImmersiveEnvironment} from "./environment/immersiveEnvironment.ts";

class BabylonApp {
    constructor() {
        const canvas = document.getElementById("babylonCanvas");
        const engine = new Engine((canvas as HTMLCanvasElement), true);
        const scene = new Scene(engine);

        const environment = new ImmersiveEnvironment(scene);
        environment.onReadyObservable.add((state) => {
            if (state.xrReady && state.physicsReady) {
                //scene.fogColor = new Color3(0, 0, 0);
                //scene.fogEnabled = true;
                //scene.fogMode = Scene.FOGMODE_EXP;
                environment.buildScene((scene) => {
                    const light = new PointLight("light1", new Vector3(1, 50, 0), scene);
                    light.intensity = .4;
                    //light.groundColor = new Color3(0.5, 0.5, 0.5);
                });
                environment.build.skybox(999, "#FF0000");
                // const plane = environment.build.plane(new Vector3(0, -1, 0), 10000, 10000, "#224411");
                //plane.rotation.x =Math.PI / 2;
                environment.build.groundMap(new Vector3(0, -1, 0), 1000, 1000);
                for (let i = 0; i < 100; i++) {
                    const x = Math.random() * 500 - 250;
                    const z = Math.random() * 500 - 250;
                    const y = Math.random() * 10 + 10;
                    const sphere = environment.build.sphere(new Vector3(x, y, z), Math.random() * 3, Color3.Random().toHexString());
                    if (sphere.physicsBody) {

                        sphere.physicsBody.setLinearVelocity(new Vector3(0, Math.random() * 100 - 50, 0));
                    }

                    //sphere.physicsBody.shape.material.restitution = .1;
                }


            }
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