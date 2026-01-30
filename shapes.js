/**
 * Classe ShapeGenerator - Gera pontos para diferentes formas e textos
 */
class ShapeGenerator {
    /**
     * Gera pontos para formar texto
     */
    static generateText(text, centerX, centerY, spacing = 25) {
        const points = [];
        const fontSize = 80;
        
        // Cria um canvas temporário para renderizar o texto
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = 1000;
        tempCanvas.height = 200;
        
        tempCtx.font = `bold ${fontSize}px Arial`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillStyle = 'white';
        tempCtx.fillText(text.toUpperCase(), tempCanvas.width / 2, tempCanvas.height / 2);
        
        // Extrai pixels do texto
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixels = imageData.data;
        
        // Amostra pixels para criar pontos
        const sampleRate = 6;
        for (let y = 0; y < tempCanvas.height; y += sampleRate) {
            for (let x = 0; x < tempCanvas.width; x += sampleRate) {
                const index = (y * tempCanvas.width + x) * 4;
                const alpha = pixels[index + 3];
                
                if (alpha > 128) {
                    // Adiciona variação aleatória para aparência mais orgânica
                    const offsetX = (Math.random() - 0.5) * 3;
                    const offsetY = (Math.random() - 0.5) * 3;
                    
                    points.push({
                        x: centerX + (x - tempCanvas.width / 2) + offsetX,
                        y: centerY + (y - tempCanvas.height / 2) + offsetY
                    });
                }
            }
        }
        
        return points;
    }
    
    /**
     * Gera pontos para um círculo
     */
    static generateCircle(centerX, centerY, radius, numPoints = 500) {
        const points = [];
        
        // Círculo preenchido com múltiplos anéis
        const rings = Math.floor(radius / 10);
        
        for (let ring = 0; ring < rings; ring++) {
            const r = (radius / rings) * (ring + 1);
            const pointsInRing = Math.floor(numPoints / rings);
            
            for (let i = 0; i < pointsInRing; i++) {
                const angle = (i / pointsInRing) * Math.PI * 2;
                // Adiciona variação para aparência orgânica
                const variation = (Math.random() - 0.5) * 5;
                
                points.push({
                    x: centerX + Math.cos(angle) * r + variation,
                    y: centerY + Math.sin(angle) * r + variation
                });
            }
        }
        
        return points;
    }
    
    /**
     * Gera pontos para um quadrado
     */
    static generateSquare(centerX, centerY, size, numPoints = 500) {
        const points = [];
        const half = size / 2;
        const density = Math.sqrt(numPoints / (size * size));
        
        for (let y = -half; y < half; y += 1 / density) {
            for (let x = -half; x < half; x += 1 / density) {
                const variation = (Math.random() - 0.5) * 3;
                points.push({
                    x: centerX + x + variation,
                    y: centerY + y + variation
                });
            }
        }
        
        return points;
    }
    
    /**
     * Gera pontos para um triângulo
     */
    static generateTriangle(centerX, centerY, size, numPoints = 500) {
        const points = [];
        const height = size * Math.sqrt(3) / 2;
        
        for (let i = 0; i < numPoints; i++) {
            let x, y;
            
            do {
                x = (Math.random() - 0.5) * size;
                y = (Math.random() - 0.5) * height;
                
                // Verifica se está dentro do triângulo
            } while (!this.isPointInTriangle(x, y, size, height));
            
            points.push({
                x: centerX + x,
                y: centerY + y
            });
        }
        
        return points;
    }
    
    static isPointInTriangle(x, y, size, height) {
        const half = size / 2;
        
        // Vértices do triângulo
        const v1 = { x: 0, y: -height / 2 };
        const v2 = { x: -half, y: height / 2 };
        const v3 = { x: half, y: height / 2 };
        
        const sign = (p1, p2, p3) => {
            return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
        };
        
        const p = { x, y };
        const d1 = sign(p, v1, v2);
        const d2 = sign(p, v2, v3);
        const d3 = sign(p, v3, v1);
        
        const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
        
        return !(hasNeg && hasPos);
    }
    
    /**
     * Gera pontos para um coração
     */
    static generateHeart(centerX, centerY, size, numPoints = 500) {
        const points = [];
        
        for (let i = 0; i < numPoints; i++) {
            const t = (i / numPoints) * Math.PI * 2;
            
            // Equação paramétrica de um coração
            const x = size * 16 * Math.pow(Math.sin(t), 3);
            const y = -size * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            
            const variation = (Math.random() - 0.5) * 3;
            
            points.push({
                x: centerX + x / 20 + variation,
                y: centerY + y / 20 + variation
            });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para uma estrela
     */
    static generateStar(centerX, centerY, outerRadius, numPoints = 500) {
        const points = [];
        const innerRadius = outerRadius * 0.4;
        const spikes = 5;
        
        // Gera pontos ao longo do contorno e interior
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const spike = Math.floor(angle / (Math.PI * 2 / spikes));
            const angleInSpike = angle % (Math.PI * 2 / spikes);
            const normalizedAngle = angleInSpike / (Math.PI * 2 / spikes);
            
            // Interpola entre raio interno e externo
            let radius;
            if (normalizedAngle < 0.5) {
                radius = outerRadius;
            } else {
                radius = innerRadius;
            }
            
            // Adiciona variação radial
            const radiusVariation = Math.random() * radius;
            
            const x = Math.cos(angle) * radiusVariation;
            const y = Math.sin(angle) * radiusVariation;
            
            points.push({
                x: centerX + x,
                y: centerY + y
            });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para uma espiral
     */
    static generateSpiral(centerX, centerY, maxRadius, numPoints = 500) {
        const points = [];
        const turns = 3;
        
        for (let i = 0; i < numPoints; i++) {
            const t = (i / numPoints) * turns * Math.PI * 2;
            const radius = (i / numPoints) * maxRadius;
            
            const variation = (Math.random() - 0.5) * 5;
            
            points.push({
                x: centerX + Math.cos(t) * radius + variation,
                y: centerY + Math.sin(t) * radius + variation
            });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para um emoji de sorriso
     */
    static generateSmile(centerX, centerY, radius, numPoints = 500) {
        const points = [];
        
        // Contorno do rosto (círculo)
        const facePoints = Math.floor(numPoints * 0.6);
        for (let i = 0; i < facePoints; i++) {
            const angle = (i / facePoints) * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * 3;
            
            points.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r
            });
        }
        
        // Olhos
        const eyePoints = Math.floor(numPoints * 0.15);
        const eyeY = centerY - radius * 0.3;
        
        // Olho esquerdo
        for (let i = 0; i < eyePoints; i++) {
            const angle = (i / eyePoints) * Math.PI * 2;
            const r = radius * 0.15;
            points.push({
                x: centerX - radius * 0.35 + Math.cos(angle) * r,
                y: eyeY + Math.sin(angle) * r
            });
        }
        
        // Olho direito
        for (let i = 0; i < eyePoints; i++) {
            const angle = (i / eyePoints) * Math.PI * 2;
            const r = radius * 0.15;
            points.push({
                x: centerX + radius * 0.35 + Math.cos(angle) * r,
                y: eyeY + Math.sin(angle) * r
            });
        }
        
        // Sorriso (arco)
        const smilePoints = Math.floor(numPoints * 0.25);
        for (let i = 0; i < smilePoints; i++) {
            const t = (i / smilePoints) * Math.PI;
            const angle = Math.PI * 0.2 + t * 0.6;
            const r = radius * 0.6;
            
            points.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r
            });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para uma seta
     */
    static generateArrow(centerX, centerY, length, numPoints = 500) {
        const points = [];
        const width = length * 0.3;
        const headLength = length * 0.4;
        const headWidth = width * 2;
        
        // Corpo da seta
        const bodyPoints = Math.floor(numPoints * 0.5);
        const bodyLength = length - headLength;
        
        for (let i = 0; i < bodyPoints; i++) {
            const x = -length / 2 + (i / bodyPoints) * bodyLength;
            const y = (Math.random() - 0.5) * width;
            
            points.push({
                x: centerX + x,
                y: centerY + y
            });
        }
        
        // Cabeça da seta (triângulo)
        const headPoints = Math.floor(numPoints * 0.5);
        for (let i = 0; i < headPoints; i++) {
            const progress = i / headPoints;
            const x = -length / 2 + bodyLength + progress * headLength;
            const maxY = headWidth * (1 - progress);
            const y = (Math.random() - 0.5) * maxY;
            
            points.push({
                x: centerX + x,
                y: centerY + y
            });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para símbolo de infinito
     */
    static generateInfinity(centerX, centerY, size, numPoints = 500) {
        const points = [];
        
        for (let i = 0; i < numPoints; i++) {
            const t = (i / numPoints) * Math.PI * 2;
            
            // Equação paramétrica do infinito (lemniscata)
            const scale = size * 0.8;
            const x = scale * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
            const y = scale * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
            
            const variation = (Math.random() - 0.5) * 3;
            
            points.push({
                x: centerX + x + variation,
                y: centerY + y + variation
            });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para uma onda
     */
    static generateWave(centerX, centerY, width, height, numPoints = 500) {
        const points = [];
        const wavelength = width / 3;
        
        for (let i = 0; i < numPoints; i++) {
            const x = -width / 2 + (i / numPoints) * width;
            const y = Math.sin((x / wavelength) * Math.PI * 2) * height;
            
            const variation = (Math.random() - 0.5) * 5;
            
            points.push({
                x: centerX + x + variation,
                y: centerY + y + variation
            });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para um raio (lightning)
     */
    static generateLightning(centerX, centerY, height, numPoints = 500) {
        const points = [];
        const segments = 10;
        const segmentHeight = height / segments;
        const zigzagWidth = 60;
        
        let currentX = centerX;
        let currentY = centerY - height / 2;
        
        const pathPoints = [{ x: currentX, y: currentY }];
        
        // Cria o caminho em zig-zag
        for (let i = 0; i < segments; i++) {
            currentY += segmentHeight;
            // Alterna entre esquerda e direita com variação
            const direction = (i % 2 === 0) ? 1 : -1;
            currentX += direction * (zigzagWidth * 0.5 + Math.random() * zigzagWidth * 0.5);
            pathPoints.push({ x: currentX, y: currentY });
        }
        
        // Interpola pontos ao longo do caminho
        const pointsPerSegment = Math.floor(numPoints / (pathPoints.length - 1));
        
        for (let i = 0; i < pathPoints.length - 1; i++) {
            const p1 = pathPoints[i];
            const p2 = pathPoints[i + 1];
            
            for (let j = 0; j < pointsPerSegment; j++) {
                const t = j / pointsPerSegment;
                const x = p1.x + (p2.x - p1.x) * t;
                const y = p1.y + (p2.y - p1.y) * t;
                
                // Adiciona espessura ao raio (mais grosso no centro)
                const thickness = 6;
                const offsetX = (Math.random() - 0.5) * thickness;
                const offsetY = (Math.random() - 0.5) * thickness * 0.5;
                
                points.push({ x: x + offsetX, y: y + offsetY });
            }
        }
        
        // Adiciona alguns raios menores (ramificações)
        const branches = 3;
        const branchPoints = Math.floor(numPoints * 0.1 / branches);
        
        for (let b = 0; b < branches; b++) {
            const branchStart = pathPoints[Math.floor(pathPoints.length * (0.3 + b * 0.2))];
            const direction = (Math.random() > 0.5) ? 1 : -1;
            
            for (let i = 0; i < branchPoints; i++) {
                const t = i / branchPoints;
                const x = branchStart.x + direction * t * 30;
                const y = branchStart.y + t * 20;
                
                points.push({
                    x: x + (Math.random() - 0.5) * 3,
                    y: y + (Math.random() - 0.5) * 3
                });
            }
        }
        
        return points;
    }
    
    /**
     * Gera pontos para símbolo de paz
     */
    static generatePeace(centerX, centerY, radius, numPoints = 500) {
        const points = [];
        
        // Círculo externo
        const circlePoints = Math.floor(numPoints * 0.5);
        for (let i = 0; i < circlePoints; i++) {
            const angle = (i / circlePoints) * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * 3;
            
            points.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r
            });
        }
        
        // Linha vertical
        const vLinePoints = Math.floor(numPoints * 0.2);
        for (let i = 0; i < vLinePoints; i++) {
            const y = centerY - radius + (i / vLinePoints) * (radius * 2);
            const thickness = 4;
            
            points.push({
                x: centerX + (Math.random() - 0.5) * thickness,
                y: y
            });
        }
        
        // Linha diagonal esquerda
        const dLeftPoints = Math.floor(numPoints * 0.15);
        for (let i = 0; i < dLeftPoints; i++) {
            const t = i / dLeftPoints;
            const x = centerX - t * radius * 0.7;
            const y = centerY + t * radius;
            const thickness = 4;
            
            points.push({
                x: x + (Math.random() - 0.5) * thickness,
                y: y + (Math.random() - 0.5) * thickness
            });
        }
        
        // Linha diagonal direita
        const dRightPoints = Math.floor(numPoints * 0.15);
        for (let i = 0; i < dRightPoints; i++) {
            const t = i / dRightPoints;
            const x = centerX + t * radius * 0.7;
            const y = centerY + t * radius;
            const thickness = 4;
            
            points.push({
                x: x + (Math.random() - 0.5) * thickness,
                y: y + (Math.random() - 0.5) * thickness
            });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para nota musical
     */
    static generateMusic(centerX, centerY, size, numPoints = 500) {
        const points = [];
        
        // Cabeça da nota (círculo)
        const headRadius = size * 0.2;
        const headPoints = Math.floor(numPoints * 0.3);
        
        for (let i = 0; i < headPoints; i++) {
            const angle = (i / headPoints) * Math.PI * 2;
            const r = headRadius * (0.5 + Math.random() * 0.5);
            
            points.push({
                x: centerX - size * 0.3 + Math.cos(angle) * r,
                y: centerY + size * 0.3 + Math.sin(angle) * r
            });
        }
        
        // Haste vertical
        const stemPoints = Math.floor(numPoints * 0.4);
        for (let i = 0; i < stemPoints; i++) {
            const y = centerY + size * 0.3 - (i / stemPoints) * size * 0.8;
            const thickness = 3;
            
            points.push({
                x: centerX - size * 0.3 + headRadius + (Math.random() - 0.5) * thickness,
                y: y
            });
        }
        
        // Bandeira (curva)
        const flagPoints = Math.floor(numPoints * 0.3);
        for (let i = 0; i < flagPoints; i++) {
            const t = i / flagPoints;
            const angle = t * Math.PI;
            const x = centerX - size * 0.3 + headRadius + Math.sin(angle) * size * 0.3;
            const y = centerY - size * 0.5 + t * size * 0.3;
            
            points.push({
                x: x + (Math.random() - 0.5) * 3,
                y: y + (Math.random() - 0.5) * 3
            });
        }
        
        return points;
    }
    
    /**
     * Gera pontos para um sol
     */
    static generateSun(centerX, centerY, radius, numPoints = 500) {
        const points = [];
        const rays = 12;
        
        // Círculo central
        const centerPoints = Math.floor(numPoints * 0.5);
        for (let i = 0; i < centerPoints; i++) {
            const angle = (i / centerPoints) * Math.PI * 2;
            const r = radius * 0.5 * Math.random();
            
            points.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r
            });
        }
        
        // Raios
        const rayPoints = Math.floor(numPoints * 0.5 / rays);
        for (let i = 0; i < rays; i++) {
            const angle = (i / rays) * Math.PI * 2;
            
            for (let j = 0; j < rayPoints; j++) {
                const t = j / rayPoints;
                const r = radius * 0.5 + t * radius * 0.5;
                const width = (1 - t) * 10;
                
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                
                points.push({
                    x: x + (Math.random() - 0.5) * width,
                    y: y + (Math.random() - 0.5) * width
                });
            }
        }
        
        return points;
    }
    
    /**
     * Gera pontos para uma lua crescente
     */
    static generateMoon(centerX, centerY, radius, numPoints = 500) {
        const points = [];
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            
            // Círculo externo
            const x1 = Math.cos(angle) * radius;
            const y1 = Math.sin(angle) * radius;
            
            // Círculo interno (deslocado)
            const offset = radius * 0.4;
            const innerRadius = radius * 0.8;
            const x2 = Math.cos(angle) * innerRadius + offset;
            const y2 = Math.sin(angle) * innerRadius;
            
            // Verifica se o ponto está na área da lua crescente
            const distToInner = Math.sqrt(x2 * x2 + y2 * y2);
            
            if (Math.sqrt((x1 - offset) * (x1 - offset) + y1 * y1) > innerRadius) {
                points.push({
                    x: centerX + x1 + (Math.random() - 0.5) * 3,
                    y: centerY + y1 + (Math.random() - 0.5) * 3
                });
            }
        }
        
        return points;
    }
    
    /**
     * Gera pontos para uma flor
     */
    static generateFlower(centerX, centerY, radius, numPoints = 500) {
        const points = [];
        const petals = 8;
        
        // Centro da flor
        const centerPoints = Math.floor(numPoints * 0.3);
        const centerRadius = radius * 0.2;
        
        for (let i = 0; i < centerPoints; i++) {
            const angle = (i / centerPoints) * Math.PI * 2;
            const r = centerRadius * Math.random();
            
            points.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r
            });
        }
        
        // Pétalas
        const petalPoints = Math.floor(numPoints * 0.7 / petals);
        
        for (let i = 0; i < petals; i++) {
            const angle = (i / petals) * Math.PI * 2;
            
            for (let j = 0; j < petalPoints; j++) {
                const t = j / petalPoints;
                
                // Forma de pétala usando função paramétrica
                const petalAngle = t * Math.PI;
                const r = Math.sin(petalAngle) * radius * 0.6;
                const petalX = Math.cos(angle) * (centerRadius + r);
                const petalY = Math.sin(angle) * (centerRadius + r);
                
                // Adiciona largura à pétala
                const perpAngle = angle + Math.PI / 2;
                const width = Math.sin(petalAngle) * radius * 0.2;
                const offsetX = Math.cos(perpAngle) * (Math.random() - 0.5) * width;
                const offsetY = Math.sin(perpAngle) * (Math.random() - 0.5) * width;
                
                points.push({
                    x: centerX + petalX + offsetX,
                    y: centerY + petalY + offsetY
                });
            }
        }
        
        return points;
    }
    
    /**
     * Gera pontos para um thumbs up (👍)
     */
    static generateThumbsUp(centerX, centerY, size, numPoints = 500) {
        const points = [];
        
        // Polegar (parte superior)
        const thumbPoints = Math.floor(numPoints * 0.35);
        const thumbRadius = size * 0.15;
        const thumbX = centerX - size * 0.15;
        const thumbY = centerY - size * 0.25;
        
        for (let i = 0; i < thumbPoints; i++) {
            const angle = (i / thumbPoints) * Math.PI * 2;
            const r = thumbRadius * (0.5 + Math.random() * 0.5);
            
            points.push({
                x: thumbX + Math.cos(angle) * r,
                y: thumbY + Math.sin(angle) * r
            });
        }
        
        // Haste do polegar (conexão)
        const stemPoints = Math.floor(numPoints * 0.1);
        for (let i = 0; i < stemPoints; i++) {
            const t = i / stemPoints;
            const x = thumbX + t * size * 0.15;
            const y = thumbY + t * size * 0.15;
            const width = 15;
            
            points.push({
                x: x + (Math.random() - 0.5) * width,
                y: y + (Math.random() - 0.5) * width
            });
        }
        
        // Mão (retângulo arredondado vertical)
        const handWidth = size * 0.35;
        const handHeight = size * 0.5;
        const handX = centerX;
        const handY = centerY + size * 0.1;
        const handPoints = Math.floor(numPoints * 0.55);
        
        for (let i = 0; i < handPoints; i++) {
            const x = handX - handWidth / 2 + Math.random() * handWidth;
            const y = handY - handHeight / 2 + Math.random() * handHeight;
            
            // Arredonda os cantos
            const dx = Math.abs(x - handX) / (handWidth / 2);
            const dy = Math.abs(y - handY) / (handHeight / 2);
            
            if (dx * dx + dy * dy < 1.2) {
                points.push({ x, y });
            }
        }
        
        return points;
    }
    
    /**
     * Gera pontos para uma aranha (🕷️)
     */
    static generateSpider(centerX, centerY, size, numPoints = 500) {
        const points = [];
        
        // Corpo (oval)
        const bodyPoints = Math.floor(numPoints * 0.3);
        const bodyWidth = size * 0.25;
        const bodyHeight = size * 0.35;
        
        for (let i = 0; i < bodyPoints; i++) {
            const angle = (i / bodyPoints) * Math.PI * 2;
            const r = Math.random();
            const x = Math.cos(angle) * bodyWidth * r;
            const y = Math.sin(angle) * bodyHeight * r;
            
            points.push({
                x: centerX + x,
                y: centerY + y
            });
        }
        
        // Cabeça (círculo menor)
        const headPoints = Math.floor(numPoints * 0.15);
        const headRadius = size * 0.12;
        const headY = centerY - bodyHeight * 0.7;
        
        for (let i = 0; i < headPoints; i++) {
            const angle = (i / headPoints) * Math.PI * 2;
            const r = headRadius * Math.random();
            
            points.push({
                x: centerX + Math.cos(angle) * r,
                y: headY + Math.sin(angle) * r
            });
        }
        
        // 8 pernas (4 de cada lado)
        const legs = 8;
        const legPoints = Math.floor(numPoints * 0.55 / legs);
        
        for (let legIndex = 0; legIndex < legs; legIndex++) {
            const side = legIndex < 4 ? -1 : 1; // Esquerda ou direita
            const legNum = legIndex % 4; // Número da perna no lado
            
            // Posição inicial da perna no corpo
            const startY = centerY - bodyHeight * 0.3 + (legNum * bodyHeight * 0.2);
            const startX = centerX + side * bodyWidth * 0.8;
            
            // Cria uma perna curvada
            for (let i = 0; i < legPoints; i++) {
                const t = i / legPoints;
                
                // Curva da perna (para cima, para fora, para baixo)
                const angle = side * (Math.PI * 0.3 + t * Math.PI * 0.4);
                const distance = t * size * 0.6;
                
                const x = startX + Math.cos(angle) * distance;
                const y = startY + Math.sin(angle) * distance * 0.5;
                
                // Espessura da perna (mais fina nas pontas)
                const thickness = (1 - t) * 3 + 1;
                
                points.push({
                    x: x + (Math.random() - 0.5) * thickness,
                    y: y + (Math.random() - 0.5) * thickness
                });
            }
        }
        
        return points;
    }
    
    /**
     * Gera pontos para um floco de neve (❄️)
     */
    static generateSnow(centerX, centerY, size, numPoints = 500) {
        const points = [];
        const branches = 6; // Floco de neve tem 6 braços
        const armLength = size * 0.6;
        
        // Centro do floco
        const centerPoints = Math.floor(numPoints * 0.05);
        const centerRadius = size * 0.05;
        
        for (let i = 0; i < centerPoints; i++) {
            const angle = (i / centerPoints) * Math.PI * 2;
            const r = centerRadius * Math.random();
            
            points.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r
            });
        }
        
        // 6 braços principais
        const pointsPerBranch = Math.floor((numPoints - centerPoints) / branches);
        
        for (let b = 0; b < branches; b++) {
            const mainAngle = (b / branches) * Math.PI * 2;
            const cos = Math.cos(mainAngle);
            const sin = Math.sin(mainAngle);
            
            // Braço principal
            const mainArmPoints = Math.floor(pointsPerBranch * 0.4);
            for (let i = 0; i < mainArmPoints; i++) {
                const t = i / mainArmPoints;
                const distance = t * armLength;
                const thickness = 3;
                
                points.push({
                    x: centerX + cos * distance + (Math.random() - 0.5) * thickness,
                    y: centerY + sin * distance + (Math.random() - 0.5) * thickness
                });
            }
            
            // Ramificações laterais (3 pares por braço)
            const branchPairs = 3;
            const branchPointsPerPair = Math.floor(pointsPerBranch * 0.3 / branchPairs);
            
            for (let bp = 0; bp < branchPairs; bp++) {
                const branchDistance = (bp + 1) / (branchPairs + 1) * armLength;
                const branchLength = armLength * 0.25;
                
                // Ramificação esquerda e direita
                for (let side = -1; side <= 1; side += 2) {
                    const branchAngle = mainAngle + side * (Math.PI / 4);
                    const branchCos = Math.cos(branchAngle);
                    const branchSin = Math.sin(branchAngle);
                    
                    for (let i = 0; i < branchPointsPerPair; i++) {
                        const t = i / branchPointsPerPair;
                        const startX = centerX + cos * branchDistance;
                        const startY = centerY + sin * branchDistance;
                        
                        const x = startX + branchCos * branchLength * t;
                        const y = startY + branchSin * branchLength * t;
                        
                        points.push({
                            x: x + (Math.random() - 0.5) * 2,
                            y: y + (Math.random() - 0.5) * 2
                        });
                    }
                }
            }
            
            // Pequenas ramificações nas pontas
            const tipBranchPoints = Math.floor(pointsPerBranch * 0.1);
            for (let side = -1; side <= 1; side += 2) {
                const tipAngle = mainAngle + side * (Math.PI / 6);
                const tipLength = armLength * 0.15;
                
                for (let i = 0; i < tipBranchPoints; i++) {
                    const t = i / tipBranchPoints;
                    const startX = centerX + cos * armLength;
                    const startY = centerY + sin * armLength;
                    
                    points.push({
                        x: startX + Math.cos(tipAngle) * tipLength * t + (Math.random() - 0.5) * 2,
                        y: startY + Math.sin(tipAngle) * tipLength * t + (Math.random() - 0.5) * 2
                    });
                }
            }
        }
        
        return points;
    }
}
