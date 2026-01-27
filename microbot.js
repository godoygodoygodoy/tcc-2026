/**
 * Classe Microbot - Representa um agente autônomo individual
 * Inspirado visualmente nos microbots do filme Big Hero 6
 */
class Microbot {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.ax = 0;
        this.ay = 0;
        
        // Propriedades visuais
        this.size = 4;
        this.maxSpeed = 3;
        this.maxForce = 0.1;
        
        // Propriedades de comportamento
        this.targetX = x;
        this.targetY = y;
        this.hasTarget = false;
        
        // Canvas bounds
        this.canvas = canvas;
        
        // Cor e aparência
        this.baseColor = { r: 20, g: 25, b: 40 };
        this.glowColor = { r: 0, g: 212, b: 255 };
        this.glowIntensity = 0;
        
        // Estado
        this.neighbors = [];
        this.inFormation = false;
    }
    
    /**
     * Aplica uma força ao microbot
     */
    applyForce(fx, fy) {
        this.ax += fx;
        this.ay += fy;
    }
    
    /**
     * Move em direção a um alvo (seek behavior)
     */
    seek(targetX, targetY, multiplier = 1.0) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const desired_vx = (dx / distance) * this.maxSpeed;
            const desired_vy = (dy / distance) * this.maxSpeed;
            
            const steer_x = (desired_vx - this.vx) * multiplier;
            const steer_y = (desired_vy - this.vy) * multiplier;
            
            // Limita a força de direção
            const steerMag = Math.sqrt(steer_x * steer_x + steer_y * steer_y);
            if (steerMag > this.maxForce) {
                const scale = this.maxForce / steerMag;
                this.applyForce(steer_x * scale, steer_y * scale);
            } else {
                this.applyForce(steer_x, steer_y);
            }
            
            // Atualiza glow baseado na distância do alvo
            if (distance < 50) {
                this.glowIntensity = Math.max(0.8, 1 - (distance / 50));
                this.inFormation = true;
            } else {
                this.glowIntensity = Math.max(0.2, this.glowIntensity - 0.02);
                this.inFormation = false;
            }
        }
        
        return distance;
    }
    
    /**
     * Alinha com microbots vizinhos (alignment)
     */
    align(neighbors, multiplier = 1.0) {
        if (neighbors.length === 0) return;
        
        let avgVx = 0;
        let avgVy = 0;
        
        for (const neighbor of neighbors) {
            avgVx += neighbor.vx;
            avgVy += neighbor.vy;
        }
        
        avgVx /= neighbors.length;
        avgVy /= neighbors.length;
        
        const steer_x = (avgVx - this.vx) * multiplier * 0.1;
        const steer_y = (avgVy - this.vy) * multiplier * 0.1;
        
        this.applyForce(steer_x, steer_y);
    }
    
    /**
     * Mantém coesão com o grupo (cohesion)
     */
    cohesion(neighbors, multiplier = 1.0) {
        if (neighbors.length === 0) return;
        
        let centerX = 0;
        let centerY = 0;
        
        for (const neighbor of neighbors) {
            centerX += neighbor.x;
            centerY += neighbor.y;
        }
        
        centerX /= neighbors.length;
        centerY /= neighbors.length;
        
        this.seek(centerX, centerY, multiplier * 0.05);
    }
    
    /**
     * Mantém separação dos vizinhos (separation)
     */
    separation(neighbors, multiplier = 1.0) {
        const desiredSeparation = 15;
        let steer_x = 0;
        let steer_y = 0;
        let count = 0;
        
        for (const neighbor of neighbors) {
            const dx = this.x - neighbor.x;
            const dy = this.y - neighbor.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0 && distance < desiredSeparation) {
                const force = 1 / distance;
                steer_x += (dx / distance) * force;
                steer_y += (dy / distance) * force;
                count++;
            }
        }
        
        if (count > 0) {
            steer_x /= count;
            steer_y /= count;
            this.applyForce(steer_x * multiplier, steer_y * multiplier);
        }
    }
    
    /**
     * Atualiza a posição e velocidade do microbot
     */
    update(speedMultiplier = 1.0) {
        // Atualiza velocidade com aceleração
        this.vx += this.ax;
        this.vy += this.ay;
        
        // Limita velocidade máxima
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const maxSpeedAdjusted = this.maxSpeed * speedMultiplier;
        
        if (speed > maxSpeedAdjusted) {
            this.vx = (this.vx / speed) * maxSpeedAdjusted;
            this.vy = (this.vy / speed) * maxSpeedAdjusted;
        }
        
        // Atualiza posição
        this.x += this.vx;
        this.y += this.vy;
        
        // Reset aceleração
        this.ax = 0;
        this.ay = 0;
        
        // Mantém dentro dos limites do canvas
        this.edges();
    }
    
    /**
     * Mantém o microbot dentro dos limites do canvas
     */
    edges() {
        const margin = 10;
        
        if (this.x < margin) {
            this.x = margin;
            this.vx *= -0.5;
        } else if (this.x > this.canvas.width - margin) {
            this.x = this.canvas.width - margin;
            this.vx *= -0.5;
        }
        
        if (this.y < margin) {
            this.y = margin;
            this.vy *= -0.5;
        } else if (this.y > this.canvas.height - margin) {
            this.y = this.canvas.height - margin;
            this.vy *= -0.5;
        }
    }
    
    /**
     * Desenha o microbot no canvas
     * Visual inspirado nos microbots do Big Hero 6
     */
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Rotação baseada na direção do movimento
        const angle = Math.atan2(this.vy, this.vx);
        ctx.rotate(angle);
        
        // Glow effect quando em formação
        if (this.glowIntensity > 0.3) {
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 3);
            gradient.addColorStop(0, `rgba(${this.glowColor.r}, ${this.glowColor.g}, ${this.glowColor.b}, ${this.glowIntensity * 0.4})`);
            gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Corpo principal - formato modular geométrico
        ctx.fillStyle = `rgb(${this.baseColor.r}, ${this.baseColor.g}, ${this.baseColor.b})`;
        ctx.strokeStyle = `rgba(${this.glowColor.r}, ${this.glowColor.g}, ${this.glowColor.b}, ${0.5 + this.glowIntensity * 0.5})`;
        ctx.lineWidth = 0.5;
        
        // Desenha hexágono (formato modular)
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angleHex = (Math.PI / 3) * i;
            const px = Math.cos(angleHex) * this.size;
            const py = Math.sin(angleHex) * this.size;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Núcleo interno brilhante
        if (this.inFormation) {
            ctx.fillStyle = `rgba(${this.glowColor.r}, ${this.glowColor.g}, ${this.glowColor.b}, ${this.glowIntensity})`;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Define um novo alvo para o microbot
     */
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.hasTarget = true;
    }
    
    /**
     * Remove o alvo atual
     */
    clearTarget() {
        this.hasTarget = false;
        this.inFormation = false;
    }
}
