document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const message = document.getElementById('message');
    const permissionButton = document.getElementById('permission-button');
    
    // Verifica se o navegador suporta a API de mídia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showMessage('Seu navegador não suporta acesso à câmera');
        return;
    }
    
    // Configurações da câmera
    const constraints = {
        video: {
            facingMode: 'environment', // Prefere a câmera traseira
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        },
        audio: false
    };
    
    // Evento do botão de permissão
    permissionButton.addEventListener('click', function() {
        requestCameraAccess();
    });
    
    // Tenta acessar a câmera automaticamente (alguns navegadores bloqueiam isso)
    // requestCameraAccess();
    
    function requestCameraAccess() {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                // Sucesso - mostra o vídeo
                permissionButton.style.display = 'none';
                video.srcObject = stream;
                video.style.display = 'block';
                message.style.display = 'block';
                message.textContent = 'Câmera ativada';
                
                // Depois de 3 segundos, esconde a mensagem
                setTimeout(() => {
                    message.style.display = 'none';
                }, 3000);
            })
            .catch(function(error) {
                // Tratamento de erros
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
    
    // Trata mudanças de orientação
    window.addEventListener('orientationchange', function() {
        // Força redimensionamento do vídeo
        video.style.width = '100%';
        video.style.height = '100%';
    });
    
    // Mostra o botão se após 1 segundo a câmera ainda não foi ativada
    setTimeout(() => {
        if (video.style.display !== 'block') {
            permissionButton.style.display = 'block';
            message.style.display = 'block';
        }
    }, 1000);
});