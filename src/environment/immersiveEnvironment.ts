import {
    Observable,
    Scene,
    Vector2,
    Vector3,
    WebXRControllerComponent,
    WebXRDefaultExperience,
    WebXRInputSource
} from "@babylonjs/core";
import {ImmersiveActor} from "./avatar/immersiveActor.ts";
import "@babylonjs/loaders";
import {ControllerEvent, ControllerEventType} from "./controllers/controllerEvent.ts";
import {EnvironmentPhysics} from "./environmentPhysics.ts";
import {EnvironmentBuilder} from "./envrionmentBuilder.ts";


export class ImmersiveEnvironment {
    public readonly controllerObservable: Observable<ControllerEvent> = new Observable<ControllerEvent>();
    public readonly onReadyObservable: Observable<any> = new Observable<any>();
    public readonly build: EnvironmentBuilder;
    private readonly scene: Scene;
    private avatar: ImmersiveActor;
    private physicsReady: boolean = false;
    private xrReady: boolean = false;

    constructor(scene: Scene) {
        this.scene = scene;
        this.avatar = new ImmersiveActor(scene, new Vector3(0, 25, -5));
        const physics: EnvironmentPhysics = new EnvironmentPhysics(scene);
        this.build = new EnvironmentBuilder(scene);
        physics.physicsObservable.add(() => {
            this.avatar.enablePhysics();
            this.physicsReady = true;
            this.onReadyObservable.notifyObservers({xrReady: this.xrReady, physicsReady: this.physicsReady});
        });
        physics.initializeAsync();
        this.controllerObservable.add(this.avatar.controllerObserver, -1, false, this.avatar);
        this.buildXrExperience();
    }


    public buildScene(builder: (scene: Scene, avatar: ImmersiveActor) => void) {
        if (builder) {
            builder(this.scene, this.avatar);
        }
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
        xr.baseExperience.onInitialXRPoseSetObservable.add(() => {
            xr.baseExperience.camera.position.set(0, 1.6, 0);
        });
        xr.baseExperience.onStateChangedObservable.add(() => {

        });
        xr.input.onControllerAddedObservable.add((controller) => {
            controller.onMotionControllerInitObservable.add((motionController) => {
                initializeThumbstick(motionController.components['xr-standard-thumbstick'],
                    this.controllerObservable,
                    controller);
                initializeTrigger(motionController.components['xr-standard-trigger'], this.controllerObservable, controller);
                initializeGrip(motionController.components['xr-standard-squeeze'], this.controllerObservable, controller);

                motionController.getAllComponentsOfType('button').forEach((component) => {
                    initializeButton(component,
                        this.controllerObservable,
                        controller);
                });

            });
        });

        this.xrReady = true;
        this.onReadyObservable.notifyObservers({xrReady: this.xrReady, physicsReady: this.physicsReady});
    }
}

function initializeTrigger(component: WebXRControllerComponent,
                           observable: Observable<ControllerEvent>,
                           controller: WebXRInputSource) {

    if (component && controller) {
        component.onButtonStateChangedObservable.add((value) => {
            !observable.notifyObservers({
                type: mapTrigger(controller.inputSource.handedness),
                down: value.pressed,
                up: !value.pressed,
                value: value.value,
                controller: controller
            })
        });
    }
}

function initializeGrip(component: WebXRControllerComponent,
                        observable: Observable<ControllerEvent>,
                        controller: WebXRInputSource) {

    if (component && controller) {
        component.onButtonStateChangedObservable.add((value) => {
            !observable.notifyObservers({
                type: mapGrip(controller.inputSource.handedness),
                down: value.pressed,
                up: !value.pressed,
                value: value.value,
                controller: controller
            })
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

function mapGrip(name: string): ControllerEventType {
    switch (name) {
        case "right":
            return ControllerEventType.R_GRIP;
        case "left":
            return ControllerEventType.L_GRIP;
        default:
            return ControllerEventType.OTHER;
    }
}

function mapTrigger(name: string): ControllerEventType {
    switch (name) {
        case "right":
            return ControllerEventType.R_TRIGGER;
        case "left":
            return ControllerEventType.L_TRIGGER;
        default:
            return ControllerEventType.OTHER;
    }

}

function mapStick(name: string): ControllerEventType {
    switch (name) {
        case "right":
            return ControllerEventType.R_STICK;
        case "left":
            return ControllerEventType.L_STICK;
        default:
            return ControllerEventType.OTHER;
    }
}

function initializeThumbstick(component: WebXRControllerComponent, observable: Observable<ControllerEvent>,
                              controller: WebXRInputSource) {
    if (component && controller) {
        component.onAxisValueChangedObservable.add((value) => {
            observable.notifyObservers({
                type: mapStick(controller.inputSource.handedness),
                value: new Vector2(value.x, value.y),
                controller: controller
            });
        });
    }
}