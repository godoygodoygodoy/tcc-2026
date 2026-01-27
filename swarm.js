/**
 * Classe Swarm - Gerencia o enxame de microbots
 */
class Swarm {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.bots = [];
        this.targetPoints = [];
        this.behaviorMode = 'idle'; // idle, forming, dispersing
        
        // Parâmetros de comportamento
        this.cohesionStrength = 1.0;
        this.separationStrength = 1.5;
        this.alignmentStrength = 1.0;
        this.seekStrength = 2.0;
        this.speedMultiplier = 1.0;
        
        // Raio de percepção
        this.perceptionRadius = 50;
        
        // Estado
        this.isPaused = false;
    }
    
    /**
     * Inicializa o enxame com N microbots
     */
    initialize(numBots) {
        this.bots = [];
        const margin = 50;
        
        for (let i = 0; i < numBots; i++) {
            const x = margin + Math.random() * (this.canvas.width - margin * 2);
            const y = margin + Math.random() * (this.canvas.height - margin * 2);
            
            this.bots.push(new Microbot(x, y, this.canvas));
        }
        
        this.behaviorMode = 'idle';
    }
    
    /**
     * Define pontos alvo para o enxame formar uma estrutura
     */
    setTargetPoints(points) {
        this.targetPoints = points;
        this.behaviorMode = 'forming';
        
        // Atribui cada bot ao ponto mais próximo disponível
        this.assignBotsToTargets();
    }
    
    /**
     * Atribui cada microbot ao ponto alvo mais próximo
     */
    assignBotsToTargets() {
        const availablePoints = [...this.targetPoints];
        const unassignedBots = [...this.bots];
        
        // Se há mais bots do que pontos, alguns bots vão para o mesmo ponto
        while (unassignedBots.length > 0 && availablePoints.length > 0) {
            const bot = unassignedBots.shift();
            
            // Encontra o ponto mais próximo
            let closestPoint = availablePoints[0];
            let minDistance = this.distance(bot.x, bot.y, closestPoint.x, closestPoint.y);
            let closestIndex = 0;
            
            for (let i = 1; i < availablePoints.length; i++) {
                const dist = this.distance(bot.x, bot.y, availablePoints[i].x, availablePoints[i].y);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestPoint = availablePoints[i];
                    closestIndex = i;
                }
            }
            
            bot.setTarget(closestPoint.x, closestPoint.y);
            availablePoints.splice(closestIndex, 1);
            
            // Se acabaram os pontos mas ainda há bots, recicla os pontos
            if (availablePoints.length === 0 && unassignedBots.length > 0) {
                availablePoints.push(...this.targetPoints);
            }
        }
        
        // Bots extras vão para posições aleatórias próximas
        for (const bot of unassignedBots) {
            const randomPoint = this.targetPoints[Math.floor(Math.random() * this.targetPoints.length)];
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            bot.setTarget(randomPoint.x + offsetX, randomPoint.y + offsetY);
        }
    }
    
    /**
     * Dispersa os microbots
     */
    disperse() {
        this.behaviorMode = 'dispersing';
        for (const bot of this.bots) {
            bot.clearTarget();
        }
        
        // Adiciona força aleatória para dispersar
        for (const bot of this.bots) {
            const angle = Math.random() * Math.PI * 2;
            const force = 2;
            bot.applyForce(Math.cos(angle) * force, Math.sin(angle) * force);
        }
    }
    
    /**
     * Calcula vizinhos próximos para cada microbot
     */
    updateNeighbors() {
        for (const bot of this.bots) {
            bot.neighbors = [];
        }
        
        // Otimização: usa grid espacial para reduzir comparações
        const cellSize = this.perceptionRadius;
        const grid = new Map();
        
        // Popula o grid
        for (const bot of this.bots) {
            const cellX = Math.floor(bot.x / cellSize);
            const cellY = Math.floor(bot.y / cellSize);
            const key = `${cellX},${cellY}`;
            
            if (!grid.has(key)) {
                grid.set(key, []);
            }
            grid.get(key).push(bot);
        }
        
        // Encontra vizinhos
        for (const bot of this.bots) {
            const cellX = Math.floor(bot.x / cellSize);
            const cellY = Math.floor(bot.y / cellSize);
            
            // Verifica células adjacentes
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const key = `${cellX + dx},${cellY + dy}`;
                    const cellBots = grid.get(key);
                    
                    if (cellBots) {
                        for (const other of cellBots) {
                            if (bot !== other) {
                                const dist = this.distance(bot.x, bot.y, other.x, other.y);
                                if (dist < this.perceptionRadius) {
                                    bot.neighbors.push(other);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Atualiza todos os microbots
     */
    update() {
        if (this.isPaused) return;
        
        // Atualiza vizinhos
        this.updateNeighbors();
        
        // Aplica comportamentos
        for (const bot of this.bots) {
            if (this.behaviorMode === 'forming' && bot.hasTarget) {
                // Comportamento de formação
                const distance = bot.seek(bot.targetX, bot.targetY, this.seekStrength);
                
                // Aplica regras de swarm com intensidade reduzida quando próximo do alvo
                const swarmIntensity = Math.min(1, distance / 100);
                
                bot.separation(bot.neighbors, this.separationStrength);
                bot.align(bot.neighbors, this.alignmentStrength * swarmIntensity);
                bot.cohesion(bot.neighbors, this.cohesionStrength * swarmIntensity * 0.5);
                
            } else if (this.behaviorMode === 'dispersing') {
                // Comportamento de dispersão
                bot.separation(bot.neighbors, this.separationStrength * 2);
                bot.align(bot.neighbors, this.alignmentStrength * 0.5);
                
            } else {
                // Comportamento idle - swarm livre
                bot.separation(bot.neighbors, this.separationStrength);
                bot.align(bot.neighbors, this.alignmentStrength);
                bot.cohesion(bot.neighbors, this.cohesionStrength);
            }
            
            bot.update(this.speedMultiplier);
        }
    }
    
    /**
     * Renderiza todos os microbots
     */
    render() {
        for (const bot of this.bots) {
            bot.draw(this.ctx);
        }
    }
    
    /**
     * Calcula distância entre dois pontos
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Verifica se a formação está completa
     */
    isFormationComplete() {
        if (this.behaviorMode !== 'forming') return false;
        
        let allInPlace = true;
        for (const bot of this.bots) {
            if (!bot.hasTarget) continue;
            
            const dist = this.distance(bot.x, bot.y, bot.targetX, bot.targetY);
            if (dist > 30) {
                allInPlace = false;
                break;
            }
        }
        
        return allInPlace;
    }
    
    /**
     * Obtém a porcentagem de bots que alcançaram seus alvos
     */
    getFormationProgress() {
        if (this.behaviorMode !== 'forming' || this.bots.length === 0) return 0;
        
        let inPlace = 0;
        for (const bot of this.bots) {
            if (!bot.hasTarget) continue;
            
            const dist = this.distance(bot.x, bot.y, bot.targetX, bot.targetY);
            if (dist < 30) {
                inPlace++;
            }
        }
        
        return (inPlace / this.bots.length) * 100;
    }
    
    /**
     * Pausa/resume a simulação
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }
    
    /**
     * Retorna ao modo idle
     */
    idle() {
        this.behaviorMode = 'idle';
        for (const bot of this.bots) {
            bot.clearTarget();
        }
    }
}
