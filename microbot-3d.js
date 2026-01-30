/**
 * Classe Microbot3D - Representa um agente autônomo em 3D
 * Versão tridimensional inspirada nos microbots do filme Big Hero 6
 */
class Microbot3D {
    // Modelo 3D compartilhado (geometria procedural)
    static sharedGeometry = null;
    static modelLoaded = false;
    
    /**
     * Cria geometria procedural inspirada no Big Hero 6
     * Formato hexagonal achatado com detalhes magnéticos
     */
    static createBigHeroGeometry() {
        if (Microbot3D.sharedGeometry) {
            return Microbot3D.sharedGeometry;
        }
        
        const group = new THREE.Group();
        
        // Corpo principal - hexágono achatado
        const hexRadius = 2;
        const hexHeight = 0.4;
        const hexGeometry = new THREE.CylinderGeometry(hexRadius, hexRadius, hexHeight, 6);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.9,
            roughness: 0.2
        });
        const hexBody = new THREE.Mesh(hexGeometry, bodyMaterial);
        group.add(hexBody);
        
        // Anel central luminoso
        const ringGeometry = new THREE.TorusGeometry(1.2, 0.15, 8, 16);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0x00d4ff,
            emissive: 0x00d4ff,
            emissiveIntensity: 0.8,
            metalness: 0.5,
            roughness: 0.3
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        
        // Núcleo central (esfera pequena)
        const coreGeometry = new THREE.SphereGeometry(0.5, 12, 12);
        const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 1.0,
            metalness: 0.3,
            roughness: 0.2
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        group.add(core);
        
        // Conectores magnéticos nas 6 pontas
        const connectorGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const connectorMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a5568,
            metalness: 1.0,
            roughness: 0.1
        });
        
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
            connector.position.x = Math.cos(angle) * hexRadius;
            connector.position.z = Math.sin(angle) * hexRadius;
            group.add(connector);
        }
        
        Microbot3D.sharedGeometry = group;
        Microbot3D.modelLoaded = true;
        return group;
    }
    
    constructor(x, y, z, scene) {
        this.position = new THREE.Vector3(x, y, z);
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        );
        this.acceleration = new THREE.Vector3(0, 0, 0);
        
        // Propriedades de comportamento
        this.target = new THREE.Vector3(x, y, z);
        this.hasTarget = false;
        
        // Limites
        this.maxSpeed = 3;
        this.maxForce = 0.1;
        
        // Estado
        this.neighbors = [];
        this.inFormation = false;
        this.glowIntensity = 0;
        
        // Cria a geometria e mesh do microbot
        this.createMesh(scene);
    }
    
    /**
     * Cria o mesh 3D do microbot (usa geometria procedural Big Hero 6)
     */
    createMesh(scene) {
        // Criar geometria procedural se ainda não existe
        if (!Microbot3D.sharedGeometry) {
            Microbot3D.createBigHeroGeometry();
        }
        
        // Clonar o modelo compartilhado
        this.mesh = Microbot3D.sharedGeometry.clone();
        
        // Aplicar materiais com variação de cor
        this.mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                // Clonar material para permitir animações individuais
                child.material = child.material.clone();
                
                // Guardar referência ao material emissivo (anel central)
                if (child.material.emissiveIntensity > 0.5) {
                    this.material = child.material;
                }
            }
        });
        
        // Se não encontrou material emissivo, usar o primeiro
        if (!this.material && this.mesh.children[0]) {
            this.material = this.mesh.children[0].material;
        }
        
        this.mesh.position.copy(this.position);
        
        // NÃO adicionar luz individual (causa shader error com muitos bots)
        // this.pointLight = new THREE.PointLight(0x00d4ff, 0, 10);
        // this.mesh.add(this.pointLight);
        
        scene.add(this.mesh);
    }
    
    /**
     * Aplica uma força ao microbot
     */
    applyForce(force) {
        this.acceleration.add(force);
    }
    
    /**
     * Move em direção a um alvo (seek behavior em 3D)
     */
    seek(target, multiplier = 1.0) {
        const desired = new THREE.Vector3().subVectors(target, this.position);
        const distance = desired.length();
        
        if (distance > 0) {
            desired.normalize();
            desired.multiplyScalar(this.maxSpeed);
            
            const steer = new THREE.Vector3().subVectors(desired, this.velocity);
            steer.multiplyScalar(multiplier);
            
            if (steer.length() > this.maxForce) {
                steer.normalize();
                steer.multiplyScalar(this.maxForce);
            }
            
            this.applyForce(steer);
            
            // Atualiza glow baseado na distância
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
        
        const avgVelocity = new THREE.Vector3();
        
        for (const neighbor of neighbors) {
            avgVelocity.add(neighbor.velocity);
        }
        
        avgVelocity.divideScalar(neighbors.length);
        
        const steer = new THREE.Vector3().subVectors(avgVelocity, this.velocity);
        steer.multiplyScalar(multiplier * 0.1);
        
        this.applyForce(steer);
    }
    
    /**
     * Mantém coesão com o grupo (cohesion)
     */
    cohesion(neighbors, multiplier = 1.0) {
        if (neighbors.length === 0) return;
        
        const center = new THREE.Vector3();
        
        for (const neighbor of neighbors) {
            center.add(neighbor.position);
        }
        
        center.divideScalar(neighbors.length);
        
        this.seek(center, multiplier * 0.05);
    }
    
    /**
     * Mantém separação dos vizinhos (separation)
     */
    separation(neighbors, multiplier = 1.0) {
        const desiredSeparation = 15;
        const steer = new THREE.Vector3();
        let count = 0;
        
        for (const neighbor of neighbors) {
            const diff = new THREE.Vector3().subVectors(this.position, neighbor.position);
            const distance = diff.length();
            
            if (distance > 0 && distance < desiredSeparation) {
                diff.normalize();
                diff.divideScalar(distance);
                steer.add(diff);
                count++;
            }
        }
        
        if (count > 0) {
            steer.divideScalar(count);
            steer.multiplyScalar(multiplier);
            this.applyForce(steer);
        }
    }
    
    /**
     * Atualiza a posição e velocidade do microbot
     */
    update(speedMultiplier = 1.0, bounds) {
        // Atualiza velocidade com aceleração
        this.velocity.add(this.acceleration);
        
        // Limita velocidade máxima
        const speed = this.velocity.length();
        const maxSpeedAdjusted = this.maxSpeed * speedMultiplier;
        
        if (speed > maxSpeedAdjusted) {
            this.velocity.normalize();
            this.velocity.multiplyScalar(maxSpeedAdjusted);
        }
        
        // Atualiza posição
        this.position.add(this.velocity);
        
        // Reset aceleração
        this.acceleration.set(0, 0, 0);
        
        // Mantém dentro dos limites
        this.edges(bounds);
        
        // Atualiza mesh
        this.mesh.position.copy(this.position);
        
        // Rotaciona baseado na direção
        if (this.velocity.length() > 0.1) {
            const direction = this.velocity.clone().normalize();
            this.mesh.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction
            );
        }
        
        // Atualiza efeito de brilho (apenas no material)
        if (this.material) {
            this.material.emissiveIntensity = 0.2 + this.glowIntensity * 0.8;
        }
    }
    
    /**
     * Mantém o microbot dentro dos limites
     */
    edges(bounds) {
        const margin = 10;
        
        if (this.position.x < -bounds.x + margin) {
            this.position.x = -bounds.x + margin;
            this.velocity.x *= -0.5;
        } else if (this.position.x > bounds.x - margin) {
            this.position.x = bounds.x - margin;
            this.velocity.x *= -0.5;
        }
        
        if (this.position.y < -bounds.y + margin) {
            this.position.y = -bounds.y + margin;
            this.velocity.y *= -0.5;
        } else if (this.position.y > bounds.y - margin) {
            this.position.y = bounds.y - margin;
            this.velocity.y *= -0.5;
        }
        
        if (this.position.z < -bounds.z + margin) {
            this.position.z = -bounds.z + margin;
            this.velocity.z *= -0.5;
        } else if (this.position.z > bounds.z - margin) {
            this.position.z = bounds.z - margin;
            this.velocity.z *= -0.5;
        }
    }
    
    /**
     * Define um novo alvo para o microbot
     */
    setTarget(x, y, z) {
        this.target.set(x, y, z);
        this.hasTarget = true;
    }
    
    /**
     * Remove o alvo atual
     */
    clearTarget() {
        this.hasTarget = false;
        this.inFormation = false;
    }
    
    /**
     * Remove o mesh da cena
     */
    destroy(scene) {
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.material.dispose();
    }
}
