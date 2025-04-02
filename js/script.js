document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const message = document.getElementById('message');
    const permissionButton = document.getElementById('permission-button');
    
    // Verifica compatibilidade
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showMessage('Seu navegador não suporta acesso à câmera');
        return;
    }
    
    // Configurações otimizadas para qualidade e proporção
    const constraints = {
        video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            aspectRatio: { ideal: 16/9 } // Força proporção comum
        },
        audio: false
    };
    
    permissionButton.addEventListener('click', function() {
        requestCameraAccess();
    });
    
    function requestCameraAccess() {
        permissionButton.style.display = 'none';
        message.style.display = 'block';
        message.textContent = 'Conectando à câmera...';
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                video.srcObject = stream;
                
                video.onloadedmetadata = function() {
                    // Ajusta o tamanho mantendo a proporção
                    adjustVideoSize();
                    video.style.display = 'block';
                    message.style.display = 'none';
                    
                    // Adiciona listener para redimensionamento
                    window.addEventListener('resize', adjustVideoSize);
                };
            })
            .catch(function(error) {
                console.error('Erro na câmera:', error);
                permissionButton.style.display = 'block';
                showMessage(getErrorMessage(error));
            });
    }
    
    function adjustVideoSize() {
        const containerRatio = window.innerWidth / window.innerHeight;
        const videoRatio = video.videoWidth / video.videoHeight;
        
        if (containerRatio > videoRatio) {
            // Container mais largo que o vídeo
            video.style.width = 'auto';
            video.style.height = '100%';
        } else {
            // Container mais alto que o vídeo
            video.style.width = '100%';
            video.style.height = 'auto';
        }
    }
    
    function getErrorMessage(error) {
        const errorMap = {
            NotAllowedError: 'Permissão negada. Ative nas configurações.',
            NotFoundError: 'Nenhuma câmera encontrada.',
            NotReadableError: 'Câmera já em uso ou bloqueada.',
            OverconstrainedError: 'Configuração não suportada.',
            SecurityError: 'Bloqueado por segurança.'
        };
        return errorMap[error.name] || 'Erro ao acessar a câmera.';
    }
    
    function showMessage(text) {
        message.textContent = text;
        message.style.display = 'block';
    }
    
    // Mostra o botão se após 1s a câmera não foi ativada
    setTimeout(() => {
        if (video.style.display !== 'block') {
            permissionButton.style.display = 'block';
        }
    }, 1000);
});
