/**
 * 3MF Loader para Three.js
 * Carrega arquivos .3mf e converte para geometria Three.js
 */

THREE.ThreeMFLoader = function (manager) {
    this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
};

THREE.ThreeMFLoader.prototype = {
    constructor: THREE.ThreeMFLoader,

    load: function (url, onLoad, onProgress, onError) {
        const scope = this;
        const loader = new THREE.FileLoader(scope.manager);
        loader.setResponseType('arraybuffer');
        
        loader.load(url, function (buffer) {
            try {
                onLoad(scope.parse(buffer));
            } catch (e) {
                if (onError) {
                    onError(e);
                } else {
                    console.error(e);
                }
            }
        }, onProgress, onError);
    },

    parse: function (data) {
        const scope = this;
        
        // Função para extrair arquivo do ZIP (3MF é um ZIP)
        function unzip(data) {
            const files = {};
            const view = new DataView(data);
            
            // Verificar assinatura ZIP (PK\x03\x04)
            if (view.getUint32(0, true) !== 0x04034b50) {
                throw new Error('Não é um arquivo ZIP válido (3MF)');
            }
            
            let offset = 0;
            
            while (offset < data.byteLength - 4) {
                const signature = view.getUint32(offset, true);
                
                // Local file header
                if (signature === 0x04034b50) {
                    const nameLength = view.getUint16(offset + 26, true);
                    const extraLength = view.getUint16(offset + 28, true);
                    const compressedSize = view.getUint32(offset + 18, true);
                    
                    const nameOffset = offset + 30;
                    const nameBytes = new Uint8Array(data, nameOffset, nameLength);
                    const fileName = new TextDecoder().decode(nameBytes);
                    
                    const fileDataOffset = nameOffset + nameLength + extraLength;
                    const fileData = data.slice(fileDataOffset, fileDataOffset + compressedSize);
                    
                    files[fileName] = fileData;
                    offset = fileDataOffset + compressedSize;
                } else {
                    break;
                }
            }
            
            return files;
        }
        
        // Função para parsear XML
        function parseXML(data) {
            const text = new TextDecoder().decode(data);
            const parser = new DOMParser();
            return parser.parseFromString(text, 'text/xml');
        }
        
        // Extrair arquivos do 3MF
        const files = unzip(data);
        
        // Encontrar arquivo de modelo principal
        let modelXML = null;
        
        if (files['3D/3dmodel.model']) {
            modelXML = parseXML(files['3D/3dmodel.model']);
        } else {
            // Procurar por qualquer .model
            for (const fileName in files) {
                if (fileName.endsWith('.model')) {
                    modelXML = parseXML(files[fileName]);
                    break;
                }
            }
        }
        
        if (!modelXML) {
            throw new Error('Nenhum arquivo de modelo encontrado no 3MF');
        }
        
        // Extrair vértices e triângulos
        const group = new THREE.Group();
        const meshElements = modelXML.getElementsByTagName('mesh');
        
        for (let i = 0; i < meshElements.length; i++) {
            const meshElement = meshElements[i];
            const vertices = meshElement.getElementsByTagName('vertex');
            const triangles = meshElement.getElementsByTagName('triangle');
            
            const positions = [];
            const indices = [];
            
            // Ler vértices
            const vertexArray = [];
            for (let j = 0; j < vertices.length; j++) {
                const v = vertices[j];
                const x = parseFloat(v.getAttribute('x'));
                const y = parseFloat(v.getAttribute('y'));
                const z = parseFloat(v.getAttribute('z'));
                vertexArray.push(new THREE.Vector3(x, y, z));
            }
            
            // Ler triângulos
            for (let j = 0; j < triangles.length; j++) {
                const t = triangles[j];
                const v1 = parseInt(t.getAttribute('v1'));
                const v2 = parseInt(t.getAttribute('v2'));
                const v3 = parseInt(t.getAttribute('v3'));
                
                positions.push(
                    vertexArray[v1].x, vertexArray[v1].y, vertexArray[v1].z,
                    vertexArray[v2].x, vertexArray[v2].y, vertexArray[v2].z,
                    vertexArray[v3].x, vertexArray[v3].y, vertexArray[v3].z
                );
            }
            
            // Criar geometria
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.computeVertexNormals();
            
            // Centralizar e normalizar
            geometry.center();
            geometry.computeBoundingSphere();
            
            const scale = 1.0 / geometry.boundingSphere.radius;
            geometry.scale(scale, scale, scale);
            
            const material = new THREE.MeshStandardMaterial({
                color: 0x00ffff,
                emissive: 0x004444,
                metalness: 0.3,
                roughness: 0.4
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);
        }
        
        return group;
    }
};
