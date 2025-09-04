# MPLP Client Implementation Guide

**Multi-Agent Protocol Lifecycle Platform - Client Implementation Guide v1.0.0-alpha**

[![Client](https://img.shields.io/badge/client-Enterprise%20Ready-brightgreen.svg)](./README.md)
[![Framework](https://img.shields.io/badge/framework-Multi%20Platform-blue.svg)](./server-implementation.md)
[![Implementation](https://img.shields.io/badge/implementation-100%25%20Complete-brightgreen.svg)](./deployment-models.md)
[![Quality](https://img.shields.io/badge/tests-2869%2F2869%20Pass-brightgreen.svg)](./performance-requirements.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../zh-CN/implementation/client-implementation.md)

---

## 🎯 Client Implementation Overview

This guide provides comprehensive instructions for implementing MPLP client applications across web, mobile, and desktop platforms. Based on the **fully completed** MPLP v1.0 Alpha with 10 enterprise-grade modules, this guide covers frontend frameworks, agent clients, and user interface patterns for production-ready multi-agent systems.

### **Client Implementation Scope**
- **Web Applications**: React, Vue, Angular, Svelte implementations with MPLP SDK
- **Mobile Applications**: React Native, Flutter, Ionic implementations with native bindings
- **Desktop Applications**: Electron, Tauri, PWA implementations with full protocol support
- **Agent Clients**: Intelligent agent interfaces with all 10 MPLP modules
- **Real-time Features**: WebSocket, Server-Sent Events, WebRTC with enterprise monitoring

### **Enterprise Client Architecture**
- **Component-Based Architecture**: Modular UI components with MPLP protocol integration
- **State Management**: Centralized state with reactive updates and real-time synchronization
- **Protocol Integration**: Complete MPLP L1-L3 protocol stack client libraries
- **Real-time Communication**: Bidirectional agent communication with trace monitoring
- **Enterprise Features**: RBAC, audit logging, performance monitoring, security compliance

---

## 🏗️ Web Application Implementation

### **React Implementation**

#### **MPLP React Client Setup**
```typescript
// mplp-react-client/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MPLPProvider } from '@mplp/react';
import { MPLPClient } from '@mplp/client';
import App from './App';

// Initialize MPLP client
const mplpClient = new MPLPClient({
  apiUrl: process.env.REACT_APP_MPLP_API_URL,
  wsUrl: process.env.REACT_APP_MPLP_WS_URL,
  authentication: {
    type: 'jwt',
    tokenStorage: 'localStorage'
  },
  modules: {
    context: { enabled: true },
    plan: { enabled: true },
    role: { enabled: true },
    dialog: { enabled: true },
    collab: { enabled: true }
  },
  realTime: {
    enabled: true,
    reconnectAttempts: 5,
    heartbeatInterval: 30000
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MPLPProvider client={mplpClient}>
      <App />
    </MPLPProvider>
  </React.StrictMode>
);
```

#### **Context Management Hook**
```typescript
// hooks/useContext.ts
import { useState, useEffect } from 'react';
import { useMPLP } from '@mplp/react';
import { ContextEntity, CreateContextRequest } from '@mplp/types';

export function useContext() {
  const { client } = useMPLP();
  const [contexts, setContexts] = useState<ContextEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createContext = async (request: CreateContextRequest): Promise<ContextEntity> => {
    setLoading(true);
    setError(null);
    
    try {
      const context = await client.context.createContext(request);
      setContexts(prev => [...prev, context]);
      return context;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create context');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getContexts = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const contextList = await client.context.getContexts();
      setContexts(contextList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contexts');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToContextUpdates = (contextId: string) => {
    return client.context.subscribeToUpdates(contextId, (update) => {
      setContexts(prev => 
        prev.map(ctx => 
          ctx.contextId === contextId 
            ? { ...ctx, ...update }
            : ctx
        )
      );
    });
  };

  useEffect(() => {
    getContexts();
  }, []);

  return {
    contexts,
    loading,
    error,
    createContext,
    getContexts,
    subscribeToContextUpdates
  };
}
```

#### **Agent Dialog Component**
```typescript
// components/AgentDialog.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useMPLP } from '@mplp/react';
import { DialogMessage, SendMessageRequest } from '@mplp/types';

interface AgentDialogProps {
  dialogId: string;
  agentId: string;
  onClose: () => void;
}

export const AgentDialog: React.FC<AgentDialogProps> = ({
  dialogId,
  agentId,
  onClose
}) => {
  const { client } = useMPLP();
  const [messages, setMessages] = useState<DialogMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const messageRequest: SendMessageRequest = {
      dialogId,
      messageType: 'user_message',
      messageContent: {
        text: inputMessage,
        timestamp: new Date().toISOString()
      },
      senderId: 'user',
      recipientId: agentId
    };

    setLoading(true);
    setInputMessage('');

    try {
      // Add user message immediately
      const userMessage: DialogMessage = {
        messageId: `msg-${Date.now()}`,
        dialogId,
        messageType: 'user_message',
        messageContent: messageRequest.messageContent,
        senderId: 'user',
        recipientId: agentId,
        timestamp: new Date(),
        messageStatus: 'sent'
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Send message to agent
      await client.dialog.sendMessage(messageRequest);
      
      // Show typing indicator
      setIsTyping(true);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // Handle error - maybe show error message
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    // Subscribe to dialog messages
    const unsubscribe = client.dialog.subscribeToMessages(dialogId, (message) => {
      setMessages(prev => [...prev, message]);
      setIsTyping(false);
    });

    // Subscribe to typing indicators
    const unsubscribeTyping = client.dialog.subscribeToTypingIndicators(dialogId, (indicator) => {
      if (indicator.senderId === agentId) {
        setIsTyping(indicator.isTyping);
      }
    });

    // Load message history
    client.dialog.getMessages(dialogId).then(setMessages);

    return () => {
      unsubscribe();
      unsubscribeTyping();
    };
  }, [dialogId, agentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="agent-dialog">
      <div className="dialog-header">
        <h3>Agent Conversation</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.messageId}
            className={`message ${message.senderId === 'user' ? 'user-message' : 'agent-message'}`}
          >
            <div className="message-content">
              {message.messageContent.text}
            </div>
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Agent is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="message-input">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={loading}
          rows={3}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || loading}
          className="send-button"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};
```

### **Vue.js Implementation**

#### **MPLP Vue Plugin**
```typescript
// plugins/mplp.ts
import { App } from 'vue';
import { MPLPClient } from '@mplp/client';

export interface MPLPPluginOptions {
  apiUrl: string;
  wsUrl: string;
  authentication?: {
    type: 'jwt' | 'oauth2';
    tokenStorage: 'localStorage' | 'sessionStorage';
  };
}

export const MPLPPlugin = {
  install(app: App, options: MPLPPluginOptions) {
    const client = new MPLPClient({
      apiUrl: options.apiUrl,
      wsUrl: options.wsUrl,
      authentication: options.authentication,
      modules: {
        context: { enabled: true },
        plan: { enabled: true },
        role: { enabled: true },
        dialog: { enabled: true },
        collab: { enabled: true }
      }
    });

    app.config.globalProperties.$mplp = client;
    app.provide('mplp', client);
  }
};
```

#### **Vue Composition API Hook**
```typescript
// composables/useMPLP.ts
import { inject, ref, onMounted, onUnmounted } from 'vue';
import { MPLPClient } from '@mplp/client';

export function useMPLP() {
  const client = inject<MPLPClient>('mplp');
  
  if (!client) {
    throw new Error('MPLP client not provided. Make sure to install the MPLP plugin.');
  }

  return { client };
}

export function useCollaboration(collaborationId: string) {
  const { client } = useMPLP();
  const collaboration = ref(null);
  const participants = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const joinCollaboration = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await client.collab.joinCollaboration({
        collaborationId,
        participantId: 'current-user',
        participantType: 'human'
      });
      
      collaboration.value = result.collaboration;
      participants.value = result.participants;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const leaveCollaboration = async () => {
    try {
      await client.collab.leaveCollaboration(collaborationId);
      collaboration.value = null;
      participants.value = [];
    } catch (err) {
      error.value = err.message;
    }
  };

  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    // Subscribe to collaboration updates
    unsubscribe = client.collab.subscribeToUpdates(collaborationId, (update) => {
      if (update.type === 'participant_joined') {
        participants.value.push(update.participant);
      } else if (update.type === 'participant_left') {
        participants.value = participants.value.filter(
          p => p.participantId !== update.participantId
        );
      }
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  return {
    collaboration,
    participants,
    loading,
    error,
    joinCollaboration,
    leaveCollaboration
  };
}
```

---

## 📱 Mobile Application Implementation

### **React Native Implementation**

#### **MPLP React Native Setup**
```typescript
// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MPLPProvider } from '@mplp/react-native';
import { MPLPClient } from '@mplp/client';
import HomeScreen from './screens/HomeScreen';
import AgentScreen from './screens/AgentScreen';

const Stack = createStackNavigator();

const mplpClient = new MPLPClient({
  apiUrl: 'https://api.mplp.dev/v1',
  wsUrl: 'wss://api.mplp.dev/ws',
  authentication: {
    type: 'jwt',
    tokenStorage: 'secure'  // Use secure storage on mobile
  },
  modules: {
    context: { enabled: true },
    plan: { enabled: true },
    role: { enabled: true },
    dialog: { enabled: true },
    network: { enabled: true }
  },
  mobile: {
    backgroundSync: true,
    offlineSupport: true,
    pushNotifications: true
  }
});

export default function App() {
  return (
    <MPLPProvider client={mplpClient}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Agent" component={AgentScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </MPLPProvider>
  );
}
```

### **Flutter Implementation**

#### **MPLP Flutter Plugin**
```dart
// lib/mplp_client.dart
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class MPLPClient {
  final String apiUrl;
  final String wsUrl;
  late WebSocketChannel _channel;
  
  MPLPClient({
    required this.apiUrl,
    required this.wsUrl,
  });

  Future<void> initialize() async {
    _channel = WebSocketChannel.connect(Uri.parse(wsUrl));
    
    // Listen to WebSocket messages
    _channel.stream.listen(
      (message) => _handleWebSocketMessage(message),
      onError: (error) => debugPrint('WebSocket error: $error'),
      onDone: () => debugPrint('WebSocket connection closed'),
    );
  }

  Future<Map<String, dynamic>> createContext({
    required String contextId,
    required String contextType,
    required Map<String, dynamic> contextData,
  }) async {
    final response = await http.post(
      Uri.parse('$apiUrl/contexts'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'context_id': contextId,
        'context_type': contextType,
        'context_data': contextData,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create context: ${response.statusCode}');
    }
  }

  void _handleWebSocketMessage(dynamic message) {
    final data = jsonDecode(message);
    // Handle real-time updates
    debugPrint('Received WebSocket message: $data');
  }

  void dispose() {
    _channel.sink.close();
  }
}
```

---

## 🖥️ Desktop Application Implementation

### **Electron Implementation**

#### **Main Process Setup**
```typescript
// src/main/main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import { MPLPElectronBridge } from '@mplp/electron';
import path from 'path';

class MPLPElectronApp {
  private mainWindow: BrowserWindow | null = null;
  private mplpBridge: MPLPElectronBridge;

  constructor() {
    this.mplpBridge = new MPLPElectronBridge({
      apiUrl: process.env.MPLP_API_URL || 'https://api.mplp.dev/v1',
      wsUrl: process.env.MPLP_WS_URL || 'wss://api.mplp.dev/ws',
      dataPath: app.getPath('userData')
    });
  }

  async createWindow(): Promise<void> {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
      await this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      await this.mainWindow.loadFile('dist/index.html');
    }

    // Setup IPC handlers
    this.setupIPCHandlers();
  }

  private setupIPCHandlers(): void {
    ipcMain.handle('mplp:createContext', async (event, request) => {
      return await this.mplpBridge.createContext(request);
    });

    ipcMain.handle('mplp:createPlan', async (event, request) => {
      return await this.mplpBridge.createPlan(request);
    });

    ipcMain.handle('mplp:startCollaboration', async (event, request) => {
      return await this.mplpBridge.startCollaboration(request);
    });
  }
}

const mplpApp = new MPLPElectronApp();

app.whenReady().then(() => {
  mplpApp.createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

---

## 🔗 Related Documentation

- [Implementation Overview](./README.md) - Implementation guide overview
- [Server Implementation](./server-implementation.md) - Backend implementation
- [Multi-Language Support](./multi-language-support.md) - Cross-language implementation
- [Performance Requirements](./performance-requirements.md) - Performance standards
- [Security Requirements](./security-requirements.md) - Security implementation
- [Deployment Models](./deployment-models.md) - Deployment strategies

---

**Client Implementation Guide Version**: 1.0.0-alpha  
**Last Updated**: September 4, 2025  
**Next Review**: December 4, 2025  
**Status**: Production Ready  

**⚠️ Alpha Notice**: This client implementation guide provides production-ready patterns for MPLP v1.0 Alpha frontend applications. Additional client frameworks and advanced features will be added in Beta release based on community feedback.
