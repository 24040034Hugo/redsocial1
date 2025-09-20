// Variables globales
let posts = [];
let currentImagePreview = null;
let currentPostId = null;
let conversations = [];
let currentConversation = null;

// Sample data
const sampleConversations = [
    {
        id: 1,
        name: 'Caro gtz',
        avatar: 'image/imagen3.jpg',
        lastMessage: 'Hola! ¿Cómo estás?',
        time: '2 min',
        messages: [
            { text: 'Hola Hugo!', sent: false, time: '10:30' },
            { text: '¡Hola! ¿Cómo estás?', sent: true, time: '10:31' },
            { text: 'Muy bien, trabajando en algunos proyectos', sent: false, time: '10:32' },
            { text: '¡Genial! Me encantaría saber más', sent: true, time: '10:33' }
        ]
    },
    {
        id: 2,
        name: 'Carlos De Los Santos',
        avatar: 'image/imagen6.jpg',
        lastMessage: 'Excelente trabajo en el último proyecto',
        time: '1h',
        messages: [
            { text: 'Hey Hugo, vi tu último post', sent: false, time: '09:15' },
            { text: 'Excelente trabajo en el último proyecto', sent: false, time: '09:16' },
            { text: '¡Gracias Carlos! Me alegra que te haya gustado', sent: true, time: '09:20' }
        ]
    },
    {
        id: 3,
        name: 'Nohemi Tovar',
        avatar: 'image/imagen7.jpg',
        lastMessage: '¿Podemos hablar sobre la colaboración?',
        time: '3h',
        messages: [
            { text: 'Hola Hugo!', sent: false, time: '07:45' },
            { text: '¿Podemos hablar sobre la colaboración?', sent: false, time: '07:46' },
            { text: 'Por supuesto, cuando gustes', sent: true, time: '08:00' }
        ]
    }
];

const exploreItems = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=300&fit=crop',
        title: 'Desarrollo Web',
        description: 'Las mejores prácticas en desarrollo'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=300&fit=crop',
        title: 'Programación',
        description: 'Últimas tendencias en coding'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop',
        title: 'Tecnología',
        description: 'Innovaciones tecnológicas'
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=300&h=300&fit=crop',
        title: 'Diseño UX/UI',
        description: 'Interfaces modernas y funcionales'
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=300&fit=crop',
        title: 'Inteligencia Artificial',
        description: 'El futuro de la AI'
    },
    {
        id: 6,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
        title: 'Ciberseguridad',
        description: 'Protección digital avanzada'
    }
];

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    showNotification('¡Bienvenido a HugoConnect!', 'success');
});

function initializeApp() {
    conversations = [...sampleConversations];
    loadExploreContent();
    loadMessagesContent();
    loadProfileContent();
}

function setupEventListeners() {
    // Navigation listeners
    document.querySelectorAll('.nav-link, .mobile-nav-link, .bottom-nav-item').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) {
                navigateToSection(section);
            }
        });
    });

    // Profile image upload
    document.getElementById('profileImageUpload').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profileImage').src = e.target.result;
                // Actualizar todas las instancias de la foto de perfil
                const allProfileImages = document.querySelectorAll('.nav-actions img, .modal-avatar, .create-post img');
                allProfileImages.forEach(img => {
                    img.src = e.target.result;
                });
                showNotification('Foto de perfil actualizada', 'success');
            };
            reader.readAsDataURL(file);
        }
    });

    // Modal image upload
    document.getElementById('modalImageUpload').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentImagePreview = e.target.result;
                document.getElementById('imagePreview').innerHTML = `
                    <div class="image-preview-container">
                        <img src="${e.target.result}" alt="Preview">
                        <button type="button" onclick="removeImagePreview()" class="remove-image">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    });

    // Like functionality
    document.addEventListener('click', function(event) {
        if (event.target.closest('.action-btn.like')) {
            const btn = event.target.closest('.action-btn.like');
            const icon = btn.querySelector('i');
            const count = btn.querySelector('span');
            
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                btn.classList.add('liked');
                count.textContent = parseInt(count.textContent) + 1;
                addActivity('Te gustó una publicación', 'like');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                btn.classList.remove('liked');
                count.textContent = parseInt(count.textContent) - 1;
            }
        }
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const postModal = document.getElementById('postModal');
        const commentsModal = document.getElementById('commentsModal');
        
        if (event.target === postModal) {
            closePostModal();
        }
        if (event.target === commentsModal) {
            closeCommentsModal();
        }
    });
}

// Navigation functions
function navigateToSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation active states
    document.querySelectorAll('.nav-link, .mobile-nav-link, .bottom-nav-item').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelectorAll(`[data-section="${sectionName}"]`).forEach(link => {
        link.classList.add('active');
    });
    
    // Close mobile menu if open
    closeMobileMenu();
    
    showNotification(`Navegando a ${getSectionTitle(sectionName)}`, 'info');
}

function getSectionTitle(sectionName) {
    const titles = {
        'home': 'Inicio',
        'explore': 'Explorar',
        'messages': 'Mensajes',
        'profile': 'Perfil'
    };
    return titles[sectionName] || sectionName;
}

// Mobile menu functions
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.remove('active');
}

// Post modal functions
function openPostModal() {
    document.getElementById('postModal').style.display = 'block';
    document.getElementById('postTextarea').focus();
}

function closePostModal() {
    document.getElementById('postModal').style.display = 'none';
    document.getElementById('postTextarea').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    currentImagePreview = null;
}

function publishPost() {
    const textarea = document.getElementById('postTextarea');
    const text = textarea.value.trim();
    
    if (text === '' && !currentImagePreview) {
        showNotification('Por favor escribe algo o agrega una imagen', 'error');
        return;
    }

    const post = {
        id: Date.now(),
        author: 'Hugo Lc',
        avatar: 'image/imagen1.jpg',
        content: text,
        image: currentImagePreview,
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        shares: 0,
        isAdmin: true
    };

    addPostToFeed(post);
    closePostModal();
    updateStats();
    showNotification('¡Publicación creada exitosamente!', 'success');
}

function addPostToFeed(post) {
    const postsContainer = document.getElementById('postsContainer');
    const postElement = document.createElement('article');
    postElement.className = 'post';
    postElement.setAttribute('data-id', post.id);

    const timeAgo = getTimeAgo(post.timestamp);
    
    postElement.innerHTML = `
        <div class="post-header">
            <div class="post-user">
                <img src="${post.avatar}" alt="User" class="post-avatar">
                <div class="user-info">
                    <h4>${post.author} ${post.isAdmin ? '<i class="fas fa-crown admin-icon" title="Administrador"></i>' : ''}</h4>
                    <span class="post-time">${timeAgo}</span>
                </div>
            </div>
            <button class="post-menu" onclick="showPostOptions(this)">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
            ${post.image ? `<div class="post-image"><img src="${post.image}" alt="Post image"></div>` : ''}
        </div>
        <div class="post-actions">
            <button class="action-btn like">
                <i class="far fa-heart"></i>
                <span>${post.likes}</span>
            </button>
            <button class="action-btn comment" onclick="showComments(this)">
                <i class="far fa-comment"></i>
                <span>${post.comments}</span>
            </button>
            <button class="action-btn share" onclick="sharePost(this)">
                <i class="far fa-share-square"></i>
                <span>${post.shares}</span>
            </button>
        </div>
    `;

    // Agregar animación de entrada
    postElement.style.opacity = '0';
    postElement.style.transform = 'translateY(20px)';
    
    postsContainer.insertBefore(postElement, postsContainer.firstChild);
    
    // Animar entrada
    setTimeout(() => {
        postElement.style.transition = 'all 0.5s ease';
        postElement.style.opacity = '1';
        postElement.style.transform = 'translateY(0)';
    }, 100);

    posts.unshift(post);
}

// Comments functionality
function showComments(button) {
    const post = button.closest('.post');
    currentPostId = post.getAttribute('data-id') || 'sample';
    
    document.getElementById('commentsModal').style.display = 'block';
    loadComments(currentPostId);
}

function closeCommentsModal() {
    document.getElementById('commentsModal').style.display = 'none';
    currentPostId = null;
}

function loadComments(postId) {
    const commentsList = document.getElementById('commentsList');
    
    // Sample comments
    const sampleComments = [
        {
            id: 1,
            author: 'Caro gtz',
            avatar: "image/imagen3.jpg",
            text: '¡Excelente trabajo Hugo! Me encanta tu enfoque en el desarrollo web.',
            time: '2h',
            likes: 5
        },
        {
            id: 2,
            author: 'Carlos De Los Santos',
            avatar: "image/imagen6.jpg",
            text: 'Totalmente de acuerdo. La programación realmente conecta personas de todo el mundo.',
            time: '1h',
            likes: 3
        },
        {
            id: 3,
            author: 'Nohemi Tovar',
            avatar: "image/imagen7.jpg",
            text: '¿Podrías compartir más detalles sobre los proyectos en los que estás trabajando?',
            time: '30min',
            likes: 2
        }
    ];

    commentsList.innerHTML = sampleComments.map(comment => `
        <div class="comment-item">
            <img src="${comment.avatar}" alt="${comment.author}" class="comment-avatar">
            <div class="comment-content">
                <h5>${comment.author} <span class="comment-time">${comment.time}</span></h5>
                <p class="comment-text">${comment.text}</p>
                <div class="comment-actions">
                    <button class="comment-action" onclick="likeComment(${comment.id})">
                        <i class="far fa-heart"></i> ${comment.likes}
                    </button>
                    <button class="comment-action" onclick="replyToComment(${comment.id})">
                        <i class="far fa-reply"></i> Responder
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function addComment() {
    const textarea = document.getElementById('commentTextarea');
    const text = textarea.value.trim();
    
    if (text === '') {
        showNotification('Por favor escribe un comentario', 'error');
        return;
    }
    
    const commentsList = document.getElementById('commentsList');
    const newComment = document.createElement('div');
    newComment.className = 'comment-item';
    newComment.innerHTML = `
        <img src="image/imagen1.jpg" alt="Hugo Lc" class="comment-avatar">
        <div class="comment-content">
            <h5>Hugo Lc <i class="fas fa-crown admin-icon" title="Administrador"></i> <span class="comment-time">Ahora</span></h5>
            <p class="comment-text">${text}</p>
            <div class="comment-actions">
                <button class="comment-action" onclick="likeComment(0)">
                    <i class="far fa-heart"></i> 0
                </button>
                <button class="comment-action" onclick="replyToComment(0)">
                    <i class="far fa-reply"></i> Responder
                </button>
            </div>
        </div>
    `;
    
    commentsList.insertBefore(newComment, commentsList.firstChild);
    textarea.value = '';
    
    // Update comment count in post
    const post = document.querySelector(`[data-id="${currentPostId}"]`);
    if (post) {
        const commentBtn = post.querySelector('.action-btn.comment span');
        if (commentBtn) {
            commentBtn.textContent = parseInt(commentBtn.textContent) + 1;
        }
    }
    
    showNotification('Comentario agregado', 'success');
    addActivity('Comentaste en una publicación', 'comment');
}

function likeComment(commentId) {
    showNotification('Te gustó el comentario', 'info');
}

function replyToComment(commentId) {
    const textarea = document.getElementById('commentTextarea');
    textarea.focus();
    showNotification('Responde al comentario', 'info');
}

// Messages functionality
function loadMessagesContent() {
    const conversationsList = document.getElementById('conversationsList');
    
    conversationsList.innerHTML = conversations.map(conv => `
        <div class="conversation-item" onclick="openConversation(${conv.id})" data-id="${conv.id}">
            <img src="${conv.avatar}" alt="${conv.name}" class="conversation-avatar">
            <div class="conversation-info">
                <h5>${conv.name}</h5>
                <p class="last-message">${conv.lastMessage}</p>
            </div>
            <span class="conversation-time">${conv.time}</span>
        </div>
    `).join('');
}

function openConversation(conversationId) {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    currentConversation = conversation;
    
    // Update active conversation
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-id="${conversationId}"]`).classList.add('active');
    
    // Load chat window
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.innerHTML = `
        <div class="chat-header">
            <img src="${conversation.avatar}" alt="${conversation.name}" class="conversation-avatar">
            <div>
                <h4>${conversation.name}</h4>
                <p style="color: #666; font-size: 0.9rem;">En línea</p>
            </div>
        </div>
        <div class="chat-messages" id="chatMessages">
            ${conversation.messages.map(msg => `
                <div class="message ${msg.sent ? 'sent' : 'received'}">
                    ${msg.text}
                    <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 0.25rem;">${msg.time}</div>
                </div>
            `).join('')}
        </div>
        <div class="chat-input">
            <input type="text" id="messageInput" placeholder="Escribe un mensaje..." onkeypress="handleMessageKeypress(event)">
            <button class="send-btn" onclick="sendMessage()">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    `;
    
    // Scroll to bottom of messages
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (text === '' || !currentConversation) return;
    
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message sent';
    messageElement.innerHTML = `
        ${text}
        <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 0.25rem;">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    input.value = '';
    
    // Update conversation last message
    currentConversation.lastMessage = text;
    currentConversation.time = 'Ahora';
    
    // Simulate response
    setTimeout(() => {
        const responseElement = document.createElement('div');
        responseElement.className = 'message received';
        responseElement.innerHTML = `
            ¡Gracias por tu mensaje! Te respondo pronto.
            <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 0.25rem;">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        
        chatMessages.appendChild(responseElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        addActivity(`${currentConversation.name} te envió un mensaje`, 'comment');
    }, 2000);
    
    addActivity('Enviaste un mensaje', 'info');
}

function handleMessageKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Explore functionality
function loadExploreContent() {
    const exploreGrid = document.getElementById('exploreGrid');
    
    exploreGrid.innerHTML = exploreItems.map(item => `
        <div class="explore-item" onclick="viewExploreItem(${item.id})">
            <img src="${item.image}" alt="${item.title}">
            <div class="explore-overlay">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        </div>
    `).join('');
}

function viewExploreItem(itemId) {
    const item = exploreItems.find(i => i.id === itemId);
    if (item) {
        showNotification(`Explorando: ${item.title}`, 'info');
    }
}

// Profile functionality
function loadProfileContent() {
    const profileContent = document.getElementById('profileContent');
    showProfileTab('posts');
}

function showProfileTab(tabName) {
    // Update tab active states
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`button[onclick="showProfileTab('${tabName}')"]`).classList.add('active');
    
    const profileContent = document.getElementById('profileContent');
    
    switch(tabName) {
        case 'posts':
            profileContent.innerHTML = `
                <div class="profile-posts">
                    <h3>Mis Publicaciones</h3>
                    <div class="posts-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                        <div class="post">
                            <div class="post-content">
                                <p>¡Trabajando en nuevos proyectos de desarrollo web! 💻✨</p>
                                <div class="post-image">
                                    <img src="image/imagen2 .jpg" alt="Post">
                                </div>
                            </div>
                            <div class="post-stats" style="display: flex; justify-content: space-between; margin-top: 1rem; color: #666;">
                                <span><i class="fas fa-heart"></i> 124</span>
                                <span><i class="fas fa-comment"></i> 23</span>
                                <span><i class="fas fa-share"></i> 12</span>
                            </div>
                        </div>
                        <div class="post">
                            <div class="post-content">
                                <p>Conectando con desarrolladores de todo el mundo 🌎</p>
                            </div>
                            <div class="post-stats" style="display: flex; justify-content: space-between; margin-top: 1rem; color: #666;">
                                <span><i class="fas fa-heart"></i> 89</span>
                                <span><i class="fas fa-comment"></i> 15</span>
                                <span><i class="fas fa-share"></i> 8</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'about':
            profileContent.innerHTML = `
                <div class="profile-about">
                    <h3>Acerca de mí</h3>
                    <div style="line-height: 1.6; color: #666;">
                        <p><strong>Profesión:</strong> estudiante de desarrollo web</p>
                        <p><strong>Especialidades:</strong> python, css, javascript</p>
                        <p><strong>Experiencia:</strong> < 1 año en desarrollo web</p>
                        <p><strong>Ubicación:</strong> Ciudad General Ramos Arizpe, Coahuila, MX</p>
                        <p><strong>Intereses:</strong> Tecnología, Programación,</p>
                        <br>
                        <p>aficionado al ejercicio y la vida saludable.</p>
                    </div>
                </div>
            `;
            break;
        case 'media':
            profileContent.innerHTML = `
                <div class="profile-media">
                    <h3>Multimedia</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                        <div style="aspect-ratio: 1; border-radius: 10px; overflow: hidden;">
                            <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=150&h=150&fit=crop" alt="Media" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="aspect-ratio: 1; border-radius: 10px; overflow: hidden;">
                            <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&h=150&fit=crop" alt="Media" alt="Media" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="aspect-ratio: 1; border-radius: 10px; overflow: hidden;">
                            <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&h=150&fit=crop" alt="Media" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="aspect-ratio: 1; border-radius: 10px; overflow: hidden;">
                            <img src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=150&h=150&fit=crop" alt="Media" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                    </div>
                </div>
            `;
            break;
    }
}

// Utility functions
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} h`;
    return `Hace ${Math.floor(diffMins / 1440)} d`;
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
}

function updateStats() {
    const postsCount = document.getElementById('postsCount');
    const currentCount = parseInt(postsCount.textContent);
    postsCount.textContent = currentCount + 1;
}

function addEmoji(emoji) {
    const textarea = document.getElementById('postTextarea');
    textarea.value += emoji;
    textarea.focus();
}

function removeImagePreview() {
    document.getElementById('imagePreview').innerHTML = '';
    currentImagePreview = null;
    document.getElementById('modalImageUpload').value = '';
}

function followUser(button) {
    button.textContent = 'Siguiendo';
    button.style.background = '#42b883';
    button.disabled = true;
    
    // Actualizar contador de seguidores
    const followersCount = document.getElementById('followersCount');
    const currentCount = parseFloat(followersCount.textContent);
    followersCount.textContent = (currentCount + 0.1).toFixed(1) + 'K';
    
    showNotification('Ahora sigues a este usuario', 'success');
}

function sharePost(button) {
    const count = button.querySelector('span');
    count.textContent = parseInt(count.textContent) + 1;
    showNotification('Post compartido', 'success');
    addActivity('Compartiste una publicación', 'share');
}

function showPostOptions(button) {
    // Crear menú contextual
    const existingMenu = document.querySelector('.post-options-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    const menu = document.createElement('div');
    menu.className = 'post-options-menu';
    menu.innerHTML = `
        <button onclick="editPost(this)"><i class="fas fa-edit"></i> Editar</button>
        <button onclick="deletePost(this)"><i class="fas fa-trash"></i> Eliminar</button>
        <button onclick="pinPost(this)"><i class="fas fa-thumbtack"></i> Fijar</button>
    `;

    button.appendChild(menu);
    
    // Cerrar menú al hacer clic fuera
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!button.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

function editPost(button) {
    showNotification('Función de edición en desarrollo', 'info');
    button.closest('.post-options-menu').remove();
}

function deletePost(button) {
    const post = button.closest('.post');
    if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
        post.style.transition = 'all 0.3s ease';
        post.style.opacity = '0';
        post.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            post.remove();
            showNotification('Publicación eliminada', 'success');
        }, 300);
    }
    button.closest('.post-options-menu').remove();
}

function pinPost(button) {
    showNotification('Publicación fijada', 'success');
    button.closest('.post-options-menu').remove();
}

function addActivity(text, type) {
    const activityFeed = document.getElementById('activityFeed');
    if (!activityFeed) return;
    
    const activity = document.createElement('div');
    activity.className = 'activity-item';
    
    let icon = '';
    switch(type) {
        case 'like': icon = 'fas fa-heart activity-icon like'; break;
        case 'share': icon = 'fas fa-share activity-icon share'; break;
        case 'comment': icon = 'fas fa-comment activity-icon comment'; break;
        case 'follow': icon = 'fas fa-user-plus activity-icon follow'; break;
        default: icon = 'fas fa-info activity-icon info';
    }
    
    activity.innerHTML = `
        <i class="${icon}"></i>
        <p>${text}</p>
        <span class="activity-time">Ahora</span>
    `;
    
    activityFeed.insertBefore(activity, activityFeed.firstChild);
    
    // Limitar a 10 actividades
    if (activityFeed.children.length > 10) {
        activityFeed.removeChild(activityFeed.lastChild);
    }
}

// Admin functions
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    showNotification(isDark ? 'Modo oscuro activado' : 'Modo claro activado', 'info');
    
    // Save preference
    localStorage.setItem('darkMode', isDark);
}

function viewAnalytics() {
    showNotification('Panel de analíticas en desarrollo', 'info');
}

function manageUsers() {
    showNotification('Panel de gestión de usuarios en desarrollo', 'info');
}

function setPostVisibility() {
    showNotification('Configuración de privacidad en desarrollo', 'info');
}

// Load saved preferences
function loadPreferences() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
}

// Additional utility functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copiado al portapapeles', 'success');
    }).catch(() => {
        showNotification('Error al copiar', 'error');
    });
}

function shareProfile() {
    const url = window.location.href;
    copyToClipboard(url);
    showNotification('Enlace del perfil copiado', 'success');
}

// Search functionality
function searchPosts(query) {
    const posts = document.querySelectorAll('.post');
    posts.forEach(post => {
        const content = post.textContent.toLowerCase();
        if (content.includes(query.toLowerCase())) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
}

// Infinite scroll
function setupInfiniteScroll() {
    let loading = false;
    
    window.addEventListener('scroll', () => {
        if (loading) return;
        
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        
        if (scrollTop + clientHeight >= scrollHeight - 1000) {
            loading = true;
            loadMoreContent();
        }
    });
}

function loadMoreContent() {
    // Simulate loading more posts
    setTimeout(() => {
        const samplePosts = [
            {
                author: 'Hugo Lc',
                content: 'Explorando nuevas tecnologías en desarrollo web 🚀',
                time: 'Hace 1h',
                likes: Math.floor(Math.random() * 100),
                comments: Math.floor(Math.random() * 20),
                shares: Math.floor(Math.random() * 10)
            },
            {
                author: 'Hugo Lc',
                content: 'La programación es arte y ciencia a la vez 🎨💻',
                time: 'Hace 2h',
                likes: Math.floor(Math.random() * 100),
                comments: Math.floor(Math.random() * 20),
                shares: Math.floor(Math.random() * 10)
            }
        ];
        
        const postsContainer = document.getElementById('postsContainer');
        
        samplePosts.forEach(postData => {
            const postElement = document.createElement('article');
            postElement.className = 'post';
            postElement.innerHTML = `
                <div class="post-header">
                    <div class="post-user">
                        <img src="image/imagen1.jpg" alt="User" class="post-avatar">
                        <div class="user-info">
                            <h4>${postData.author} <i class="fas fa-crown admin-icon" title="Administrador"></i></h4>
                            <span class="post-time">${postData.time}</span>
                        </div>
                    </div>
                    <button class="post-menu" onclick="showPostOptions(this)">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
                <div class="post-content">
                    <p>${postData.content}</p>
                </div>
                <div class="post-actions">
                    <button class="action-btn like">
                        <i class="far fa-heart"></i>
                        <span>${postData.likes}</span>
                    </button>
                    <button class="action-btn comment" onclick="showComments(this)">
                        <i class="far fa-comment"></i>
                        <span>${postData.comments}</span>
                    </button>
                    <button class="action-btn share" onclick="sharePost(this)">
                        <i class="far fa-share-square"></i>
                        <span>${postData.shares}</span>
                    </button>
                </div>
            `;
            
            postsContainer.appendChild(postElement);
        });
        
        loading = false;
    }, 1000);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadPreferences();
    setupInfiniteScroll();
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// PWA Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
    // Show install button
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    showNotification('¡App instalada exitosamente!', 'success');
                }
                deferredPrompt = null;
            }
        });
    }
});

// Network status detection
window.addEventListener('online', () => {
    showNotification('Conexión restaurada', 'success');
});

window.addEventListener('offline', () => {
    showNotification('Sin conexión a internet', 'error');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for post modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openPostModal();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closePostModal();
        closeCommentsModal();
    }
});

// Touch gestures for mobile
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY - touchEndY;
    
    // Pull to refresh
    if (diffY < -100 && window.scrollY === 0) {
        refreshFeed();
    }
});

function refreshFeed() {
    showNotification('Actualizando feed...', 'info');
    // Simulate refresh
    setTimeout(() => {
        showNotification('Feed actualizado', 'success');
    }, 1500);
}

// Image lazy loading
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Error capturado:', e.error);
    showNotification('Se produjo un error inesperado', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rechazada:', e.reason);
    showNotification('Error de conectividad', 'error');
});

// Analytics (placeholder for real analytics)
function trackEvent(eventName, properties = {}) {
    console.log('Event tracked:', eventName, properties);
    // Here you would send to your analytics service
}

// Export functions for testing (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showNotification,
        getTimeAgo,
        formatNumber,
        debounce
    };
}