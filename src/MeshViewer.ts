/* Lecture 12
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'

export class MeshViewer extends gfx.GfxApp
{
    private cameraControls: gfx.OrbitControls;
    private cylinder: gfx.Mesh;

    private wireframe: boolean;

    private defaultMaterial: gfx.GouraudMaterial;
    private wireframeMaterial: gfx.WireframeMaterial;

    constructor()
    {
        super();

        this.cameraControls = new gfx.OrbitControls(this.camera);
        this.cylinder = new gfx.Mesh();

        this.defaultMaterial = new gfx.GouraudMaterial();
        this.wireframeMaterial = new gfx.WireframeMaterial();

        this.wireframe = false;
    }

    createScene(): void 
    {
        // Setup camera
        this.camera.setPerspectiveCamera(60, 1920/1080, 0.1, 10);
        this.cameraControls.setDistance(5);

        // Set a black background
        this.renderer.background.set(0, 0, 0);
        
        // Create an ambient light
        const ambientLight = new gfx.AmbientLight(new gfx.Color(0.25, 0.25, 0.25));
        this.scene.add(ambientLight);

        // Create a directional light
        const directionalLight = new gfx.DirectionalLight(new gfx.Color(0.5, 0.5, 0.5));
        directionalLight.position.set(-2, 1, 0)
        this.scene.add(directionalLight);

        // Add an axes display to the scene
        const axes = new gfx.Axes3(4);
        this.scene.add(axes);

        this.createCylinderMesh(this.cylinder, 20, 3);
        this.scene.add(this.cylinder);

        this.defaultMaterial.texture = new gfx.Texture('./campbells.png');
        this.cylinder.material = this.defaultMaterial;

        const gui = new GUI();
        gui.width = 200;

        const debugController = gui.add(this, 'wireframe');
        debugController.name('Wireframe');

        debugController.onChange(() => {
            // ternary operator
            this.cylinder.material = this.wireframe ? this.wireframeMaterial : this.defaultMaterial;
        });
    }

    update(deltaTime: number): void 
    {
        this.cameraControls.update(deltaTime);
    }

    private createCylinderMesh(mesh: gfx.Mesh, numSegments: number, height: number): void
    {
        const vertices: gfx.Vector3[] = [];
        const normals: gfx.Vector3[] = [];
        const indices: number[] = [];
        const uvs: number[] = [];

        const angleIncrement = (Math.PI * 2) / numSegments;

        // Loop around the barrel of the cylinder
        for(let i=0; i <= numSegments; i++)
        {
            // Compute the angle around the cylinder
            const angle = i * angleIncrement;

            // Create two vertices that make up each column
            vertices.push(new gfx.Vector3(Math.cos(angle), height/2, Math.sin(angle)));
            vertices.push(new gfx.Vector3(Math.cos(angle), -height/2, Math.sin(angle)));
        
            // Add the normals for each column
            normals.push(new gfx.Vector3(Math.cos(angle), 0, Math.sin(angle)));
            normals.push(new gfx.Vector3(Math.cos(angle), 0, Math.sin(angle)));

            uvs.push(1 - i / numSegments, 0);
            uvs.push(1 - i / numSegments, 1);
        }

        // Create the cylinder barrel triangles
        for(let col=0; col < numSegments; col++)
        {
            indices.push(col*2, col*2+2, col*2+1);
            indices.push(col*2+1, col*2+2, col*2+3);
        }

        mesh.setVertices(vertices);
        mesh.setNormals(normals);
        mesh.setIndices(indices);
        mesh.setTextureCoordinates(uvs);
        mesh.createDefaultVertexColors();
    }
}