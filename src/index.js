import initGL, { watchWindowResize } from './init';
import ResourceManager from './resource-manager';
import Scene from './scene';
import Model from './model';
import Material from './material';
import Light from './light';
import Camera from './camera';
import { importFile } from './utils';
import renderScene from './renderer';

const gl = initGL();
let camera, turbine, lastTimeStamp = performance.now();

function importModels() {
    const modelNames = ['lighthouse', 'house', 'island', 'roof', 'stand', 'turbine'];

    const importPromises = modelNames.map(modelName => importFile(modelName));

    return Promise.all(importPromises).then(([
            lighthouseFileData,
            houseFileData,
            islandFileData,
            roofFileData,
            standFileData,
            turbineFileData
        ]) => {

        const { meshes: [lighthouseMeshData] } = lighthouseFileData;
        const { meshes: [houseMeshData] } = houseFileData;
        const { meshes: [islandMeshData] } = islandFileData;
        const { meshes: [roofMeshData] } = roofFileData;
        const { meshes: [standMeshData] } = standFileData;
        const { meshes: [turbineMeshData] } = turbineFileData;

        const lighthouseMaterial = new Material({
            shader: 'gourad',
            ambientCoefficient: .6,
            diffuseCoefficient: .9,
            specularCoefficient: .8,
            ambientColor: '#85BCBE',
            diffuseColor: '#B2DDCC',
            shininess: 80
        });

        const houseMaterial = new Material({
            shader: 'phong',
            ambientCoefficient: .2,
            diffuseCoefficient: .9,
            specularCoefficient: 1,
            ambientColor: '#8B6A8D',
            diffuseColor: '#1AC6E1',
            shininess: 80
        });

        const islandMaterial = new Material({
            shader: 'gourad',
            ambientCoefficient: .8,
            diffuseCoefficient: .6,
            specularCoefficient: .1,
            ambientColor: '#00E069',
            diffuseColor: '#00F069',
            shininess: 10
        });

        const roofMaterial = new Material({
            shader: 'phong',
            ambientCoefficient: .8,
            diffuseCoefficient: .6,
            specularCoefficient: 1,
            ambientColor: '#ED4960',
            diffuseColor: '#FF3957',
            shininess: 92
        });

        const lighthouse = new Model(gl, lighthouseMeshData, 'lighthouse', lighthouseMaterial);
        const house = new Model(gl, houseMeshData, 'house', houseMaterial);
        const island = new Model(gl, islandMeshData, 'island', islandMaterial);
        const roof = new Model(gl, roofMeshData, 'roof', roofMaterial);
        const stand = new Model(gl, standMeshData, 'stand', lighthouseMaterial);

        turbine = new Model(gl, turbineMeshData, 'turbine', roofMaterial);

        return [lighthouse, house, island, roof, stand, turbine];
    });
}

function setupView() {
    const cameraLocation = [0, 13, -18];
    const cameraTarget = [0, 3.5, 0];
    const { width, height } = gl.canvas;

    camera = new Camera(cameraLocation, cameraTarget, width / height, .5, 100);
    Scene.camera = camera;
}

function setupLights() {
    const light = new Light({
        position: [3, 12, 0],
        ambientIntensity: .5,
        diffuseIntensity: .8,
        specularIntensity: 1
    });

    Scene.light = light;
}

function render(timeStamp) {
    let delta = (timeStamp - lastTimeStamp) / 1000;
    lastTimeStamp = timeStamp;

    camera.rotate(-0.2 * delta);
    turbine.rotate([-0.421, 8.091, 1.760], 'z', -2 * delta);
}

ResourceManager
    .loadShaders(gl, ['phong', 'gourad'])
    .then(importModels)
    .then(models => {
        setupView();
        watchWindowResize(gl, (width, height) => camera.update(width / height));
        setupLights();

        const [lighthouse, house, island, roof, stand, turbine] = models;

        Scene.addModel(lighthouse);
        Scene.addModel(house);
        Scene.addModel(island);
        Scene.addModel(roof);
        Scene.addModel(stand);
        Scene.addModel(turbine);

        renderScene(gl, Scene, render);
    });
