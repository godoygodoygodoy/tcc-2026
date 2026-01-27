/**
 * Main Application - Controla a aplicação e interface
 */

// Variáveis globais
let canvas, ctx;
let swarm;
let animationId;
let lastFrameTime = 0;
let fps = 0;
let frameCount = 0;
let lastFpsUpdate = 0;

// Variáveis para desenho
let isDrawing = false;
let drawingPoints = [];
let drawingMode = false;

/**
 * Inicializa a aplicação
 */
function init() {
    // Setup do canvas
    canvas = document.getElementById('swarmCanvas');
    ctx = canvas.getContext('2d');
    
    // Ajusta o tamanho do canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Cria o swarm
    swarm = new Swarm(canvas, ctx);
    swarm.initialize(500);
    
    // Setup dos event listeners
    setupEventListeners();
    
    // Inicia a animação
    animate(0);
    
    // Mensagem de boas-vindas
    setTimeout(() => {
        formText('SWARM');
    }, 500);
}

/**
 * Redimensiona o canvas
 */
function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Atualiza o canvas de cada bot
    if (swarm) {
        for (const bot of swarm.bots) {
            bot.canvas = canvas;
        }
    }
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
    
    // Limpa o canvas
    ctx.fillStyle = 'rgba(5, 8, 22, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Atualiza e renderiza o swarm
    swarm.update();
    swarm.render();
    
    // Desenha a linha de desenho em tempo real
    if (drawingMode && drawingPoints.length > 1) {
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(drawingPoints[0].x, drawingPoints[0].y);
        
        for (let i = 1; i < drawingPoints.length; i++) {
            ctx.lineTo(drawingPoints[i].x, drawingPoints[i].y);
        }
        
        ctx.stroke();
        
        // Desenha pontos
        ctx.fillStyle = 'rgba(0, 212, 255, 0.8)';
        for (const point of drawingPoints) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Indicador de modo desenho
    if (drawingMode) {
        ctx.fillStyle = 'rgba(255, 107, 157, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'rgba(255, 107, 157, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText('MODO DESENHO ATIVO - Clique e arraste para desenhar', canvas.width / 2, 30);
    }
    
    // Continua a animação
    animationId = requestAnimationFrame(animate);
}

/**
 * Atualiza elementos da UI
 */
function updateUI() {
    document.getElementById('fps').textContent = fps;
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
        statusEl.textContent = 'Modo Livre';
        statusEl.style.color = '#8892b0';
    }
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
    
    // Botão de modo desenho
    const drawBtn = document.getElementById('drawBtn');
    drawBtn.addEventListener('click', () => {
        drawingMode = !drawingMode;
        drawBtn.textContent = drawingMode ? 'Parar Desenho' : 'Modo Desenho';
        drawBtn.style.background = drawingMode 
            ? 'linear-gradient(135deg, #ff6b9d, #ff4757)' 
            : 'var(--dark-bg)';
        drawBtn.style.borderColor = drawingMode ? '#ff6b9d' : 'var(--border-color)';
        
        if (!drawingMode && drawingPoints.length > 0) {
            // Aplica os pontos desenhados
            swarm.setTargetPoints(drawingPoints);
            drawingPoints = [];
        } else if (!drawingMode) {
            drawingPoints = [];
        }
    });
    
    // Interação com o mouse no canvas - Desenho
    canvas.addEventListener('mousedown', (e) => {
        if (drawingMode) {
            isDrawing = true;
            drawingPoints = [];
        }
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (drawingMode && isDrawing) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Adiciona pontos conforme o mouse se move
            drawingPoints.push({ x, y });
            
            // Limita o número de pontos
            if (drawingPoints.length > swarm.bots.length) {
                drawingPoints.shift();
            }
        }
    });
    
    canvas.addEventListener('mouseup', (e) => {
        if (drawingMode && isDrawing) {
            isDrawing = false;
            
            if (drawingPoints.length > 10) {
                // Interpola pontos para ter quantidade suficiente
                const interpolatedPoints = interpolateDrawingPoints(drawingPoints, swarm.bots.length);
                swarm.setTargetPoints(interpolatedPoints);
            }
        }
    });
    
    // Clique para atrair (quando não está em modo desenho)
    canvas.addEventListener('click', (e) => {
        if (!drawingMode) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Atrai bots para onde o usuário clicou
            attractBotsToPoint(x, y);
        }
    });
}

/**
 * Forma um texto com os microbots
 */
function formText(text) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const points = ShapeGenerator.generateText(text, centerX, centerY);
    
    if (points.length > 0) {
        swarm.setTargetPoints(points);
    }
}

/**
 * Forma uma shape com os microbots
 */
function formShape(shapeName) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(canvas.width, canvas.height) * 0.35;
    
    let points = [];
    
    switch (shapeName) {
        case 'circle':
            points = ShapeGenerator.generateCircle(centerX, centerY, size * 0.6, swarm.bots.length);
            break;
        case 'square':
            points = ShapeGenerator.generateSquare(centerX, centerY, size, swarm.bots.length);
            break;
        case 'triangle':
            points = ShapeGenerator.generateTriangle(centerX, centerY, size, swarm.bots.length);
            break;
        case 'heart':
            points = ShapeGenerator.generateHeart(centerX, centerY, size * 0.5, swarm.bots.length);
            break;
        case 'star':
            points = ShapeGenerator.generateStar(centerX, centerY, size * 0.6, swarm.bots.length);
            break;
        case 'spiral':
            points = ShapeGenerator.generateSpiral(centerX, centerY, size * 0.6, swarm.bots.length);
            break;
        case 'smile':
            points = ShapeGenerator.generateSmile(centerX, centerY, size * 0.5, swarm.bots.length);
            break;
        case 'arrow':
            points = ShapeGenerator.generateArrow(centerX, centerY, size, swarm.bots.length);
            break;
        case 'infinity':
            points = ShapeGenerator.generateInfinity(centerX, centerY, size * 0.5, swarm.bots.length);
            break;
        case 'wave':
            points = ShapeGenerator.generateWave(centerX, centerY, size * 1.2, size * 0.3, swarm.bots.length);
            break;
        case 'lightning':
            points = ShapeGenerator.generateLightning(centerX, centerY, size, swarm.bots.length);
            break;
        case 'peace':
            points = ShapeGenerator.generatePeace(centerX, centerY, size * 0.5, swarm.bots.length);
            break;
        case 'music':
            points = ShapeGenerator.generateMusic(centerX, centerY, size * 0.6, swarm.bots.length);
            break;
        case 'sun':
            points = ShapeGenerator.generateSun(centerX, centerY, size * 0.5, swarm.bots.length);
            break;
        case 'moon':
            points = ShapeGenerator.generateMoon(centerX, centerY, size * 0.5, swarm.bots.length);
            break;
        case 'flower':
            points = ShapeGenerator.generateFlower(centerX, centerY, size * 0.5, swarm.bots.length);
            break;
    }
    
    if (points.length > 0) {
        swarm.setTargetPoints(points);
    }
}

/**
 * Atrai bots para um ponto específico
 */
function attractBotsToPoint(x, y) {
    const attractionRadius = 150;
    const attractionStrength = 5;
    
    for (const bot of swarm.bots) {
        const dx = x - bot.x;
        const dy = y - bot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < attractionRadius && distance > 0) {
            const force = attractionStrength / distance;
            bot.applyForce((dx / distance) * force, (dy / distance) * force);
        }
    }
}

/**
 * Interpola pontos de desenho para ter quantidade suficiente
 */
function interpolateDrawingPoints(points, targetCount) {
    if (points.length === 0) return [];
    if (points.length >= targetCount) return points;
    
    const result = [];
    const segmentCount = points.length - 1;
    const pointsPerSegment = Math.floor(targetCount / segmentCount);
    
    for (let i = 0; i < segmentCount; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        
        for (let j = 0; j < pointsPerSegment; j++) {
            const t = j / pointsPerSegment;
            const x = p1.x + (p2.x - p1.x) * t;
            const y = p1.y + (p2.y - p1.y) * t;
            
            // Adiciona variação para aparência orgânica
            const variation = 3;
            result.push({
                x: x + (Math.random() - 0.5) * variation,
                y: y + (Math.random() - 0.5) * variation
            });
        }
    }
    
    // Preenche pontos restantes duplicando aleatoriamente
    while (result.length < targetCount) {
        const randomPoint = result[Math.floor(Math.random() * result.length)];
        result.push({
            x: randomPoint.x + (Math.random() - 0.5) * 10,
            y: randomPoint.y + (Math.random() - 0.5) * 10
        });
    }
    
    return result;
}

/**
 * Inicia a aplicação quando o DOM estiver pronto
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
