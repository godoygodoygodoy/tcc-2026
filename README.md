# Simulador de Robótica Coletiva - Swarm Microbots

## 📋 Descrição

Este é um simulador computacional de robótica coletiva (swarm) desenvolvido para demonstrar comportamento emergente através de sistemas multi-agentes. Inspirado visualmente nos microbots do filme Big Hero 6, o projeto simula centenas ou milhares de microbots autônomos que, através de regras simples individuais, formam estruturas complexas como textos, símbolos e formas geométricas.

**Desenvolvido como protótipo experimental para Trabalho de Conclusão de Curso (TCC)**

## 🎯 Objetivos

- Demonstrar comportamento emergente em sistemas distribuídos
- Visualizar algoritmos de robótica swarm em tempo real
- Explorar conceitos de inteligência coletiva e auto-organização
- Criar uma ferramenta didática e visualmente impactante

## ✨ Características

### Microbots Autônomos

Cada microbot possui:
- **Formato modular geométrico** (hexagonal) inspirado no filme Big Hero 6
- **Movimentação autônoma** baseada em regras locais
- **Percepção de vizinhos** dentro de um raio específico
- **Comportamento emergente** através de interações simples

### Comportamentos Implementados

1. **Separation (Separação)**: Mantém distância mínima de outros bots
2. **Alignment (Alinhamento)**: Alinha direção de movimento com vizinhos
3. **Cohesion (Coesão)**: Move-se em direção ao centro de massa dos vizinhos
4. **Seek (Busca)**: Move-se em direção a pontos-alvo específicos

### Formações Disponíveis

#### Texto
- Digite qualquer palavra ou frase (até 20 caracteres)
- Os microbots se reorganizam para formar as letras

#### Formas Geométricas
- Círculo
- Quadrado
- Triângulo
- Estrela
- Espiral

#### Símbolos e Emojis
- 😊 Sorriso
- ❤️ Coração
- ⭐ Estrela
- ➔ Seta
- ∞ Infinito
- ~ Onda
- ⚡ Raio
- ☮ Paz
- ♪ Nota Musical
- ☀ Sol
- ☾ Lua Crescente
- ✿ Flor

### Controles Interativos

- **Modo Desenho**: Desenhe formas customizadas com o mouse!
  - Ative o modo desenho
  - Clique e arraste no canvas para desenhar
  - Os microbots seguirão seu desenho
- **Quantidade de Microbots**: 100 a 2000 bots
- **Velocidade**: 0.5x a 3.0x
- **Coesão**: Ajusta a força de agrupamento
- **Dispersar**: Espalha os bots aleatoriamente
- **Pausar/Retomar**: Pausa a simulação
- **Clique no Canvas**: Atrai bots para o ponto clicado (quando não está no modo desenho)

## 🚀 Como Executar

### Método 1: Abrir Diretamente no Navegador

1. Clone ou baixe este repositório
2. Abra o arquivo `index.html` em um navegador moderno
3. O simulador iniciará automaticamente

### Método 2: Servidor Local (Recomendado)

#### Usando Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Usando Node.js:
```bash
npx http-server
```

#### Usando VS Code:
- Instale a extensão "Live Server"
- Clique com botão direito em `index.html`
- Selecione "Open with Live Server"

Depois acesse: `http://localhost:8000` (ou porta indicada)

## 📁 Estrutura do Projeto

```
tcc-2026-alpha/
│
├── index.html          # Página principal da aplicação
├── styles.css          # Estilos e design da interface
│
├── microbot.js         # Classe Microbot (agente individual)
├── swarm.js            # Classe Swarm (gerenciamento do enxame)
├── shapes.js           # Gerador de formas e textos
├── main.js             # Aplicação principal e controles
│
└── README.md           # Este arquivo
```

## 🔧 Tecnologias Utilizadas

- **HTML5 Canvas**: Renderização gráfica de alta performance
- **JavaScript ES6+**: Lógica de simulação e comportamentos
- **CSS3**: Interface moderna e responsiva
- **Algoritmos de Swarm**: Boids, Steering Behaviors

## 🧠 Conceitos Aplicados

### Robótica Swarm
Sistema de múltiplos robôs que cooperam através de interações locais descentralizadas.

### Comportamento Emergente
Padrões complexos surgem de regras simples aplicadas a múltiplos agentes.

### Sistemas Distribuídos
Não há controle central - cada microbot toma decisões baseadas apenas em informações locais.

### Agentes Autônomos
Cada microbot é uma entidade independente com capacidade de percepção, decisão e ação.

## 🎨 Características Visuais

- **Design Sci-Fi Moderno**: Interface inspirada em tecnologia futurista
- **Animações Suaves**: Movimentação fluida dos microbots
- **Efeitos de Brilho**: Bots brilham quando alcançam suas posições
- **Tema Escuro**: Melhor visualização dos efeitos luminosos
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

## 📊 Performance

- Otimização com **Spatial Grid**: Reduz complexidade de O(n²) para O(n)
- Suporta até **2000 microbots** simultaneamente
- **60 FPS** consistentes em hardware moderno
- Renderização eficiente com Canvas API

## 🎓 Uso Acadêmico

Este projeto serve como base para estudos em:
- Inteligência Artificial
- Robótica Coletiva
- Sistemas Multi-Agentes
- Computação Gráfica
- Algoritmos Distribuídos

## 🔮 Possíveis Extensões

- [ ] Adicionar obstáculos dinâmicos
- [ ] Implementar pathfinding coletivo
- [ ] Criar modo de desenho livre
- [ ] Adicionar física de colisão mais realista
- [ ] Exportar animações como GIF/vídeo
- [ ] Implementar diferentes "personalidades" de bots
- [ ] Adicionar modo 3D
- [ ] Criar desafios e objetivos

## 📝 Licença

Este projeto é um protótipo acadêmico desenvolvido para fins educacionais.

## 👨‍💻 Autor

Desenvolvido como parte de um Trabalho de Conclusão de Curso (TCC)

## 🙏 Agradecimentos

- Inspiração visual: Big Hero 6 (Disney)
- Algoritmos baseados em: Craig Reynolds (Boids)
- Conceitos de Steering Behaviors

---

**Nota**: Este é um projeto experimental e pode ser expandido e melhorado de acordo com as necessidades do TCC.
