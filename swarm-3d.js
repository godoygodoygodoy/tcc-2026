/**
 * Classe Swarm3D - Gerencia o enxame de microbots em 3D
 */
class Swarm3D {
    constructor(scene, bounds) {
        this.scene = scene;
        this.bounds = bounds;
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
        // Remove bots existentes
        for (const bot of this.bots) {
            bot.destroy(this.scene);
        }
        
        this.bots = [];
        
        for (let i = 0; i < numBots; i++) {
            const x = (Math.random() - 0.5) * (this.bounds.x * 1.8);
            const y = (Math.random() - 0.5) * (this.bounds.y * 1.8);
            const z = (Math.random() - 0.5) * (this.bounds.z * 1.8);
            
            this.bots.push(new Microbot3D(x, y, z, this.scene));
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
        
        while (unassignedBots.length > 0 && availablePoints.length > 0) {
            const bot = unassignedBots.shift();
            
            // Encontra o ponto mais próximo
            let closestPoint = availablePoints[0];
            let minDistance = bot.position.distanceTo(
                new THREE.Vector3(closestPoint.x, closestPoint.y, closestPoint.z)
            );
            let closestIndex = 0;
            
            for (let i = 1; i < availablePoints.length; i++) {
                const point = availablePoints[i];
                const dist = bot.position.distanceTo(
                    new THREE.Vector3(point.x, point.y, point.z)
                );
                
                if (dist < minDistance) {
                    minDistance = dist;
                    closestPoint = point;
                    closestIndex = i;
                }
            }
            
            bot.setTarget(closestPoint.x, closestPoint.y, closestPoint.z);
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
            const offsetZ = (Math.random() - 0.5) * 20;
            bot.setTarget(
                randomPoint.x + offsetX,
                randomPoint.y + offsetY,
                randomPoint.z + offsetZ
            );
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
            const force = new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            );
            bot.applyForce(force);
        }
    }
    
    /**
     * Calcula vizinhos próximos para cada microbot
     */
    updateNeighbors() {
        for (const bot of this.bots) {
            bot.neighbors = [];
        }
        
        // Otimização: usa grid espacial 3D
        const cellSize = this.perceptionRadius;
        const grid = new Map();
        
        // Popula o grid
        for (const bot of this.bots) {
            const cellX = Math.floor(bot.position.x / cellSize);
            const cellY = Math.floor(bot.position.y / cellSize);
            const cellZ = Math.floor(bot.position.z / cellSize);
            const key = `${cellX},${cellY},${cellZ}`;
            
            if (!grid.has(key)) {
                grid.set(key, []);
            }
            grid.get(key).push(bot);
        }
        
        // Encontra vizinhos
        for (const bot of this.bots) {
            const cellX = Math.floor(bot.position.x / cellSize);
            const cellY = Math.floor(bot.position.y / cellSize);
            const cellZ = Math.floor(bot.position.z / cellSize);
            
            // Verifica células adjacentes (27 células em 3D)
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        const key = `${cellX + dx},${cellY + dy},${cellZ + dz}`;
                        const cellBots = grid.get(key);
                        
                        if (cellBots) {
                            for (const other of cellBots) {
                                if (bot !== other) {
                                    const dist = bot.position.distanceTo(other.position);
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
                const distance = bot.seek(bot.target, this.seekStrength);
                
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
            
            bot.update(this.speedMultiplier, this.bounds);
        }
    }
    
    /**
     * Verifica se a formação está completa
     */
    isFormationComplete() {
        if (this.behaviorMode !== 'forming') return false;
        
        let allInPlace = true;
        for (const bot of this.bots) {
            if (!bot.hasTarget) continue;
            
            const dist = bot.position.distanceTo(bot.target);
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
            
            const dist = bot.position.distanceTo(bot.target);
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
