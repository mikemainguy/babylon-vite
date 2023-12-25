import {Vector2, WebXRInputSource} from "@babylonjs/core";

export enum ControllerEventType {
    A,
    B,
    X,
    Y,
    R_GRIP,
    R_TRIGGER,
    R_STICK,
    L_GRIP,
    L_TRIGGER,
    L_STICK,
    OTHER
}

export type ControllerEvent = {
    value?: number | Vector2;
    down?: boolean;
    up?: boolean;
    type: ControllerEventType;
    controller: WebXRInputSource;
}