export enum EnvironmentElementType {
    CAMERA,
    GROUND,
    LIGHT,
    MESH,
    SOUND
}

export type EnvironmentElement = {
    type: EnvironmentElementType;
    id: string;
}