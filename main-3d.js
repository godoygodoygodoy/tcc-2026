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
    console.log('=== INICIANDO APLICAÇÃO 3D ===');
    console.log('THREE disponível?', typeof THREE !== 'undefined');
    console.log('THREE.OrbitControls disponível?', typeof THREE.OrbitControls !== 'undefined');
    
    const container = document.getElementById('scene-container');
    console.log('Container encontrado?', container !== null);
    
    if (typeof THREE === 'undefined') {
        alert('ERRO: Three.js não carregou! Verifique sua conexão com a internet.');
        document.getElementById('status').textContent = 'ERRO: Three.js não carregou';
        document.getElementById('status').style.color = '#ff0000';
        return;
    }
    
    try {
        // Cria a cena
        console.log('Criando cena...');
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1f35);
        scene.fog = new THREE.Fog(0x1a1f35, 200, 600);
        
        // Cria a câmera
        console.log('Criando câmera...');
        const aspect = container.clientWidth / container.clientHeight;
        camera = new THREE.PerspectiveCamera(60, aspect, 1, 2000);
        camera.position.set(0, 150, 400);
        camera.lookAt(0, 0, 0);
        
        // Cria o renderer
        console.log('Criando renderer...');
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        console.log('Renderer adicionado ao container');
        
        // Controles de órbita
        console.log('Criando controles...');
        if (typeof THREE.OrbitControls === 'undefined') {
            console.error('OrbitControls não disponível!');
            alert('ERRO: OrbitControls não carregou!');
            return;
        }
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 100;
        controls.maxDistance = 800;
        console.log('Controles criados');
        
        // Iluminação
        console.log('Configurando luzes...');
        setupLights();
        
        // Grid e eixos
        console.log('Criando helpers...');
        gridHelper = new THREE.GridHelper(500, 50, 0x00d4ff, 0x1e2a47);
        gridHelper.position.y = -bounds.y;
        scene.add(gridHelper);
        
        axesHelper = new THREE.AxesHelper(200);
        scene.add(axesHelper);
        console.log('Helpers adicionados');
        
        // Cria o swarm (geometria procedural já está disponível)
        console.log('Criando swarm...');
        console.log('Microbot3D disponível?', typeof Microbot3D !== 'undefined');
        console.log('Swarm3D disponível?', typeof Swarm3D !== 'undefined');
        
        if (typeof Microbot3D === 'undefined' || typeof Swarm3D === 'undefined') {
            alert('ERRO: Classes Microbot3D ou Swarm3D não carregaram!');
            document.getElementById('status').textContent = 'ERRO: Classes não carregadas';
            document.getElementById('status').style.color = '#ff0000';
            return;
        }
        
        swarm = new Swarm3D(scene, bounds);
        swarm.initialize(300);
        console.log('Swarm criado com', swarm.bots.length, 'bots');
        
        // Setup dos event listeners
        console.log('Configurando event listeners...');
        setupEventListeners();
        
        // Resize handler
        window.addEventListener('resize', onWindowResize);
        
        // Inicia a animação
        console.log('Iniciando loop de animação...');
        animate(0);
        
        // Mensagem de boas-vindas
        setTimeout(() => {
            console.log('Formando texto 3D...');
            formText('3D');
        }, 500);
        
        console.log('=== INICIALIZAÇÃO COMPLETA ===');
        
    } catch (error) {
        console.error('ERRO na inicialização:', error);
        alert('ERRO: ' + error.message);
        document.getElementById('status').textContent = 'ERRO: ' + error.message;
        document.getElementById('status').style.color = '#ff0000';
    }
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
 * Ativa/desativa modo tela cheia
 */
function toggleFullscreen() {
    const container = document.getElementById('scene-container');
    
    if (!document.fullscreenElement) {
        container.requestFullscreen().then(() => {
            container.classList.add('fullscreen-mode');
            createFullscreenControls();
            onWindowResize();
        }).catch(err => {
            console.error('Erro ao entrar em tela cheia:', err);
        });
    } else {
        document.exitFullscreen().then(() => {
            container.classList.remove('fullscreen-mode');
            removeFullscreenControls();
            onWindowResize();
        });
    }
}

/**
 * Cria controles flutuantes para modo tela cheia
 */
function createFullscreenControls() {
    const existing = document.getElementById('fullscreen-controls-overlay');
    if (existing) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'fullscreen-controls-overlay';
    overlay.className = 'fullscreen-controls';
    overlay.innerHTML = `
        <button class="btn btn-secondary" onclick="formShape('sphere')">🔮 Esfera</button>
        <button class="btn btn-secondary" onclick="formShape('cube')">🧊 Cubo</button>
        <button class="btn btn-secondary" onclick="formShape('heart')">❤️ Coração</button>
        <button class="btn btn-secondary" onclick="formShape('star')">⭐ Estrela</button>
        <button class="btn btn-secondary" onclick="formShape('dna')">🧬 DNA</button>
        <button class="btn btn-danger" onclick="toggleFullscreen()">✕ Sair</button>
    `;
    document.body.appendChild(overlay);
}

/**
 * Remove controles flutuantes
 */
function removeFullscreenControls() {
    const overlay = document.getElementById('fullscreen-controls-overlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Aplica cores personalizadas aos microbots
 */
function applyCustomColors() {
    const bodyColor = document.getElementById('bodyColorPicker').value;
    const glowColor = document.getElementById('glowColorPicker').value;
    
    console.log('Aplicando cores:', bodyColor, glowColor);
    
    // Atualizar todos os microbots
    swarm.bots.forEach(bot => {
        bot.mesh.traverse((child) => {
            if (child.isMesh && child.material && child.material.userData) {
                if (child.material.userData.type === 'body') {
                    // Materiais do corpo (escuros)
                    child.material.color.setStyle(bodyColor);
                } else if (child.material.userData.type === 'glow') {
                    // Materiais luminosos
                    child.material.color.setStyle(glowColor);
                    child.material.emissive.setStyle(glowColor);
                }
            }
        });
    });
    
    // Atualizar geometria compartilhada para próximos bots
    if (Microbot3D.sharedGeometry) {
        Microbot3D.sharedGeometry.traverse((child) => {
            if (child.isMesh && child.material && child.material.userData) {
                if (child.material.userData.type === 'body') {
                    child.material.color.setStyle(bodyColor);
                } else if (child.material.userData.type === 'glow') {
                    child.material.color.setStyle(glowColor);
                    child.material.emissive.setStyle(glowColor);
                }
            }
        });
    }
    
    console.log('Cores aplicadas com sucesso!');
}

/**
 * Configura event listeners
 */
function setupEventListeners() {
    // Botão de formar TEXTO
    document.getElementById('formTextBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (text) {
            formText(text);
        }
    });
    
    // Botão de formar OBJETO
    document.getElementById('formObjectBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (text) {
            formObject(text);
        }
    });
    
    // Enter no input - tenta objeto primeiro, senão texto
    document.getElementById('textInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = e.target.value.trim();
            if (text) {
                // Tenta gerar objeto, se não conseguir, faz texto
                const objectPoints = ObjectGenerator3D.generateFromText(text, swarm.bots.length);
                if (objectPoints) {
                    swarm.setTargetPoints(objectPoints);
                } else {
                    formText(text);
                }
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
    
    // Botão tela cheia FIXO (canto inferior direito)
    document.getElementById('fullscreenBtnFixed').addEventListener('click', toggleFullscreen);
    
    // Botão aplicar cores
    document.getElementById('applyColorsBtn').addEventListener('click', applyCustomColors);
    
    // Listener para sair de tela cheia com ESC
    document.addEventListener('fullscreenchange', () => {
        const container = document.getElementById('scene-container');
        if (!document.fullscreenElement) {
            container.classList.remove('fullscreen-mode');
            removeFullscreenControls();
            onWindowResize();
        }
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
 * Forma um objeto baseado na descrição
 */
function formObject(text) {
    const points = ObjectGenerator3D.generateFromText(text, swarm.bots.length);
    
    if (points) {
        swarm.setTargetPoints(points);
    } else {
        // Se não encontrou objeto, mostra mensagem
        alert(`Objeto "${text}" não reconhecido. Tente:\n\n🦆 Animais: pato, pássaro, peixe, borboleta\n✈️ Veículos: avião, carro, foguete\n🏠 Outros: casa, árvore, coração, estrela`);
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
        case 'smile':
            points = ShapeGenerator3D.generateSmile(size * 0.6, swarm.bots.length);
            break;
        case 'thumbsup':
            points = ShapeGenerator3D.generateThumbsUp(size * 0.8, swarm.bots.length);
            break;
        case 'spider':
            points = ShapeGenerator3D.generateSpider(size * 0.6, swarm.bots.length);
            break;
        case 'wave':
            points = ShapeGenerator3D.generateWave(size * 0.6, swarm.bots.length);
            break;
        case 'lightning':
            points = ShapeGenerator3D.generateLightning(size * 0.8, swarm.bots.length);
            break;
        default:
            console.log(`Shape ${shapeName} não encontrada`);
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
