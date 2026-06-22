# AI Chat Redesign — Chat History & UI Overhaul

**Date:** 2026-04-07
**Status:** Approved
**Branch:** feature/HRIS-ai-chat (frontend + backend)

## Overview

Redesign the AI Chat feature to provide a Claude.ai/ChatGPT-style experience with persistent chat history, a collapsible conversation sidebar, and a polished chat UI. The main app sidebar collapses to icon-only mode when on the AI Chat page to maximize chat space.

## Decisions

- Collapsible conversation sidebar within the existing app layout (Approach 3: Hybrid Immersive)
- New conversations auto-created on first message + "New Chat" button in sidebar
- Titles auto-generated from first message, editable via inline rename
- Individual conversation delete (no bulk clear)
- All messages loaded at once (no pagination)
- Messages saved after full AI exchange completes (user + assistant together)

## Layout

```
+------+----------------+--------------------------------------+
| Icon | Conversations  |  Chat Area                           |
| Nav  | (collapsible)  |                                      |
|      | [+ New Chat]   |  Chat Header (title, model badge)    |
| Home | -------------- |  ----------------------------------- |
| Team | Today          |  Messages                            |
| Cal  |   Conv 1       |    Assistant: ...                    |
| News |   Conv 2 *     |    You: ...                          |
| AI * | Yesterday      |    Assistant: ...                    |
|      |   Conv 3       |                                      |
|      |   Conv 4       |  ----------------------------------- |
|      |                |  [Message HRIS Assistant...]    [Send]|
+------+----------------+--------------------------------------+
```

- Far left: Main app sidebar in icon-only (collapsed) mode
- Conversation sidebar: ~280px, collapsible, state persisted in localStorage
- Chat area: Full remaining width

## Conversation Sidebar

### Header
- Title: "Conversations"
- "New Chat" button (primary violet, + icon)
- Collapse toggle button (chevron)

### Conversation List
- Grouped by: Today, Yesterday, Previous 7 Days, Older
- Each item shows:
  - Title (1 line, truncated with ellipsis)
  - Last message preview (1 line, muted)
  - Active conversation: violet left border + light violet background
- Hover reveals: pencil icon (rename), trash icon (delete with confirm)

### Collapsed State
- Shrinks to ~48px
- Shows only toggle and "+" new chat icon
- Conversation list hidden

### Empty State
- "No conversations yet. Start a new chat!"

## Chat Area

### Empty State (New Chat)
- Centered layout with bot icon
- Title: "HRIS AI Assistant", subtitle: "Powered by Claude"
- 2x2 suggested prompts grid:
  - "What are my leave balances?"
  - "What holidays are coming up?"
  - "Show recent announcements"
  - "Create a support ticket"
- Input bar pinned to bottom

### Chat Header Bar
- Current conversation title (click to edit inline)
- Model badge: "Claude Sonnet 4.6" pill in muted text
- New unsaved chat shows "New conversation"

### Messages
- Assistant: Left-aligned, no background, small bot avatar, markdown rendered
  - Tool actions as collapsible section: "Used N tools" expands to show tool pills
  - Timestamp on hover
- User: Right-aligned, violet bubble, white text, plain text
  - Timestamp on hover
- Typing indicator: Animated dots
- Auto-scroll to latest, stops if user scrolls up, floating "scroll to bottom" button

### Input Bar
- Auto-resizing textarea (1 to 4 lines)
- Send button (violet) on right
- Placeholder: "Message HRIS Assistant..."
- Enter to send, Shift+Enter for new line
- Disabled while AI is responding

## Backend

### Database Schema

#### ai_chat_sessions
| Column     | Type         | Constraints                         |
|------------|--------------|-------------------------------------|
| id         | BIGSERIAL    | PRIMARY KEY                         |
| user_id    | BIGINT       | NOT NULL, FK -> users(id)           |
| title      | VARCHAR(255) | NOT NULL                            |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW()             |
| updated_at | TIMESTAMP    | NOT NULL, DEFAULT NOW()             |

Index: `idx_ai_chat_sessions_user` on `user_id`

#### ai_chat_messages
| Column       | Type         | Constraints                                     |
|--------------|--------------|------------------------------------------------|
| id           | BIGSERIAL    | PRIMARY KEY                                     |
| session_id   | BIGINT       | NOT NULL, FK -> ai_chat_sessions(id) ON DELETE CASCADE |
| role         | VARCHAR(20)  | NOT NULL ('user' or 'assistant')                |
| content      | TEXT         | NOT NULL                                        |
| tool_actions | JSONB        | nullable, stores [{tool, input, result}]        |
| created_at   | TIMESTAMP    | NOT NULL, DEFAULT NOW()                         |
| updated_at   | TIMESTAMP    | NOT NULL, DEFAULT NOW()                         |

Index: `idx_ai_chat_messages_session` on `session_id`

### API Endpoints

All endpoints require JWT authentication and are scoped to the current user.

| Method | Path                              | Description                              | Request Body                                           | Response                    |
|--------|-----------------------------------|------------------------------------------|--------------------------------------------------------|-----------------------------|
| GET    | /ai-chat/sessions?page=0&size=20  | List user's sessions (newest first)      | —                                                      | PagedResponse<SessionDTO>   |
| POST   | /ai-chat/sessions                 | Create new session                       | { title: string }                                      | SessionDTO                  |
| GET    | /ai-chat/sessions/:id             | Get session with all messages            | —                                                      | SessionDetailDTO            |
| PATCH  | /ai-chat/sessions/:id             | Rename session                           | { title: string }                                      | SessionDTO                  |
| DELETE | /ai-chat/sessions/:id             | Delete session + cascade messages        | —                                                      | 204 No Content              |
| POST   | /ai-chat/sessions/:id/messages    | Save message pair after AI exchange      | { userMessage, assistantMessage, toolActions? }         | MessageDTO[]                |

If the AI exchange fails, the frontend saves the user message + an error assistant message ("Sorry, something went wrong...") so no messages are lost.

### Architecture (Hexagonal)

- **Entity:** `AIChatSession`, `AIChatMessage` extending `BaseEntity`
- **Repository:** `AIChatSessionRepository`, `AIChatMessageRepository` in `infrastructure/database/repository/`
- **Service:** `AIChatService` interface + `AIChatServiceImpl` in `application/aichat/`
- **Controller:** `AIChatController` in `infrastructure/controller/`
- **DTOs:** Request/Response DTOs in `application/dto/request/` and `application/dto/response/`
- **Migration:** `V22__create_ai_chat_tables.sql`

### Session DTO (for sidebar list)
```
{
  id: number
  title: string
  lastMessagePreview: string (nullable)
  createdAt: string
  updatedAt: string
}
```

### Session Detail DTO (full conversation)
```
{
  id: number
  title: string
  messages: MessageDTO[]
  createdAt: string
  updatedAt: string
}
```

### Message DTO
```
{
  id: number
  sessionId: number
  role: 'user' | 'assistant'
  content: string
  toolActions: [{tool, input, result}] (nullable)
  createdAt: string
}
```

## Frontend

### Routes
```
/ai-chat        -> New chat (empty state)
/ai-chat/:id    -> Existing conversation
```

### Component Tree
```
AIChat (layout wrapper, manages sidebar collapse of main nav)
  ChatSidebar
    NewChatButton
    ConversationGroup (Today / Yesterday / Previous 7 Days / Older)
      ConversationItem (title, preview, rename, delete)
    CollapseToggle
  ChatArea
    ChatHeader (title inline edit, model badge)
    MessageList
      EmptyState (bot icon, suggested prompts grid)
      MessageBubble (user variant)
      MessageBubble (assistant variant + markdown + tool pills)
      TypingIndicator (animated dots)
      ScrollToBottomButton
    ChatInput (auto-resize textarea, send button)
```

### State & Data Flow

**Session list (sidebar):**
- `useQuery(['ai-chat-sessions'], () => apiGet('/ai-chat/sessions?page=0&size=50'))`
- Invalidated on create, delete, rename, new messages

**Session detail (chat area):**
- `useQuery(['ai-chat-session', id], () => apiGet('/ai-chat/sessions/${id}'))` when route has `:id`
- Messages from query populate the message list

**New chat flow:**
1. User lands on `/ai-chat` (empty state with suggested prompts)
2. User types first message
3. `POST /ai-chat/sessions` with title = first message truncated to 50 chars
4. Run AI exchange via existing `sendChatMessage()`
5. `POST /ai-chat/sessions/:id/messages` to persist the pair
6. Navigate to `/ai-chat/:id`
7. Invalidate session list

**Existing chat flow:**
1. User navigates to `/ai-chat/:id`, messages load from backend
2. User sends message, AI exchange runs
3. Save message pair to backend
4. Invalidate session detail query

**Rename:** Inline edit -> `PATCH /ai-chat/sessions/:id` -> invalidate session list
**Delete:** Confirm dialog -> `DELETE /ai-chat/sessions/:id` -> navigate to `/ai-chat` -> invalidate session list

**Sidebar collapse:** State in localStorage, CSS transition animation

### Main App Sidebar Integration
- When route matches `/ai-chat*`, the AuthenticatedLayout sidebar renders in icon-only (collapsed) mode
- This is controlled by checking `location.pathname.startsWith('/ai-chat')` in the layout component

### Existing Code Reuse
- `chat-service.ts` — reused as-is for AI exchange logic
- `executor.ts` — reused as-is for tool execution
- `tools.ts` — reused as-is for tool definitions
- `spring-boot-api.ts` — reused for all API calls
- `react-markdown` + `remark-gfm` — already installed for markdown rendering
