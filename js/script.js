document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const message = document.getElementById('message');
    const permissionButton = document.getElementById('permission-button');
    const voiceButton = document.getElementById('voice-button');
    const voiceStatus = document.getElementById('voice-status');
    const shapesContainer = document.getElementById('shapes-container');
    
    // Configurações de reconhecimento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;
        
        recognition.onstart = function() {
            voiceStatus.textContent = "Ouvindo... Diga uma figura geométrica";
            voiceButton.style.backgroundColor = "#f44336";
        };
        
        recognition.onresult = function(event) {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript.toLowerCase().trim();
            
            voiceStatus.textContent = `Você disse: "${command}"`;
            
            // Mapeamento de comandos para figuras
            const shapesMap = {
                'círculo': 'circle',
                'circulo': 'circle',
                'quadrado': 'square',
                'triângulo': 'triangle',
                'triangulo': 'triangle',
                'retângulo': 'rectangle',
                'retangulo': 'rectangle'
            };
            
            if (shapesMap[command]) {
                createShape(shapesMap[command]);
            } else {
                voiceStatus.textContent = "Figura não reconhecida. Tente novamente.";
            }
        };
        
        recognition.onerror = function(event) {
            voiceStatus.textContent = "Erro no reconhecimento: " + event.error;
            voiceButton.style.backgroundColor = "#2196F3";
        };
        
        recognition.onend = function() {
            voiceButton.style.backgroundColor = "#2196F3";
        };
    } else {
        voiceButton.style.display = 'none';
        voiceStatus.textContent = "Reconhecimento de voz não suportado neste navegador";
    }
    
    // Evento do botão de voz
    voiceButton.addEventListener('click', function() {
        if (recognition) {
            recognition.start();
        }
    });
    
    // Verifica suporte à API de mídia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showMessage('Seu navegador não suporta acesso à câmera');
        return;
    }
    
    // Configurações da câmera
    const constraints = {
        video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        },
        audio: false
    };
    
    // Evento do botão de permissão
    permissionButton.addEventListener('click', function() {
        requestCameraAccess();
    });
    
    function requestCameraAccess() {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                permissionButton.style.display = 'none';
                video.srcObject = stream;
                video.style.display = 'block';
                message.style.display = 'block';
                message.textContent = 'Câmera ativada';
                
                setTimeout(() => {
                    message.style.display = 'none';
                }, 3000);
            })
            .catch(function(error) {
                console.error('Erro ao acessar a câmera:', error);
                
                let errorMessage = 'Erro ao acessar a câmera';
                if (error.name === 'NotAllowedError') {
                    errorMessage = 'Permissão para acessar a câmera foi negada';
                } else if (error.name === 'NotFoundError') {
                    errorMessage = 'Nenhuma câmera encontrada';
                } else if (error.name === 'NotReadableError') {
                    errorMessage = 'Câmera já está em uso ou não pode ser acessada';
                }
                
                showMessage(errorMessage);
                permissionButton.style.display = 'block';
            });
    }
    
    function showMessage(text) {
        message.textContent = text;
        message.style.display = 'block';
    }
    
    // Cria figuras geométricas
    function createShape(shapeType) {
        const shape = document.createElement('div');
        shape.className = `shape ${shapeType}`;
        
        // Posição aleatória na tela
        const x = Math.random() * 80 + 10; // 10-90%
        const y = Math.random() * 80 + 10; // 10-90%
        
        shape.style.left = `${x}%`;
        shape.style.top = `${y}%`;
        
        // Estilos específicos para cada forma
        switch(shapeType) {
            case 'circle':
                shape.style.width = '100px';
                shape.style.height = '100px';
                shape.style.borderRadius = '50%';
                shape.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
                break;
            case 'square':
                shape.style.width = '100px';
                shape.style.height = '100px';
                shape.style.backgroundColor = 'rgba(0, 255, 0, 0.7)';
                break;
            case 'triangle':
                shape.style.width = '0';
                shape.style.height = '0';
                shape.style.borderLeft = '50px solid transparent';
                shape.style.borderRight = '50px solid transparent';
                shape.style.borderBottom = '100px solid rgba(0, 0, 255, 0.7)';
                shape.style.backgroundColor = 'transparent';
                break;
            case 'rectangle':
                shape.style.width = '150px';
                shape.style.height = '100px';
                shape.style.backgroundColor = 'rgba(255, 255, 0, 0.7)';
                break;
        }
        
        shapesContainer.appendChild(shape);
        
        // Remove a forma após 5 segundos
        setTimeout(() => {
            shape.remove();
        }, 5000);
    }
    
    // Mostra o botão se após 1 segundo a câmera ainda não foi ativada
    setTimeout(() => {
        if (video.style.display !== 'block') {
            permissionButton.style.display = 'block';
            message.style.display = 'block';
        }
    }, 1000);
});
