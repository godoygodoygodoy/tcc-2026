/**
 * Classe Microbot3D - Representa um agente autônomo em 3D
 * Versão tridimensional inspirada nos microbots do filme Big Hero 6
 */
class Microbot3D {
    // Modelo 3D compartilhado (será carregado uma vez e clonado para todos)
    static sharedModel = null;
    static modelLoaded = false;
    
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
     * Cria o mesh 3D do microbot (usa modelo customizado se disponível)
     */
    createMesh(scene) {
        // Se temos um modelo customizado, clonar ele
        if (Microbot3D.sharedModel) {
            this.mesh = Microbot3D.sharedModel.clone();
            
            // Aplicar material com cores personalizadas
            this.mesh.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x141928,
                        emissive: 0x00d4ff,
                        emissiveIntensity: 0.2,
                        metalness: 0.8,
                        roughness: 0.2
                    });
                }
            });
            
            this.material = this.mesh.children[0] ? this.mesh.children[0].material : null;
        } else {
            // Fallback: usar octaedro se modelo não carregou
            const geometry = new THREE.OctahedronGeometry(2, 0);
            
            // Material com emissão para efeito de brilho
            this.material = new THREE.MeshStandardMaterial({
                color: 0x141928,
                emissive: 0x00d4ff,
                emissiveIntensity: 0.2,
                metalness: 0.8,
                roughness: 0.2
            });
            
            this.mesh = new THREE.Mesh(geometry, this.material);
        }
        
        this.mesh.position.copy(this.position);
        
        // Adiciona luz pontual interna (opcional, remove se lag)
        this.pointLight = new THREE.PointLight(0x00d4ff, 0, 10);
        this.mesh.add(this.pointLight);
        
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
        
        // Atualiza efeito de brilho
        this.material.emissiveIntensity = 0.2 + this.glowIntensity * 0.8;
        if (this.pointLight) {
            this.pointLight.intensity = this.glowIntensity * 0.5;
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
