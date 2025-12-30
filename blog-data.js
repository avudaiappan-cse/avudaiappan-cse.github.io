// Centralized blog content for the static site (GitHub Pages friendly)
// Add new posts here.

window.__BLOG_POSTS__ = [
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
