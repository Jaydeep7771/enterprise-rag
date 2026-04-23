Beginner's Guide to the Enterprise RAG Document Assistant
Welcome! If you are new to coding or Artificial Intelligence, this document will explain exactly how our app works in plain, simple English. We will walk through the core concepts and the most important files in the project.

1. The Big Picture: What is RAG?
Normally, if you ask an AI (like ChatGPT) a highly specific question about your private company data, it won't know the answer because it wasn't trained on your data.

To fix this, we use a technique called RAG (Retrieval-Augmented Generation). It works in three steps:

Retrieve: When a user asks a question, we retrieve the most relevant paragraphs from the uploaded documents.
Augment: We augment (add) those paragraphs to the user's question as background context.
Generate: The AI generates an answer using ONLY the background context we gave it.
This guarantees the AI doesn't "hallucinate" (make things up) and allows us to provide exact source citations.

2. The Frontend (What the User Sees)
The frontend is built using React and Next.js. It handles the user interface.

app/page.tsx
Think of this as the main "homepage" of the application. It acts as a dashboard layout. It holds two main visual pieces:

The sidebar for uploading documents.
The main area for the chat interface.
components/DocumentUpload.tsx
This is the drag-and-drop box where users upload PDFs.

When a file is dropped here, this code packages the file and sends it to our backend server (the api/ingest route).
It also shows loading spinners while the document is being processed.
components/ChatInterface.tsx
This is the chat window.

It keeps a visual history of all the messages sent back and forth.
When you type a question and hit enter, this code sends your question (along with the history of the conversation) to our backend server (the api/chat route).
When the backend replies, it displays the AI's answer and the little source badges at the bottom of the message.
3. The Backend (The Brains of the App)
The backend is where the heavy lifting happens. It is divided into three main parts: the Ingest Route, the Document Store, and the Chat Route.

A. The Ingest Route (app/api/ingest/route.ts)
Goal: Read the uploaded file and chop it into pieces.

When you upload a PDF, it lands here.

The code looks at the file. If it's a PDF, it uses a tool called pdf-parse to extract all the English text out of the messy PDF code.
It then runs a "splitter" function. Imagine reading a 100-page book; it's hard to memorize the whole thing at once. The splitter chops the massive text into small "chunks" (about 2 paragraphs each).
Finally, it sends these chunks to the Document Store.
B. The Document Store (lib/document-store.ts)
Goal: Remember the chunks temporarily.

This is a very simple "in-memory" database. It is literally just a list (an array) saved in the server's RAM.

When the Ingest Route chops up a document, it saves the chunks here.
When the Chat Route needs to find answers, it searches through this list. (Note: Because it is "in-memory", if you restart the server, the documents are forgotten. In a massive enterprise app, this would be replaced by a real database like Supabase).
C. The Chat Route (app/api/chat/route.ts)
Goal: Find the answer and talk to the AI.

When you type a question in the chat, it arrives here. This is the magic RAG pipeline:

The Search: It takes your question and searches the Document Store for the top 5 most relevant "chunks" of text using keyword matching.
The Prompt Construction: It takes your question, the top 5 chunks, and your recent conversation history, and wraps them all in a giant prompt. It says to the AI: "You are an assistant. Here is some document context. Answer the user's question using ONLY this context."
The AI Call: It sends this giant package to Google Gemini (using the @langchain/google-genai tool).
The Reply: Gemini reads the context, generates a smart answer, and sends it back. This route then packages the answer (along with the source citations) and sends it back to the frontend to be displayed.
Summary of the Flow
TIP

1. Uploading: User uploads PDF -> DocumentUpload.tsx -> api/ingest/route.ts -> Text is extracted, chopped up, and saved in lib/document-store.ts.

2. Chatting: User asks question -> ChatInterface.tsx -> api/chat/route.ts -> Searches lib/document-store.ts for relevant text -> Sends text + question to Gemini AI -> AI answers -> Answer appears on screen.
