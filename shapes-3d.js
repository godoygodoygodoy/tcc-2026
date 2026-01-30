/**
 * Classe ShapeGenerator3D - Gera pontos 3D para diferentes formas
 */
class ShapeGenerator3D {
    /**
     * Gera pontos para formar texto em 3D
     */
    static generateText(text, numPoints = 300) {
        const points = [];
        const fontSize = 60;
        const depth = 20;
        
        // Cria canvas temporário para o texto
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 150;
        
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Amostra pixels e cria pontos 3D
        const sampleRate = 8;
        for (let y = 0; y < canvas.height; y += sampleRate) {
            for (let x = 0; x < canvas.width; x += sampleRate) {
                const index = (y * canvas.width + x) * 4;
                const alpha = pixels[index + 3];
                
                if (alpha > 128) {
                    // Adiciona profundidade (múltiplas camadas)
                    const layers = 3;
                    for (let l = 0; l < layers; l++) {
                        points.push({
                            x: x - canvas.width / 2,
                            y: -(y - canvas.height / 2),
                            z: (l - layers / 2) * (depth / layers) + (Math.random() - 0.5) * 5
                        });
                    }
                }
            }
        }
        
        return points;
    }
    
    /**
     * Gera pontos para uma esfera
     */
    static generateSphere(radius, numPoints = 300) {
        const points = [];
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
        
        for (let i = 0; i < numPoints; i++) {
            const y = 1 - (i / (numPoints - 1)) * 2;
            const radiusAtY = Math.sqrt(1 - y * y);
            const theta = phi * i;
            
            const x = Math.cos(theta) * radiusAtY;
            const z = Math.sin(theta) * radiusAtY;
            
            points.push({
                x: x * radius + (Math.random() - 0.5) * 3,
                y: y * radius + (Math.random() - 0.5) * 3,
                z: z * radius + (Math.random() - 0.5) * 3
            });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para um cubo
     */
    static generateCube(size, numPoints = 300) {
        const points = [];
        const half = size / 2;
        
        for (let i = 0; i < numPoints; i++) {
            const x = (Math.random() - 0.5) * size;
            const y = (Math.random() - 0.5) * size;
            const z = (Math.random() - 0.5) * size;
            
            points.push({ x, y, z });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para uma pirâmide
     */
    static generatePyramid(size, numPoints = 300) {
        const points = [];
        const height = size;
        const base = size;
        
        for (let i = 0; i < numPoints; i++) {
            const y = (Math.random() - 0.5) * height;
            const scale = (1 - Math.abs(y) / (height / 2));
            
            const x = (Math.random() - 0.5) * base * scale;
            const z = (Math.random() - 0.5) * base * scale;
            
            points.push({ x, y, z });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para um coração em 3D
     */
    static generateHeart(size, numPoints = 300) {
        const points = [];
        
        for (let i = 0; i < numPoints; i++) {
            const t = (i / numPoints) * Math.PI * 2;
            const u = (Math.random() - 0.5) * Math.PI;
            
            // Equação paramétrica 3D de um coração
            const x = size * 16 * Math.pow(Math.sin(t), 3);
            const y = size * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            const z = size * 10 * Math.sin(u);
            
            points.push({
                x: x / 20 + (Math.random() - 0.5) * 3,
                y: -y / 20 + (Math.random() - 0.5) * 3,
                z: z / 20 + (Math.random() - 0.5) * 3
            });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para uma estrela 3D
     */
    static generateStar(radius, numPoints = 300) {
        const points = [];
        const spikes = 5;
        const innerRadius = radius * 0.4;
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const spike = Math.floor(angle / (Math.PI * 2 / spikes));
            const angleInSpike = angle % (Math.PI * 2 / spikes);
            const normalizedAngle = angleInSpike / (Math.PI * 2 / spikes);
            
            let r;
            if (normalizedAngle < 0.5) {
                r = radius;
            } else {
                r = innerRadius;
            }
            
            const radiusVariation = Math.random() * r;
            const heightVariation = (Math.random() - 0.5) * 20;
            
            const x = Math.cos(angle) * radiusVariation;
            const z = Math.sin(angle) * radiusVariation;
            const y = heightVariation;
            
            points.push({ x, y, z });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para uma hélice (DNA-like)
     */
    static generateHelix(radius, height, numPoints = 300) {
        const points = [];
        const turns = 4;
        
        for (let i = 0; i < numPoints; i++) {
            const t = (i / numPoints) * turns * Math.PI * 2;
            const y = (i / numPoints) * height - height / 2;
            
            const x = Math.cos(t) * radius;
            const z = Math.sin(t) * radius;
            
            points.push({
                x: x + (Math.random() - 0.5) * 3,
                y: y + (Math.random() - 0.5) * 3,
                z: z + (Math.random() - 0.5) * 3
            });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para um torus (rosquinha)
     */
    static generateTorus(majorRadius, minorRadius, numPoints = 300) {
        const points = [];
        
        for (let i = 0; i < numPoints; i++) {
            const u = (i / numPoints) * Math.PI * 2;
            const v = Math.random() * Math.PI * 2;
            
            const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
            const y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
            const z = minorRadius * Math.sin(v);
            
            points.push({ x, y, z });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para dupla hélice (DNA)
     */
    static generateDNA(radius, height, numPoints = 300) {
        const points = [];
        const turns = 3;
        const pointsPerStrand = Math.floor(numPoints / 2);
        
        // Primeira hélice
        for (let i = 0; i < pointsPerStrand; i++) {
            const t = (i / pointsPerStrand) * turns * Math.PI * 2;
            const y = (i / pointsPerStrand) * height - height / 2;
            
            points.push({
                x: Math.cos(t) * radius,
                y: y,
                z: Math.sin(t) * radius
            });
        }
        
        // Segunda hélice (oposta)
        for (let i = 0; i < pointsPerStrand; i++) {
            const t = (i / pointsPerStrand) * turns * Math.PI * 2 + Math.PI;
            const y = (i / pointsPerStrand) * height - height / 2;
            
            points.push({
                x: Math.cos(t) * radius,
                y: y,
                z: Math.sin(t) * radius
            });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para floco de neve 3D
     */
    static generateSnow3D(size, numPoints = 300) {
        const points = [];
        const branches = 6;
        const armLength = size;
        
        // Centro
        for (let i = 0; i < 10; i++) {
            points.push({
                x: (Math.random() - 0.5) * 5,
                y: (Math.random() - 0.5) * 5,
                z: (Math.random() - 0.5) * 5
            });
        }
        
        const pointsPerBranch = Math.floor((numPoints - 10) / (branches * 2));
        
        // Braços no plano XY
        for (let b = 0; b < branches; b++) {
            const angle = (b / branches) * Math.PI * 2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            for (let i = 0; i < pointsPerBranch; i++) {
                const t = i / pointsPerBranch;
                const distance = t * armLength;
                
                points.push({
                    x: cos * distance + (Math.random() - 0.5) * 2,
                    y: sin * distance + (Math.random() - 0.5) * 2,
                    z: (Math.random() - 0.5) * 5
                });
                
                // Ramificações
                if (i % 10 === 0 && i > 0) {
                    const branchAngle = angle + (Math.random() > 0.5 ? 1 : -1) * Math.PI / 4;
                    const branchDist = distance * 0.3;
                    
                    points.push({
                        x: cos * distance + Math.cos(branchAngle) * branchDist,
                        y: sin * distance + Math.sin(branchAngle) * branchDist,
                        z: (Math.random() - 0.5) * 5
                    });
                }
            }
        }
        
        return points;
    }
    
    /**
     * Converte pontos 2D para 3D (compatibilidade)
     */
    static convert2DTo3D(points2D, depth = 20) {
        return points2D.map(p => ({
            x: p.x,
            y: p.y,
            z: (Math.random() - 0.5) * depth
        }));
    }
}
