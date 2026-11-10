(function() {
  if (document.getElementById('chatbot-floating-btn')) return;

  const container = document.createElement('div');
  container.innerHTML = `
    <style>
      #chatbot-floating-btn {
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 65px; height: 65px; border-radius: 50%; background-color: #1e1e1e;
        border: 3px solid #00e5ff; box-shadow: 0 4px 20px rgba(0, 229, 255, 0.4);
        cursor: grab; z-index: 999999; user-select: none; touch-action: none;
        display: flex; align-items: center; justify-content: center; overflow: hidden;
      }
      #chatbot-floating-btn:active { cursor: grabbing; }
      
      /* Icon Robot SVG thay thế ảnh để không bao giờ bị lỗi load */
      #chatbot-floating-btn svg {
        width: 34px;
        height: 34px;
        fill: #00e5ff;
        pointer-events: none;
      }

      #chatbot-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
        z-index: 1000000; display: none; opacity: 0; transition: opacity 0.3s ease;
      }
      #chatbot-overlay.active { display: block; opacity: 1; }

      #chatbot-sheet {
        position: fixed; left: 0; right: 0; bottom: 0;
        max-width: 600px; margin: 0 auto; background: #1e1e1e;
        border-top-left-radius: 20px; border-top-right-radius: 20px;
        box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.5); z-index: 1000001;
        transform: translateY(100%); transition: transform 0.35s cubic-bezier(0.1, 0.9, 0.2, 1);
        display: flex; flex-direction: column; height: 75vh; border-top: 1px solid #333;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #fff; box-sizing: border-box;
      }
      #chatbot-sheet.active { transform: translateY(0); }

      .cb-header { padding: 16px 20px; border-bottom: 1px solid #2d2d2d; display: flex; justify-content: space-between; align-items: center; }
      .cb-title { font-size: 1.1rem; font-weight: 600; color: #00e5ff; }
      .cb-close { background: none; border: none; color: #888; font-size: 1.5rem; cursor: pointer; }
      .cb-close:hover { color: #fff; }

      .cb-body { padding: 20px; flex: 1; display: flex; flex-direction: column; overflow: hidden; }
      .cb-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 4px; margin-bottom: 12px; }
      .cb-msg { max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 0.9rem; line-height: 1.4; word-break: break-word; }
      .cb-msg.user { align-self: flex-end; background: #0088ff; color: #fff; border-bottom-right-radius: 2px; }
      .cb-msg.assistant { align-self: flex-start; background: #2a2a2a; color: #e0e0e0; border-bottom-left-radius: 2px; }
      .cb-msg img { max-width: 100%; border-radius: 8px; margin-top: 6px; display: block; }

      .cb-input-area { display: flex; gap: 8px; align-items: center; }
      .cb-input-area input[type="text"] { flex: 1; background: #121212; border: 1px solid #333; border-radius: 8px; padding: 12px; color: #fff; outline: none; }
      .cb-input-area input[type="text"]:focus { border-color: #00e5ff; }
      
      .cb-upload-btn { background: #2a2a2a; border: 1px solid #444; color: #00e5ff; padding: 10px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
      .cb-upload-btn:hover { background: #333; }
      
      .cb-send-btn { background: #00e5ff; color: #000; border: none; padding: 10px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; height: 100%; }
      .cb-send-btn:disabled { background: #444; color: #888; cursor: not-allowed; }
    </style>

    <div id="chatbot-floating-btn" title="Mở AI Study Assistant">
      <svg viewBox="0 0 24 24">
        <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H15A térmica... Let's use clean standard bot SVG path ... M20,10V8H18V10H20M6,10V8H4V10H6M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12C6,15.31 8.69,18 12,18C15.31,18 18,15.31 18,12C18,8.69 15.31,6 12,6M10,10.5C10,11.33 9.33,12 8.5,12C7.67,12 7,11.33 7,10.5C7,9.67 7.67,9 8.5,9C9.33,9 10,9.67 10,10.5M17,10.5C17,11.33 16.33,12 15.5,12C14.67,12 14,11.33 14,10.5C14,9.67 14.67,9 15.5,9C16.33,9 17,9.67 17,10.5M12,13.5C10.67,13.5 9.5,14.33 9.08,15.5H14.92C14.5,14.33 13.33,13.5 12,13.5Z"/>
      </svg>
    </div>

    <div id="chatbot-overlay"></div>
    
    <div id="chatbot-sheet">
      <div class="cb-header">
        <span class="cb-title">AI Study Assistant</span>
        <button class="cb-close" id="cb-close-btn">&times;</button>
      </div>
      <div class="cb-body">
        <div class="cb-messages" id="cb-messages"></div>
        <div class="cb-input-area">
          <input type="file" id="cb-file-input" accept="image/*" style="display: none;">
          <button class="cb-upload-btn" id="cb-upload" title="Gửi ảnh đề bài">📷</button>
          <input type="text" id="cb-input" placeholder="Nhập câu hỏi hoặc gửi ảnh..." autocomplete="off">
          <button class="cb-send-btn" id="cb-send">Gửi</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  const floatBtn = document.getElementById('chatbot-floating-btn');
  const overlay = document.getElementById('chatbot-overlay');
  const sheet = document.getElementById('chatbot-sheet');
  const closeBtn = document.getElementById('cb-close-btn');
  const msgContainer = document.getElementById('cb-messages');
  const inputField = document.getElementById('cb-input');
  const sendBtn = document.getElementById('cb-send');
  const uploadBtn = document.getElementById('cb-upload');
  const fileInput = document.getElementById('cb-file-input');

  let isDragging = false, hasDragged = false;
  let startX, startY, initialLeft, initialTop;
  let selectedImageBase64 = null;

  const onDown = (e) => {
    isDragging = true; hasDragged = false;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startX = clientX; startY = clientY;
    const rect = floatBtn.getBoundingClientRect();
    initialLeft = rect.left + rect.width / 2;
    initialTop = rect.top + rect.height / 2;
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    if (Math.abs(clientX - startX) > 5 || Math.abs(clientY - startY) > 5) hasDragged = true;
    
    let newLeft = initialLeft + (clientX - startX);
    let newTop = initialTop + (clientY - startY);
    floatBtn.style.left = `${Math.max(35, Math.min(window.innerWidth - 35, newLeft))}px`;
    floatBtn.style.top = `${Math.max(35, Math.min(window.innerHeight - 35, newTop))}px`;
    floatBtn.style.transform = 'translate(-50%, -50%)';
  };

  const onUp = () => { isDragging = false; };

  floatBtn.addEventListener('mousedown', onDown);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  floatBtn.addEventListener('touchstart', onDown, { passive: true });
  document.addEventListener('touchmove', onMove, { passive: true });
  document.addEventListener('touchend', onUp);

  floatBtn.addEventListener('click', () => {
    if (!hasDragged) {
      overlay.classList.add('active');
      sheet.classList.add('active');
    }
  });

  const closeModal = () => {
    overlay.classList.remove('active');
    sheet.classList.remove('active');
  };
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(uploadEvent) {
        selectedImageBase64 = uploadEvent.target.result;
        inputField.placeholder = "Đã chọn ảnh! Nhấn gửi để hỏi AI...";
        uploadBtn.style.borderColor = "#00e5ff";
      };
      reader.readAsDataURL(file);
    }
  });

  let historyMessages = [];

  async function handleSend() {
    const text = inputField.value.trim();
    if (!text && !selectedImageBase64) return;

    let messageContent = text;
    let displayHtml = text;

    if (selectedImageBase64) {
      messageContent = `${text}\n[Image attached: ${selectedImageBase64}]`;
      displayHtml = `${text ? text + '<br>' : ''}<img src="${selectedImageBase64}" alt="Uploaded image">`;
    }

    historyMessages.push({ role: 'user', content: messageContent });
    
    inputField.value = '';
    inputField.placeholder = "Nhập câu hỏi hoặc gửi ảnh...";
    selectedImageBase64 = null;
    uploadBtn.style.borderColor = "#444";
    fileInput.value = '';
    
    renderChatCustom(displayHtml, 'user');

    sendBtn.disabled = true;
    sendBtn.textContent = '...';

    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyMessages.map(m => ({ role: m.role, content: m.content })),
          model: 'openai',
          jsonMode: false
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reply = await response.text();
      historyMessages.push({ role: 'assistant', content: reply });
      renderChat();
    } catch (err) {
      historyMessages.push({ role: 'assistant', content: `[Lỗi kết nối]: ${err.message}` });
      renderChat();
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Gửi';
    }
  }

  function renderChatCustom(htmlContent, role) {
    const div = document.createElement('div');
    div.className = `cb-msg ${role}`;
    div.innerHTML = htmlContent;
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function renderChat() {
    msgContainer.innerHTML = '';
    historyMessages.forEach(m => {
      const div = document.createElement('div');
      div.className = `cb-msg ${m.role}`;
      if (m.content.includes('[Image attached:')) {
        const parts = m.content.split('[Image attached:');
        const textPart = parts[0];
        const imgPart = parts[1].replace(']', '').trim();
        div.innerHTML = `${textPart ? textPart + '<br>' : ''}<img src="${imgPart}" alt="Image">`;
      } else {
        div.textContent = m.content;
      }
      msgContainer.appendChild(div);
    });
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  sendBtn.addEventListener('click', handleSend);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
})();
