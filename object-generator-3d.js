/**
 * ObjectGenerator3D - Gera formas 3D baseadas em descrições de texto
 * Usa palavras-chave para criar objetos reconhecíveis
 */
class ObjectGenerator3D {
    /**
     * Gera pontos 3D baseado na descrição do texto
     */
    static generateFromText(text, numPoints = 300) {
        const lowerText = text.toLowerCase().trim();
        
        // Dicionário de objetos reconhecíveis
        const objectMap = {
            // Animais
            'pato': () => this.generateDuck(numPoints),
            'duck': () => this.generateDuck(numPoints),
            'passaro': () => this.generateBird(numPoints),
            'pássaro': () => this.generateBird(numPoints),
            'bird': () => this.generateBird(numPoints),
            'peixe': () => this.generateFish(numPoints),
            'fish': () => this.generateFish(numPoints),
            'borboleta': () => this.generateButterfly(numPoints),
            'butterfly': () => this.generateButterfly(numPoints),
            
            // Objetos
            'aviao': () => this.generateAirplane(numPoints),
            'avião': () => this.generateAirplane(numPoints),
            'airplane': () => this.generateAirplane(numPoints),
            'carro': () => this.generateCar(numPoints),
            'car': () => this.generateCar(numPoints),
            'foguete': () => this.generateRocket(numPoints),
            'rocket': () => this.generateRocket(numPoints),
            'casa': () => this.generateHouse(numPoints),
            'house': () => this.generateHouse(numPoints),
            'arvore': () => this.generateTree(numPoints),
            'árvore': () => this.generateTree(numPoints),
            'tree': () => this.generateTree(numPoints),
            
            // Símbolos/Emojis
            'coracao': () => ShapeGenerator3D.generateHeart(100, numPoints),
            'coração': () => ShapeGenerator3D.generateHeart(100, numPoints),
            'heart': () => ShapeGenerator3D.generateHeart(100, numPoints),
            'estrela': () => ShapeGenerator3D.generateStar(100, numPoints),
            'star': () => ShapeGenerator3D.generateStar(100, numPoints),
        };
        
        // Procura por correspondência
        for (const [key, generator] of Object.entries(objectMap)) {
            if (lowerText.includes(key)) {
                console.log(`Objeto detectado: ${key}`);
                return generator();
            }
        }
        
        // Se não encontrou objeto, retorna null (vai usar texto normal)
        return null;
    }
    
    /**
     * Gera um pato em 3D
     */
    static generateDuck(numPoints) {
        const points = [];
        
        // Corpo (elipse)
        for (let i = 0; i < numPoints * 0.4; i++) {
            const phi = Math.acos(1 - 2 * (i / (numPoints * 0.4)));
            const theta = Math.PI * (3 - Math.sqrt(5)) * i;
            
            const x = Math.sin(phi) * Math.cos(theta) * 40;
            const y = Math.sin(phi) * Math.sin(theta) * 30 - 20;
            const z = Math.cos(phi) * 35;
            
            points.push({ x, y, z });
        }
        
        // Cabeça (esfera menor)
        for (let i = 0; i < numPoints * 0.25; i++) {
            const phi = Math.acos(1 - 2 * (i / (numPoints * 0.25)));
            const theta = Math.PI * (3 - Math.sqrt(5)) * i;
            
            const x = Math.sin(phi) * Math.cos(theta) * 20 + 35;
            const y = Math.sin(phi) * Math.sin(theta) * 20 + 20;
            const z = Math.cos(phi) * 20;
            
            points.push({ x, y, z });
        }
        
        // Bico
        for (let i = 0; i < numPoints * 0.1; i++) {
            const t = i / (numPoints * 0.1);
            points.push({
                x: 50 + t * 15,
                y: 20 + (Math.random() - 0.5) * 8,
                z: (Math.random() - 0.5) * 8
            });
        }
        
        // Asas (2)
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < numPoints * 0.125; i++) {
                const t = i / (numPoints * 0.125);
                const angle = t * Math.PI * 0.7;
                
                points.push({
                    x: -10 + Math.cos(angle) * 30,
                    y: -10 + Math.sin(angle) * 25,
                    z: side * (15 + t * 20)
                });
            }
        }
        
        return points;
    }
    
    /**
     * Gera um pássaro em voo
     */
    static generateBird(numPoints) {
        const points = [];
        
        // Corpo central (pequeno)
        for (let i = 0; i < numPoints * 0.2; i++) {
            const phi = Math.acos(1 - 2 * (i / (numPoints * 0.2)));
            const theta = Math.PI * (3 - Math.sqrt(5)) * i;
            
            points.push({
                x: Math.sin(phi) * Math.cos(theta) * 15,
                y: Math.sin(phi) * Math.sin(theta) * 12,
                z: Math.cos(phi) * 15
            });
        }
        
        // Asas abertas (V invertido)
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < numPoints * 0.4; i++) {
                const t = i / (numPoints * 0.4);
                
                points.push({
                    x: -20 - t * 40,
                    y: 10 + t * 50,
                    z: side * (5 + t * 40) + (Math.random() - 0.5) * 5
                });
            }
        }
        
        return points;
    }
    
    /**
     * Gera um peixe
     */
    static generateFish(numPoints) {
        const points = [];
        
        // Corpo (elipsoide)
        for (let i = 0; i < numPoints * 0.5; i++) {
            const phi = Math.acos(1 - 2 * (i / (numPoints * 0.5)));
            const theta = Math.PI * (3 - Math.sqrt(5)) * i;
            
            const x = Math.sin(phi) * Math.cos(theta) * 50;
            const y = Math.sin(phi) * Math.sin(theta) * 20;
            const z = Math.cos(phi) * 20;
            
            points.push({ x, y, z });
        }
        
        // Cauda (triângulo)
        for (let i = 0; i < numPoints * 0.25; i++) {
            const t = i / (numPoints * 0.25);
            
            points.push({
                x: -50 - t * 30,
                y: (Math.random() - 0.5) * (40 * (1 - t)),
                z: (Math.random() - 0.5) * (30 * (1 - t))
            });
        }
        
        // Barbatanas
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < numPoints * 0.125; i++) {
                const t = i / (numPoints * 0.125);
                
                points.push({
                    x: 10 - t * 20,
                    y: side * (15 + t * 15),
                    z: (Math.random() - 0.5) * 5
                });
            }
        }
        
        return points;
    }
    
    /**
     * Gera uma borboleta
     */
    static generateButterfly(numPoints) {
        const points = [];
        
        // Corpo (fino e alongado)
        for (let i = 0; i < numPoints * 0.15; i++) {
            const t = i / (numPoints * 0.15);
            
            points.push({
                x: 0,
                y: (t - 0.5) * 60,
                z: (Math.random() - 0.5) * 3
            });
        }
        
        // Asas (4 - superiores e inferiores)
        for (let side = -1; side <= 1; side += 2) {
            // Asa superior
            for (let i = 0; i < numPoints * 0.3; i++) {
                const t = i / (numPoints * 0.3);
                const angle = t * Math.PI;
                
                points.push({
                    x: side * Math.sin(angle) * 40,
                    y: 15 + Math.cos(angle) * 25,
                    z: (Math.random() - 0.5) * 3
                });
            }
            
            // Asa inferior
            for (let i = 0; i < numPoints * 0.2; i++) {
                const t = i / (numPoints * 0.2);
                const angle = t * Math.PI;
                
                points.push({
                    x: side * Math.sin(angle) * 30,
                    y: -15 - Math.cos(angle) * 20,
                    z: (Math.random() - 0.5) * 3
                });
            }
        }
        
        return points;
    }
    
    /**
     * Gera um avião
     */
    static generateAirplane(numPoints) {
        const points = [];
        
        // Fuselagem (cilindro)
        for (let i = 0; i < numPoints * 0.35; i++) {
            const t = i / (numPoints * 0.35);
            const angle = t * Math.PI * 2;
            
            points.push({
                x: (Math.random() - 0.5) * 80,
                y: Math.cos(angle) * 10,
                z: Math.sin(angle) * 10
            });
        }
        
        // Asas (horizontais)
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < numPoints * 0.25; i++) {
                const t = i / (numPoints * 0.25);
                
                points.push({
                    x: -10 + t * 40,
                    y: (Math.random() - 0.5) * 3,
                    z: side * (15 + t * 40)
                });
            }
        }
        
        // Cauda vertical
        for (let i = 0; i < numPoints * 0.15; i++) {
            const t = i / (numPoints * 0.15);
            
            points.push({
                x: -40,
                y: t * 30,
                z: (Math.random() - 0.5) * 5
            });
        }
        
        return points;
    }
    
    /**
     * Gera um carro
     */
    static generateCar(numPoints) {
        const points = [];
        
        // Carroceria (caixa)
        for (let i = 0; i < numPoints * 0.6; i++) {
            points.push({
                x: (Math.random() - 0.5) * 70,
                y: (Math.random() - 0.3) * 20 + 15,
                z: (Math.random() - 0.5) * 40
            });
        }
        
        // Rodas (4)
        const wheelPositions = [
            { x: 25, z: 20 },
            { x: 25, z: -20 },
            { x: -25, z: 20 },
            { x: -25, z: -20 }
        ];
        
        wheelPositions.forEach(pos => {
            for (let i = 0; i < numPoints * 0.1; i++) {
                const angle = (i / (numPoints * 0.1)) * Math.PI * 2;
                
                points.push({
                    x: pos.x + (Math.random() - 0.5) * 5,
                    y: Math.cos(angle) * 8,
                    z: pos.z + Math.sin(angle) * 8
                });
            }
        });
        
        return points;
    }
    
    /**
     * Gera um foguete
     */
    static generateRocket(numPoints) {
        const points = [];
        
        // Corpo (cilindro)
        for (let i = 0; i < numPoints * 0.5; i++) {
            const t = i / (numPoints * 0.5);
            const angle = t * Math.PI * 2;
            const height = (Math.random() - 0.5) * 100;
            
            points.push({
                x: Math.cos(angle) * 12,
                y: height,
                z: Math.sin(angle) * 12
            });
        }
        
        // Ponta (cone)
        for (let i = 0; i < numPoints * 0.2; i++) {
            const t = i / (numPoints * 0.2);
            const angle = t * Math.PI * 2;
            const height = 50 + t * 30;
            const radius = 12 * (1 - t);
            
            points.push({
                x: Math.cos(angle) * radius,
                y: height,
                z: Math.sin(angle) * radius
            });
        }
        
        // Aletas (3)
        for (let fin = 0; fin < 3; fin++) {
            const baseAngle = (fin * Math.PI * 2) / 3;
            
            for (let i = 0; i < numPoints * 0.1; i++) {
                const t = i / (numPoints * 0.1);
                
                points.push({
                    x: Math.cos(baseAngle) * (15 + t * 15),
                    y: -40 + t * 30,
                    z: Math.sin(baseAngle) * (15 + t * 15)
                });
            }
        }
        
        return points;
    }
    
    /**
     * Gera uma casa
     */
    static generateHouse(numPoints) {
        const points = [];
        
        // Paredes (cubo)
        for (let i = 0; i < numPoints * 0.5; i++) {
            points.push({
                x: (Math.random() - 0.5) * 60,
                y: (Math.random()) * 40,
                z: (Math.random() - 0.5) * 50
            });
        }
        
        // Telhado (triângulo)
        for (let i = 0; i < numPoints * 0.5; i++) {
            const t = i / (numPoints * 0.5);
            const x = (Math.random() - 0.5) * 70;
            const heightFactor = 1 - Math.abs((x / 35));
            
            points.push({
                x: x,
                y: 40 + heightFactor * 30,
                z: (Math.random() - 0.5) * 55
            });
        }
        
        return points;
    }
    
    /**
     * Gera uma árvore
     */
    static generateTree(numPoints) {
        const points = [];
        
        // Tronco
        for (let i = 0; i < numPoints * 0.25; i++) {
            const angle = (i / (numPoints * 0.25)) * Math.PI * 2;
            const height = (Math.random() - 0.5) * 50;
            
            points.push({
                x: Math.cos(angle) * 8,
                y: height - 20,
                z: Math.sin(angle) * 8
            });
        }
        
        // Copa (esfera)
        for (let i = 0; i < numPoints * 0.75; i++) {
            const phi = Math.acos(1 - 2 * (i / (numPoints * 0.75)));
            const theta = Math.PI * (3 - Math.sqrt(5)) * i;
            
            points.push({
                x: Math.sin(phi) * Math.cos(theta) * 35,
                y: Math.sin(phi) * Math.sin(theta) * 35 + 35,
                z: Math.cos(phi) * 35
            });
        }
        
        return points;
    }
}
