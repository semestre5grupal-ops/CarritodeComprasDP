<script setup>
import { ref, onMounted, nextTick } from 'vue'
import api from '../services/api'

const isOpen = ref(false)
const message = ref('')
const conversation = ref([
  { sender: 'bot', text: '¡Hola! Soy el asistente virtual de Shop Sport. ¿En qué te puedo ayudar hoy?' }
])
const isLoading = ref(false)
const chatContainer = ref(null)

function toggleChat() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    scrollToBottom()
  }
}

async function sendMessage() {
  const text = message.value.trim()
  if (!text || isLoading.value) return

  conversation.value.push({ sender: 'user', text })
  message.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    // Preparar el historial (tomando solo los últimos 6 mensajes para no consumir excesivos tokens ni sobrepasar límites)
    const recentConversation = conversation.value.slice(-6)
    const history = recentConversation.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }))

    const response = await api.post('/ia/chat', { history })
    conversation.value.push({ sender: 'bot', text: response.reply || 'No pude entender tu solicitud.' })
  } catch (err) {
    conversation.value.push({ sender: 'bot', text: 'Ocurrió un error de conexión con mi servidor. Intenta de nuevo más tarde.' })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}
</script>

<template>
  <div class="ai-chatbot-container">
    <button 
      class="chat-toggle-btn" 
      :aria-expanded="isOpen"
      aria-label="Abrir Asistente Virtual"
      @click="toggleChat"
    >
      <svg
        v-if="!isOpen"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <svg
        v-else
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <line
          x1="18"
          y1="6"
          x2="6"
          y2="18"
        />
        <line
          x1="6"
          y1="6"
          x2="18"
          y2="18"
        />
      </svg>
    </button>

    <div
      v-show="isOpen"
      class="chat-window"
    >
      <div class="chat-header">
        <h3>Asistente Virtual</h3>
        <span class="bot-status">En línea</span>
      </div>
      
      <div
        ref="chatContainer"
        class="chat-messages"
      >
        <div 
          v-for="(msg, index) in conversation" 
          :key="index"
          :class="['chat-bubble', msg.sender === 'user' ? 'user-bubble' : 'bot-bubble']"
        >
          <p>{{ msg.text }}</p>
        </div>
        <div
          v-if="isLoading"
          class="chat-bubble bot-bubble loading-bubble"
        >
          <span class="dot" /><span class="dot" /><span class="dot" />
        </div>
      </div>

      <form
        class="chat-input-area"
        @submit.prevent="sendMessage"
      >
        <input 
          v-model="message" 
          type="text" 
          placeholder="Escribe tu duda aquí..." 
          :disabled="isLoading"
          required
        >
        <button
          type="submit"
          :disabled="isLoading || !message.trim()"
        >
          Enviar
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.ai-chatbot-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  font-family: inherit;
}

.chat-toggle-btn {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

.chat-toggle-btn:hover {
  transform: scale(1.05);
}

.chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 320px;
  height: 400px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: var(--accent);
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.chat-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.bot-status {
  font-size: 0.8rem;
  opacity: 0.8;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  background: #f9f9f9;
}

.chat-bubble {
  max-width: 80%;
  padding: 0.8rem 1rem;
  border-radius: 18px;
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
}

.chat-bubble p {
  margin: 0;
  white-space: pre-wrap;
}

.user-bubble {
  align-self: flex-end;
  background: var(--accent);
  color: white;
  border-bottom-right-radius: 4px;
}

.bot-bubble {
  align-self: flex-start;
  background: white;
  color: var(--ink);
  border: 1px solid var(--line);
  border-bottom-left-radius: 4px;
}

.loading-bubble {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.8rem 1.2rem;
}

.dot {
  width: 6px;
  height: 6px;
  background: var(--muted);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.chat-input-area {
  display: flex;
  padding: 0.8rem;
  background: white;
  border-top: 1px solid var(--line);
}

.chat-input-area input {
  flex: 1;
  padding: 0.6rem 1rem;
  border: 1px solid var(--line);
  border-radius: 20px;
  outline: none;
  font-size: 0.9rem;
}

.chat-input-area input:focus {
  border-color: var(--accent);
}

.chat-input-area button {
  background: transparent;
  color: var(--accent);
  border: none;
  font-weight: 600;
  padding: 0 0.8rem;
  cursor: pointer;
}

.chat-input-area button:disabled {
  color: var(--muted);
  cursor: not-allowed;
}
</style>
