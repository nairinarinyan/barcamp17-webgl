import { clampColor } from './utils';

export default class Material {
    constructor(options) {
        const {
            shader,
            ambientCoefficient, diffuseCoefficient,
            ambientColor, diffuseColor,
            shininess
        } = options;

        this.shader = shader;
        this.ambientColor = new Float32Array(clampColor(ambientColor));
        this.diffuseColor = new Float32Array(clampColor(diffuseColor));
        this.ambientCoefficient = ambientCoefficient;
        this.diffuseCoefficient = diffuseCoefficient;
        this.shininess = shininess;
    }
}