/**
 * Main Application 3D - Controla a aplicação 3D e interface
 */

// Variáveis globais
let scene, camera, renderer, controls;
let swarm;
let animationId;
let lastFrameTime = 0;
let fps = 0;
let frameCount = 0;
let lastFpsUpdate = 0;

// Configurações
const bounds = new THREE.Vector3(250, 200, 200);
let gridHelper, axesHelper;
let autoRotate = false;
let showGrid = true;
let showAxes = true;

/**
 * Inicializa a aplicação 3D
 */
function init() {
    const container = document.getElementById('scene-container');
    
    // Cria a cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050816);
    scene.fog = new THREE.Fog(0x050816, 200, 600);
    
    // Cria a câmera
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 1, 2000);
    camera.position.set(0, 150, 400);
    camera.lookAt(0, 0, 0);
    
    // Cria o renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Controles de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 100;
    controls.maxDistance = 800;
    
    // Iluminação
    setupLights();
    
    // Grid e eixos
    gridHelper = new THREE.GridHelper(500, 50, 0x00d4ff, 0x1e2a47);
    gridHelper.position.y = -bounds.y;
    scene.add(gridHelper);
    
    axesHelper = new THREE.AxesHelper(200);
    scene.add(axesHelper);
    
    // Cria o swarm
    swarm = new Swarm3D(scene, bounds);
    swarm.initialize(300);
    
    // Setup dos event listeners
    setupEventListeners();
    
    // Resize handler
    window.addEventListener('resize', onWindowResize);
    
    // Inicia a animação
    animate(0);
    
    // Mensagem de boas-vindas
    setTimeout(() => {
        formText('3D');
    }, 500);
}

/**
 * Configura as luzes da cena
 */
function setupLights() {
    // Luz ambiente
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    // Luz direcional principal
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 300;
    directionalLight.shadow.camera.bottom = -300;
    directionalLight.shadow.camera.left = -300;
    directionalLight.shadow.camera.right = 300;
    scene.add(directionalLight);
    
    // Luzes pontuais coloridas
    const pointLight1 = new THREE.PointLight(0x00d4ff, 0.5, 400);
    pointLight1.position.set(200, 100, 100);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff6b9d, 0.5, 400);
    pointLight2.position.set(-200, 100, -100);
    scene.add(pointLight2);
    
    // Luz hemisférica
    const hemisphereLight = new THREE.HemisphereLight(0x00d4ff, 0x141928, 0.3);
    scene.add(hemisphereLight);
}

/**
 * Loop principal de animação
 */
function animate(timestamp) {
    // Calcula FPS
    frameCount++;
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    
    if (timestamp - lastFpsUpdate > 1000) {
        fps = Math.round(frameCount * 1000 / (timestamp - lastFpsUpdate));
        frameCount = 0;
        lastFpsUpdate = timestamp;
        updateUI();
    }
    
    // Atualiza controles
    controls.update();
    
    // Auto-rotação
    if (autoRotate) {
        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.002);
        camera.lookAt(0, 0, 0);
    }
    
    // Atualiza swarm
    swarm.update();
    
    // Renderiza
    renderer.render(scene, camera);
    
    // Continua a animação
    animationId = requestAnimationFrame(animate);
}

/**
 * Atualiza elementos da UI
 */
function updateUI() {
    const fpsElement = document.getElementById('fps');
    fpsElement.textContent = fps;
    
    // Colorir FPS baseado na performance
    if (fps < 30) {
        fpsElement.className = 'stat-value fps-warning';
    } else if (fps >= 50) {
        fpsElement.className = 'stat-value fps-good';
    } else {
        fpsElement.className = 'stat-value';
    }
    
    document.getElementById('botCount').textContent = swarm.bots.length;
    
    // Atualiza status
    const statusEl = document.getElementById('status');
    
    if (swarm.isPaused) {
        statusEl.textContent = 'Pausado';
        statusEl.style.color = '#ff6b9d';
    } else if (swarm.behaviorMode === 'forming') {
        const progress = swarm.getFormationProgress();
        statusEl.textContent = `Formando (${Math.round(progress)}%)`;
        statusEl.style.color = '#00d4ff';
        
        if (progress > 95) {
            statusEl.textContent = 'Formação Completa';
            statusEl.style.color = '#00ff88';
        }
    } else if (swarm.behaviorMode === 'dispersing') {
        statusEl.textContent = 'Dispersando';
        statusEl.style.color = '#ffa500';
    } else {
        statusEl.textContent = 'Modo Livre 3D';
        statusEl.style.color = '#8892b0';
    }
}

/**
 * Redimensiona quando a janela muda
 */
function onWindowResize() {
    const container = document.getElementById('scene-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

/**
 * Configura event listeners
 */
function setupEventListeners() {
    // Botão de formar texto
    document.getElementById('formTextBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (text) {
            formText(text);
        }
    });
    
    // Enter no input de texto
    document.getElementById('textInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = e.target.value.trim();
            if (text) {
                formText(text);
            }
        }
    });
    
    // Botões de formas
    document.querySelectorAll('.btn-shape').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const shape = e.target.dataset.shape;
            formShape(shape);
        });
    });
    
    // Slider de quantidade de bots
    document.getElementById('botCountSlider').addEventListener('input', (e) => {
        const count = parseInt(e.target.value);
        document.getElementById('botCountDisplay').textContent = count;
        swarm.initialize(count);
    });
    
    // Slider de velocidade
    document.getElementById('speedSlider').addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        document.getElementById('speedDisplay').textContent = speed.toFixed(1) + 'x';
        swarm.speedMultiplier = speed;
    });
    
    // Slider de coesão
    document.getElementById('cohesionSlider').addEventListener('input', (e) => {
        const cohesion = parseFloat(e.target.value);
        document.getElementById('cohesionDisplay').textContent = cohesion.toFixed(1);
        swarm.cohesionStrength = cohesion;
    });
    
    // Botão dispersar
    document.getElementById('disperseBtn').addEventListener('click', () => {
        swarm.disperse();
    });
    
    // Botão reset
    document.getElementById('resetBtn').addEventListener('click', () => {
        const count = swarm.bots.length;
        swarm.initialize(count);
    });
    
    // Botão pausar
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.addEventListener('click', () => {
        const isPaused = swarm.togglePause();
        pauseBtn.textContent = isPaused ? 'Retomar' : 'Pausar';
    });
    
    // Botão reset câmera
    document.getElementById('resetCameraBtn').addEventListener('click', () => {
        camera.position.set(0, 150, 400);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
    });
    
    // Botão auto-rotação
    const autoRotateBtn = document.getElementById('autoRotateBtn');
    autoRotateBtn.addEventListener('click', () => {
        autoRotate = !autoRotate;
        autoRotateBtn.style.background = autoRotate 
            ? 'linear-gradient(135deg, #00d4ff, #0099ff)' 
            : 'var(--dark-bg)';
        autoRotateBtn.style.color = autoRotate ? 'var(--darker-bg)' : 'var(--text-color)';
    });
    
    // Botão grid
    const gridBtn = document.getElementById('gridBtn');
    gridBtn.addEventListener('click', () => {
        showGrid = !showGrid;
        gridHelper.visible = showGrid;
        gridBtn.style.background = showGrid 
            ? 'linear-gradient(135deg, #00d4ff, #0099ff)' 
            : 'var(--dark-bg)';
        gridBtn.style.color = showGrid ? 'var(--darker-bg)' : 'var(--text-color)';
    });
    
    // Botão eixos
    const axesBtn = document.getElementById('axesBtn');
    axesBtn.addEventListener('click', () => {
        showAxes = !showAxes;
        axesHelper.visible = showAxes;
        axesBtn.style.background = showAxes 
            ? 'linear-gradient(135deg, #00d4ff, #0099ff)' 
            : 'var(--dark-bg)';
        axesBtn.style.color = showAxes ? 'var(--darker-bg)' : 'var(--text-color)';
    });
}

/**
 * Forma um texto com os microbots
 */
function formText(text) {
    const points = ShapeGenerator3D.generateText(text, swarm.bots.length);
    
    if (points.length > 0) {
        swarm.setTargetPoints(points);
    }
}

/**
 * Forma uma shape com os microbots
 */
function formShape(shapeName) {
    let points = [];
    const size = 150;
    
    switch (shapeName) {
        case 'sphere':
            points = ShapeGenerator3D.generateSphere(size * 0.6, swarm.bots.length);
            break;
        case 'cube':
            points = ShapeGenerator3D.generateCube(size, swarm.bots.length);
            break;
        case 'pyramid':
            points = ShapeGenerator3D.generatePyramid(size, swarm.bots.length);
            break;
        case 'heart':
            points = ShapeGenerator3D.generateHeart(size * 0.5, swarm.bots.length);
            break;
        case 'star':
            points = ShapeGenerator3D.generateStar(size * 0.6, swarm.bots.length);
            break;
        case 'helix':
            points = ShapeGenerator3D.generateHelix(size * 0.4, size * 1.5, swarm.bots.length);
            break;
        case 'torus':
            points = ShapeGenerator3D.generateTorus(size * 0.5, size * 0.2, swarm.bots.length);
            break;
        case 'dna':
            points = ShapeGenerator3D.generateDNA(size * 0.3, size * 1.5, swarm.bots.length);
            break;
        case 'snow':
            points = ShapeGenerator3D.generateSnow3D(size * 0.6, swarm.bots.length);
            break;
        default:
            // Para símbolos 2D, converte para 3D
            console.log(`Shape ${shapeName} usando conversão 2D->3D`);
            return;
    }
    
    if (points.length > 0) {
        swarm.setTargetPoints(points);
    }
}

/**
 * Inicia a aplicação quando o DOM estiver pronto
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
