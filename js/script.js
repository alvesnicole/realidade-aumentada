document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const message = document.getElementById('message');
    const permissionButton = document.getElementById('permission-button');
    const voiceButton = document.getElementById('voice-button');
    const micPermissionButton = document.getElementById('mic-permission-button');
    const voiceStatus = document.getElementById('voice-status');
    const shapesContainer = document.getElementById('shapes-container');
    
    // Verifica suporte às APIs
    const isMediaSupported = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    const isSpeechRecognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    
    if (!isMediaSupported) {
        showMessage('Seu navegador não suporta acesso à câmera');
        permissionButton.style.display = 'none';
    }
    
    if (!isSpeechRecognitionSupported) {
        voiceStatus.textContent = "Seu navegador não suporta reconhecimento de voz";
        voiceButton.style.display = 'none';
    }
    
    // Configurações de reconhecimento de voz
    let recognition;
    let isMicReady = false;
    
    if (isSpeechRecognitionSupported) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognition.onstart = function() {
            voiceButton.classList.add('listening');
            voiceStatus.textContent = "Ouvindo... Diga: Círculo, Quadrado, Triângulo ou Retângulo";
        };
        
        recognition.onresult = function(event) {
            const command = event.results[0][0].transcript.toLowerCase().trim();
            voiceStatus.textContent = `Você disse: "${command}"`;
            
            const shapesMap = {
                'círculo': 'circle', 'circulo': 'circle',
                'quadrado': 'square',
                'triângulo': 'triangle', 'triangulo': 'triangle',
                'retângulo': 'rectangle', 'retangulo': 'rectangle'
            };
            
            if (shapesMap[command]) {
                createShape(shapesMap[command]);
            } else {
                voiceStatus.textContent = "Figura não reconhecida. Tente novamente.";
            }
        };
        
        recognition.onerror = function(event) {
            voiceButton.classList.remove('listening');
            if (event.error === 'not-allowed') {
                voiceStatus.textContent = "Permissão para microfone negada";
                micPermissionButton.style.display = 'block';
                isMicReady = false;
                voiceButton.disabled = true;
            } else {
                voiceStatus.textContent = "Erro: " + event.error;
            }
        };
        
        recognition.onend = function() {
            voiceButton.classList.remove('listening');
        };
    }
    
    // Evento do botão de voz
    voiceButton.addEventListener('click', function() {
        if (isMicReady && recognition) {
            recognition.start();
        }
    });
    
    // Evento do botão de permissão do microfone
    micPermissionButton.addEventListener('click', function() {
        requestMicrophoneAccess();
    });
    
    // Configurações da câmera
    const constraints = {
        video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        },
        audio: false
    };
    
    // Evento do botão de permissão da câmera
    permissionButton.addEventListener('click', function() {
        requestCameraAccess();
    });
    
    // Tenta acessar a câmera automaticamente
    requestCameraAccess();
    
    // Função para solicitar acesso ao microfone
    function requestMicrophoneAccess() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                // Para imediatamente os tracks de áudio (não vamos usá-los, só precisamos da permissão)
                stream.getTracks().forEach(track => track.stop());
                
                micPermissionButton.style.display = 'none';
                isMicReady = true;
                voiceButton.disabled = false;
                voiceStatus.textContent = "Microfone ativado. Toque no ícone e diga uma figura geométrica";
            })
            .catch(function(error) {
                console.error('Erro ao acessar microfone:', error);
                micPermissionButton.style.display = 'block';
                voiceStatus.textContent = "Erro ao acessar microfone. Toque em 'Ativar Microfone' para tentar novamente.";
            });
    }
    
    // Função para solicitar acesso à câmera
    function requestCameraAccess() {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                permissionButton.style.display = 'none';
                video.srcObject = stream;
                video.style.display = 'block';
                message.style.display = 'block';
                message.textContent = 'Câmera ativada';
                
                // Tenta ativar o microfone também
                requestMicrophoneAccess();
                
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
                
                // Mesmo sem câmera, tenta ativar o microfone
                requestMicrophoneAccess();
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
        
        const x = Math.random() * 80 + 10;
        const y = Math.random() * 80 + 10;
        
        shape.style.left = `${x}%`;
        shape.style.top = `${y}%`;
        
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
                break;
            case 'rectangle':
                shape.style.width = '150px';
                shape.style.height = '100px';
                shape.style.backgroundColor = 'rgba(255, 255, 0, 0.7)';
                break;
        }
        
        shapesContainer.appendChild(shape);
        
        setTimeout(() => {
            shape.remove();
        }, 5000);
    }
    
    // Mostra os botões se após 1 segundo os recursos não foram ativados
    setTimeout(() => {
        if (video.style.display !== 'block' && isMediaSupported) {
            permissionButton.style.display = 'block';
            message.style.display = 'block';
        }
        
        if (!isMicReady && isSpeechRecognitionSupported) {
            micPermissionButton.style.display = 'block';
        }
    }, 1000);
});
