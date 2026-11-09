(function() {
  if (document.getElementById('chatbot-floating-btn')) return;

  // Tạo giao diện HTML/CSS
  const container = document.createElement('div');
  container.innerHTML = `
    <style>
      #chatbot-floating-btn {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background-color: #2a2a2a;
        border: 3px solid #00e5ff;
        box-shadow: 0 4px 20px rgba(0, 229, 255, 0.4);
        cursor: grab;
        z-index: 999999;
        user-select: none;
        touch-action: none;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      #chatbot-floating-btn:active { cursor: grabbing; }
      #chatbot-floating-btn img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }

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

      .cb-input-area { display: flex; gap: 8px; }
      .cb-input-area input { flex: 1; background: #121212; border: 1px solid #333; border-radius: 8px; padding: 12px; color: #fff; outline: none; }
      .cb-input-area input:focus { border-color: #00e5ff; }
      .cb-send-btn { background: #00e5ff; color: #000; border: none; padding: 0 16px; border-radius: 8px; font-weight: bold; cursor: pointer; }
      .cb-send-btn:disabled { background: #444; color: #888; cursor: not-allowed; }
    </style>

    <div id="chatbot-floating-btn">
      <img src="https://lh3.googleusercontent.com/gg/AAY1aEikzQ1BllfIu-C2j0g80xV_5v8j-P8x1H3T0284d7a" alt="Chatbot">
    </div>

    <div id="chatbot-overlay"></div>
    
    <div id="chatbot-sheet">
      <div class="cb-header">
        <span class="cb-title">OpenRouter AI Chat (Gemini Flash)</span>
        <button class="cb-close" id="cb-close-btn">&times;</button>
      </div>
      <div class="cb-body">
        <div class="cb-messages" id="cb-messages"></div>
        <div class="cb-input-area">
          <input type="text" id="cb-input" placeholder="Nhập tin nhắn..." autocomplete="off">
          <button class="cb-send-btn" id="cb-send">Gửi</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // Logic Kéo thả nút nổi
  const floatBtn = document.getElementById('chatbot-floating-btn');
  const overlay = document.getElementById('chatbot-overlay');
  const sheet = document.getElementById('chatbot-sheet');
  const closeBtn = document.getElementById('cb-close-btn');
  const msgContainer = document.getElementById('cb-messages');
  const inputField = document.getElementById('cb-input');
  const sendBtn = document.getElementById('cb-send');

  let isDragging = false, hasDragged = false;
  let startX, startY, initialLeft, initialTop;

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

  // Mở/Đóng giao diện Modal
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

  // Xử lý gửi tin nhắn OpenRouter API
  let historyMessages = [];

  async function handleSend() {
    const text = inputField.value.trim();
    if (!text) return;

    historyMessages.push({ role: 'user', content: text });
    inputField.value = '';
    renderChat();

    sendBtn.disabled = true;
    sendBtn.textContent = '...';

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer Sk-or-v1-47a1b6913fb73dd02fa582b25d54f229ac8bfb4f8a592c4f638b2a7198611eb9',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-flash-1.5',
          messages: historyMessages
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices[0]?.message?.content || 'Không nhận được phản hồi.';
      historyMessages.push({ role: 'assistant', content: reply });
    } catch (err) {
      historyMessages.push({ role: 'assistant', content: `[Lỗi API]: ${err.message}` });
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Gửi';
      renderChat();
    }
  }

  function renderChat() {
    msgContainer.innerHTML = '';
    historyMessages.forEach(m => {
      const div = document.createElement('div');
      div.className = `cb-msg ${m.role}`;
      div.textContent = m.content;
      msgContainer.appendChild(div);
    });
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  sendBtn.addEventListener('click', handleSend);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
})();
