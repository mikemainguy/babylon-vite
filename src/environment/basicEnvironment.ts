import {
    Observable,
    Scene,
    Vector2,
    Vector3,
    WebXRControllerComponent,
    WebXRDefaultExperience,
    WebXRInputSource
} from "@babylonjs/core";
import {UniversalAvatar} from "./avatar/universalAvatar.ts";
import "@babylonjs/loaders";
import {ControllerEvent, ControllerEventType} from "./controllers/controllerEvent.ts";
import {EnvironmentPhysics} from "./environmentPhysics.ts";


export class BasicEnvironment {
    public readonly controllerObservable: Observable<ControllerEvent> = new Observable<ControllerEvent>();
    private avatar: UniversalAvatar;
    private readonly scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.avatar = new UniversalAvatar(scene, new Vector3(0, 1, -5));
        const physics: EnvironmentPhysics = new EnvironmentPhysics(scene);
        physics.physicsObservable.add((event) => {
            this.avatar.enablePhysics();

        });
        this.controllerObservable.add(this.avatar.controllerObserver);
        this.buildXrExperience();
    }

    public buildScene(builder: (scene: Scene, avatar: UniversalAvatar) => void) {
        builder(this.scene, this.avatar);
    }

    private async buildXrExperience() {
        const xr = await WebXRDefaultExperience.CreateAsync(this.scene, {
            disableTeleportation: true,
            outputCanvasOptions: {
                canvasOptions: {
                    framebufferScaleFactor: 1
                }
            },
            optionalFeatures: true,
            pointerSelectionOptions: {
                enablePointerSelectionOnAllControllers: true
            }

        });
        xr.baseExperience.onStateChangedObservable.add((state) => {

        });
        xr.input.onControllerAddedObservable.add((controller) => {
            controller.onMotionControllerInitObservable.add((motionController) => {

                initializeThumbsticks(motionController.components['xr-standard-thumbstick'], this.controllerObservable,
                    controller);
                motionController.getAllComponentsOfType('button').forEach((component) => {
                    initializeButton(component, this.controllerObservable, controller);
                });

            });


        });
    }
}

function mapButton(name: string): ControllerEventType {
    switch (name) {
        case 'a-button':
            return ControllerEventType.A;
        case 'b-button':
            return ControllerEventType.B;
        case 'x-button':
            return ControllerEventType.X;
        case 'y-button':
            return ControllerEventType.Y;
        default:
            return ControllerEventType.OTHER;
    }
}

function initializeButton(component: WebXRControllerComponent, observable: Observable<ControllerEvent>,
                          controller: WebXRInputSource) {
    console.log(component.id);
    const button = mapButton(component.id);

    if (component && controller) {
        component.onButtonStateChangedObservable.add((value) => {
            !observable.notifyObservers({
                type: button,
                down: value.pressed,
                up: !value.pressed,
                value: value.value,
                controller: controller
            })
        });
    }
}

function initializeThumbsticks(component: WebXRControllerComponent, observable: Observable<ControllerEvent>,
                               controller: WebXRInputSource) {
    if (component && controller) {
        const handedness = controller.inputSource.handedness;
        component.onAxisValueChangedObservable.add((value) => {
            if (handedness === "right") {
                observable.notifyObservers({
                    type: ControllerEventType.R_STICK,
                    value: new Vector2(value.x, value.y),
                    controller: controller
                });
            }
            if (handedness === "left") {
                observable.notifyObservers({
                    type: ControllerEventType.L_STICK,
                    value: new Vector2(value.x, value.y),
                    controller: controller
                });
            }
        });
    }
}
