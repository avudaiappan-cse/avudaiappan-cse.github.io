// Centralized blog content for the static site (GitHub Pages friendly)
// Add new posts here.

window.__BLOG_POSTS__ = [
    {
        slug: 'ai-in-frontend-real-product',
        title: 'How We Can Use AI in Frontend (From a Real Product Perspective)',
        excerpt:
            'AI isn’t just a backend revolution. The real magic happens when we bring intelligence to the frontend—where users see, feel, and interact with it. Here’s how AI can truly transform frontend products, with practical examples and real product thinking.',
        date: 'Feb 16, 2026',
        readTime: '7 min read',
        category: 'AI & Frontend',
        tags: ['AI', 'Frontend', 'UX', 'Product'],
        heroKicker: ['AI', 'Frontend'],
        author: {
            name: 'Avudaiappan S',
            role: 'Senior Frontend Developer'
        },
        link: 'article-ai-frontend.html',
        content: {
            intro:
                'AI isn’t just a backend revolution. The real magic happens when we bring intelligence to the frontend—where users see, feel, and interact with it. Here’s how AI can truly transform frontend products, with practical examples and real product thinking.',
            sections: [
                {
                    heading: 'Smart Personalization (Not Just Static UI)',
                    paragraphs: [
                        'Most apps still show the same UI for every user. But with AI, the frontend can:',
                        '• Show dynamic dashboards based on user behavior',
                        '• Reorder menu items based on usage frequency',
                        '• Recommend features inside the product',
                        '• Predict what the user wants to do next',
                        'Real Examples: Netflix, Amazon, Spotify, YouTube—they don’t just render UI, they render decision-based UI. As frontend engineers, we can consume ML signals and make UI adaptive. That’s real AI usage.'
                    ]
                },
                {
                    heading: 'AI Chat Assistants Inside Products',
                    paragraphs: [
                        'Instead of making users search through menus, we can add:',
                        '• Natural language search',
                        '• AI support agents',
                        '• AI copilots inside dashboards',
                        '• Smart FAQ summarization',
                        'This is especially powerful in SaaS products. Imagine inside a CRM: “Show me high-value leads from last month”—and the frontend dynamically renders filtered data. No clicking 10 filters. Just intent → response → UI update.'
                    ]
                },
                {
                    heading: 'Smarter Forms & Validation',
                    paragraphs: [
                        'Forms are boring. But AI can make them intelligent:',
                        '• Auto-suggest responses',
                        '• Auto-fill based on context',
                        '• Detect wrong entries smarter than regex',
                        '• Predict missing fields',
                        'Think about how Google auto-fills forms or Grammarly corrects writing in real time. That’s frontend intelligence powered by AI.'
                    ]
                },
                {
                    heading: 'AI for Search Experience',
                    paragraphs: [
                        'Traditional search = keyword matching. AI search = intent understanding. Instead of “refund policy 2024”, user types: “I paid twice what should I do?” Frontend sends this to an AI layer, returns exact FAQ + highlights solution, and renders a clean result. That’s not search. That’s conversation-driven UI.'
                    ]
                },
                {
                    heading: 'Predictive UI / Proactive UX',
                    paragraphs: [
                        'This is where things get interesting. Frontend can:',
                        '• Suggest actions before user asks',
                        '• Highlight risky data',
                        '• Alert anomalies',
                        '• Suggest optimizations',
                        'In trading dashboards, SaaS tools, analytics products—this becomes massive. Instead of: User → Finds problem → Fixes, we move to: AI detects → UI notifies → User decides. That shift alone changes product value.'
                    ]
                },
                {
                    heading: 'AI-Generated UI Components',
                    paragraphs: [
                        'This is still early but powerful. Imagine: User describes what they want—“Create a sales dashboard with revenue vs region chart”. Frontend uses AI to generate layout, chart config, filters, and data binding. Tools like GitHub Copilot, Vercel AI SDK, and OpenAI APIs are making this realistic. As frontend engineers, we won’t just design UI. We’ll design AI-assisted UI systems.'
                    ]
                },
                {
                    heading: 'Real Product Thinking (Not Hype)',
                    paragraphs: [
                        'Just adding a chatbot ≠ AI product. Good AI frontend integration should:',
                        '• Reduce clicks',
                        '• Reduce cognitive load',
                        '• Increase conversion',
                        '• Improve retention',
                        '• Provide faster outcomes',
                        'If it doesn’t improve metrics, it’s just decoration.'
                    ]
                },
                {
                    heading: 'Final Thought',
                    paragraphs: [
                        'Frontend used to be: Render → Event → API → Update. Now it’s becoming: Intent → Intelligence → Adaptive UI → Outcome. For people working in product companies, this is a huge opportunity. AI won’t replace frontend engineers. But frontend engineers who understand AI workflows? They’ll build the next-gen products.'
                    ]
                }
            ]
        }
    },
    {
        slug: 'handling-2gb-file-uploads-frontend',
        title: 'Handling 2GB File Uploads in a Web App (Frontend POV)',
        excerpt:
            'File upload looks simple… until it’s not. A practical frontend-first approach for 2GB files: chunking, retries, resumability, direct-to-storage, and sane previews.',
        date: 'Dec 30, 2025',
        readTime: '9 min read',
        category: 'Frontend Systems',
        tags: ['Uploads', 'Performance', 'Resumable', 'UX'],
        heroKicker: ['Frontend', 'Uploads', 'Resumable'],
        author: {
            name: 'Avudaiappan S',
            role: 'Senior Frontend Developer'
        },
        content: {
            intro:
                'For small files, almost anything works. For 2GB files, you need a different mental model: build for retries, resumes, and browser constraints from day one.',
            sections: [
                {
                    heading: 'Where most of us go wrong (initially)',
                    paragraphs: [
                        'The “classic” approach (frontend → backend → storage) often works in dev and even in production for small payloads, but it collapses under real-world conditions: slow networks, timeouts, refreshes, and mobile memory pressure.',
                        'Once files get big, your primary job isn’t to “upload the file” — it’s to keep the browser responsive and the upload resilient.'
                    ]
                },
                {
                    quote:
                        'The mental shift: stop asking “How do I upload this?” and start asking “How do I NOT break the browser while uploading this?”'
                },
                {
                    heading: 'A high-level flow that scales',
                    paragraphs: [
                        'A backend can still be involved, but not as a 2GB data pipe. Use it for permissions and coordination; send bytes directly to object storage.',
                        'The frontend slices the file, uploads each chunk with retries, and reports progress. Your server issues signed URLs (or an upload session) and tracks completion.'
                    ],
                    diagram: {
                        kind: 'mermaid',
                        title: 'Resumable upload (frontend POV)',
                        value: `sequenceDiagram
    autonumber
    participant U as User/Browser
    participant A as App Backend
    participant S as Object Storage

    U->>A: Start upload (filename, size, checksum?)
    A-->>U: Upload session + signed URL(s) / chunk policy

    loop For each chunk (5–10MB)
        U->>S: PUT chunk N (signed URL)
        alt Network error / timeout
            U->>S: Retry chunk N (backoff)
        end
    end

    U->>A: Complete upload (uploaded chunk list / final checksum)
    A->>S: Finalize/compose (if needed)
    A-->>U: Upload complete + fileId
`
                    }
                },
                {
                    heading: 'Chunking: the boring trick that fixes everything',
                    paragraphs: [
                        'Chunk sizes around 5–10MB are a sweet spot: retries stay cheap, memory stays stable, and failures don’t nuke the whole upload.',
                        'Important detail: `file.slice()` is cheap — it doesn’t read the entire file into memory.'
                    ],
                    code: {
                        language: 'js',
                        fileName: 'chunking.js',
                        value:
                            "const CHUNK_SIZE = 5 * 1024 * 1024;\n\nfunction splitFile(file) {\n  const chunks = [];\n  let offset = 0;\n\n  while (offset < file.size) {\n    chunks.push(file.slice(offset, offset + CHUNK_SIZE));\n    offset += CHUNK_SIZE;\n  }\n\n  return chunks;\n}"
                    }
                },
                {
                    heading: 'Resume is not a “nice feature”',
                    paragraphs: [
                        'If a refresh restarts from 0, users won’t trust your product. Resumability changes the emotional feel of uploads from “fragile” to “solid”.',
                        'Give every upload a `fileId` and every chunk a `chunkIndex`. Persist progress (localStorage/IndexedDB), so you can retry only what failed.'
                    ]
                },
                {
                    heading: 'Previewing large files without melting the browser',
                    paragraphs: [
                        'Avoid base64 conversions and full-file downloads for previews. Stream media, paginate PDFs, and show “head” samples for huge text/binary formats.',
                        'Trying to render a 2GB CSV fully in the browser doesn’t help anyone — show metadata, a small sample, and a download link.'
                    ]
                },
                {
                    heading: 'Real problems I hit (and what fixed them)',
                    paragraphs: [
                        'These issues show up in production only: UI freezes, flaky Wi‑Fi, users refreshing mid-upload, and previews that accidentally load everything.',
                        'Once you add chunking + retry + persisted state + streaming previews, user complaints drop fast.'
                    ]
                },
                {
                    heading: 'Tools I reach for (because shipping matters)',
                    paragraphs: [
                        'If you don’t want to reinvent all this, use proven building blocks:',
                        '• Uppy for UI\n• tus for resumable uploads\n• direct-to-storage for the heavy lifting'
                    ]
                },
                {
                    heading: 'Key takeaway',
                    paragraphs: [
                        'Handling 2GB uploads isn’t about cleverness — it’s about respecting browser limits, expecting failures, designing for resume, and keeping both frontend and backend workloads sane.'
                    ]
                }
            ]
        }
    }
];
