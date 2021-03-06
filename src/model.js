import ResourceManager from './resource-manager';
import { identity, rotate, translate, matMul } from './math/matrix';
import { clampColor } from './utils';

function createAttribute(gl, program, attribArray, attribName, size = 3) {
    const location = gl.getAttribLocation(program, attribName);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attribArray), gl.STATIC_DRAW);

    return { location, size, vbo };
}

function uploadIndexData(gl, indexArray) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);

    return buffer;
}

export default class Model {
    constructor(gl, meshData, modelName, material) {
        const { vertices, normals, faces } = meshData;
        const { shader } = material;
        const indices = [].concat.apply([], faces);
        const attribNames = ['a_position', 'a_normal'];

        const { program } = ResourceManager.getProgram(shader);

        this.name = modelName;

        this.children = [];
        this.parent = null;
        this.transform = identity();
        this.material = material;

        this.indices = {
            length: indices.length, 
            buffer: uploadIndexData(gl, indices)
        };

        this.attributes = {
            a_position: createAttribute(gl, program, vertices, 'a_position'),
            a_normal: createAttribute(gl, program, normals, 'a_normal')
        };
    }

    rotate(origin, axis, angle) {
        const [x, y, z] = origin;

        const translateMat = translate(-x, -y, -z);
        const translateBackMat = translate(x, y, z);
        const rotateMat = rotate(axis, angle);

        this.transform = matMul(translateBackMat, (matMul(rotateMat, matMul(translateMat, this.transform))));
    }

    translate(x, y, z) {
        this.transform[12] = x;
        this.transform[13] = y;
        this.transform[14] = z;
    }

    move(x, y, z) {
        this.transform = matMul(translate(x, y, z), this.transform);
    }
}
