document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const message = document.getElementById('message');
    const permissionButton = document.getElementById('permission-button');
    
    // Esconde a mensagem inicial
    message.style.display = 'none';
    
    // Configurações otimizadas para qualidade e proporção
    const constraints = {
        video: {
            facingMode: 'environment', // Prefere câmera traseira
            width: { ideal: 1920 },   // Resolução ideal
            height: { ideal: 1080 },
            aspectRatio: 16/9,        // Força proporção comum
            frameRate: { ideal: 30 }  // Frames por segundo
        }
    };
    
    permissionButton.addEventListener('click', function() {
        startCamera();
    });
    
    function startCamera() {
        permissionButton.style.display = 'none';
        message.style.display = 'block';
        message.textContent = 'Acessando câmera...';
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                video.srcObject = stream;
                
                // Quando os metadados estiverem carregados
                video.onloadedmetadata = function() {
                    // Ajusta o vídeo para manter proporção correta
                    adjustVideoSize();
                    video.style.display = 'block';
                    message.style.display = 'none';
                    
                    // Corrige orientação em alguns dispositivos
                    if (shouldRotateVideo()) {
                        video.style.transform = 'rotate(90deg)';
                    }
                };
                
                // Redimensiona quando a janela muda
                window.addEventListener('resize', adjustVideoSize);
            })
            .catch(function(error) {
                console.error('Erro na câmera:', error);
                permissionButton.style.display = 'block';
                message.textContent = 'Erro: ' + getErrorMessage(error);
            });
    }
    
    function adjustVideoSize() {
        // Mantém a proporção correta do vídeo
        const containerRatio = window.innerWidth / window.innerHeight;
        const videoRatio = video.videoWidth / video.videoHeight;
        
        if (containerRatio > videoRatio) {
            video.style.width = '100%';
            video.style.height = 'auto';
        } else {
            video.style.width = 'auto';
            video.style.height = '100%';
        }
    }
    
    function shouldRotateVideo() {
        // Detecta se precisa rotacionar (para mobile em portrait)
        return window.innerHeight > window.innerWidth && 
               video.videoHeight > video.videoWidth;
    }
    
    function getErrorMessage(error) {
        const errorMap = {
            NotAllowedError: 'Permissão negada. Por favor, permita o acesso à câmera.',
            NotFoundError: 'Nenhuma câmera encontrada.',
            NotReadableError: 'Câmera já em uso ou não acessível.',
            OverconstrainedError: 'Configuração não suportada.',
            SecurityError: 'Bloqueado por configurações de segurança.'
        };
        return errorMap[error.name] || 'Não foi possível acessar a câmera.';
    }
    
    // Tenta iniciar automaticamente em alguns navegadores
    setTimeout(() => {
        if (video.style.display !== 'block') {
            permissionButton.style.display = 'block';
        }
    }, 500);
});
