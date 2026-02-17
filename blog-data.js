// Centralized blog content for the static site (GitHub Pages friendly)
// Add new posts here.

window.__BLOG_POSTS__ = [
    {
        slug: 'virtual-scroll-carousel-deep-dive',
        title: 'Virtual Scroll for Multiple Media Images in Carousel (Deep Dive)',
        excerpt:
            'When we use a carousel with 50–100 images, the biggest mistake we make is: we render everything. Even though the user sees only one slide. That\'s wasted DOM, wasted memory, and unnecessary image downloads. Here\'s how to implement virtual scroll properly.',
        date: 'Feb 17, 2026',
        readTime: '10 min read',
        category: 'Performance',
        tags: ['Performance', 'Carousel', 'Virtual Scroll', 'Vue'],
        heroKicker: ['Performance', 'Carousel', 'Virtual Scroll'],
        author: {
            name: 'Avudaiappan S',
            role: 'Senior Frontend Developer'
        },
        link: 'article-virtual-scroll-carousel.html',
        content: {
            intro:
                'When we use a carousel with 50–100 images (or image + video mix), the biggest mistake we make is: we render everything. Even though the user sees only one slide. That\'s wasted DOM, wasted memory, and unnecessary image downloads. Let\'s actually implement virtual scroll properly.',
            sections: [
                {
                    heading: 'The Problem: Rendering Everything',
                    paragraphs: [
                        'Most carousel implementations render all slides into the DOM upfront. With 50–100 media items, that means dozens of unused DOM nodes consuming memory, images downloading in the background even if never viewed, re-render costs multiplied across every layout cycle, and mobile performance suffering under structural weight.',
                        'The user sees one slide. Why should the browser pay the cost of a hundred?'
                    ]
                },
                {
                    quote: 'Instead of just saying "use virtual scroll", let\'s actually implement it properly — step by step.'
                },
                {
                    heading: 'Core Idea',
                    paragraphs: [
                        'We maintain a currentIndex, a buffer size, and dynamically calculate the visible range. We translate the container instead of re-rendering the full list, and preload next/prev slides safely.'
                    ]
                },
                {
                    heading: 'Step 1 – Basic Structure',
                    paragraphs: [
                        'Assume we have 100 slides and the user is looking at the first one. Instead of rendering all slides, we compute only the required slides.'
                    ],
                    code: {
                        language: 'js',
                        fileName: 'setup.js',
                        value: 'const slides = ref([...]) // 100 images\nconst currentIndex = ref(0)\nconst buffer = 2'
                    }
                },
                {
                    heading: 'Step 2 – Calculate Visible Window Properly',
                    paragraphs: [
                        'Instead of filter (which still loops the full array), use slice. Much more efficient. Now we\'re not looping the entire 100 items every time. We slice only the needed part.'
                    ],
                    code: {
                        language: 'js',
                        fileName: 'visibleWindow.js',
                        value: 'const startIndex = computed(() => {\n  return Math.max(currentIndex.value - buffer, 0)\n})\n\nconst endIndex = computed(() => {\n  return Math.min(\n    currentIndex.value + buffer + 1,\n    slides.value.length\n  )\n})\n\nconst visibleSlides = computed(() => {\n  return slides.value.slice(\n    startIndex.value,\n    endIndex.value\n  )\n})'
                    }
                },
                {
                    heading: 'Step 3 – Offset Positioning (Important)',
                    paragraphs: [
                        'If we render only a subset, the layout breaks. We need to shift the container properly using transform. Only 3–5 slides exist in the DOM, position stays accurate, and animation remains smooth.'
                    ],
                    code: {
                        language: 'vue',
                        fileName: 'CarouselTrack.vue',
                        value: '<div class="carousel-wrapper">\n  <div\n    class="carousel-track"\n    :style="{\n      transform: `translateX(-${offset}px)`\n    }"\n  >\n    <div\n      v-for="(slide, index) in visibleSlides"\n      :key="slide.id"\n      class="slide"\n      :style="{ width: slideWidth + \'px\' }"\n    >\n      <img\n        :src="slide.url"\n        loading="lazy"\n        decoding="async"\n      />\n    </div>\n  </div>\n</div>'
                    }
                },
                {
                    heading: 'Step 4 – Handle Swipe / Navigation',
                    paragraphs: [
                        'Because the visible window auto-recalculates, the DOM automatically updates. No manual re-render needed.'
                    ],
                    code: {
                        language: 'js',
                        fileName: 'navigation.js',
                        value: 'function next() {\n  if (currentIndex.value < slides.value.length - 1) {\n    currentIndex.value++\n  }\n}\n\nfunction prev() {\n  if (currentIndex.value > 0) {\n    currentIndex.value--\n  }\n}'
                    }
                },
                {
                    heading: 'Step 5 – Preload Adjacent Images (Smart Optimization)',
                    paragraphs: [
                        'Sometimes when the user swipes fast, the next image loads late. We can manually preload the next slide to ensure smooth UX.'
                    ],
                    code: {
                        language: 'js',
                        fileName: 'preload.js',
                        value: 'watch(currentIndex, (newIndex) => {\n  const nextSlide = slides.value[newIndex + 1]\n  if (nextSlide) {\n    const img = new Image()\n    img.src = nextSlide.url\n  }\n})'
                    }
                },
                {
                    heading: 'Step 6 – Handling Mixed Media (Image + Video)',
                    paragraphs: [
                        'If slides contain a mix of images and videos, render conditionally. Important: never preload a full video, use preload="metadata", otherwise memory explodes.'
                    ],
                    code: {
                        language: 'vue',
                        fileName: 'MixedMediaSlide.vue',
                        value: '<div v-for="slide in visibleSlides" :key="slide.id">\n  <img\n    v-if="slide.type === \'image\'"\n    :src="slide.url"\n    loading="lazy"\n  />\n\n  <video\n    v-else\n    :src="slide.url"\n    preload="metadata"\n    controls\n  />\n</div>'
                    }
                },
                {
                    heading: 'Step 7 – Avoid Layout Shift',
                    paragraphs: [
                        'Always set explicit dimensions to prevent CLS (Cumulative Layout Shift) issues. Without this, virtualization won\'t save you from CLS issues.'
                    ],
                    code: {
                        language: 'css',
                        fileName: 'carousel.css',
                        value: '.slide {\n  aspect-ratio: 16 / 9;\n  flex-shrink: 0;\n}'
                    }
                },
                {
                    heading: 'Why This Is Better Than Just Lazy Loading',
                    paragraphs: [
                        'Lazy loading only delays the network request. It does NOT reduce DOM nodes, memory footprint, or re-render cost.',
                        'Virtualization reduces structural cost. Lazy loading reduces network cost. Both together = a scalable solution.'
                    ]
                },
                {
                    heading: 'Real-World Scenario',
                    paragraphs: [
                        'If we build product galleries, large portal media sections, CMS article galleries, or 100+ image dataset viewers — virtual scroll becomes mandatory. Especially when multiple carousels exist on the same page. Otherwise mobile performance will suffer.'
                    ]
                },
                {
                    heading: 'Advanced Improvement – Responsive + Virtualized',
                    paragraphs: [
                        'Instead of a fixed slideWidth, use ResizeObserver to detect container width dynamically. Then calculate slideWidth reactively. That makes your carousel responsive and virtualized — the best of both worlds.'
                    ],
                    code: {
                        language: 'js',
                        fileName: 'responsive.js',
                        value: 'const containerRef = ref(null)\nconst slideWidth = ref(400)\n\nonMounted(() => {\n  const observer = new ResizeObserver((entries) => {\n    for (const entry of entries) {\n      slideWidth.value = entry.contentRect.width\n    }\n  })\n  if (containerRef.value) {\n    observer.observe(containerRef.value)\n  }\n})'
                    }
                },
                {
                    heading: 'Final Thought',
                    paragraphs: [
                        'A carousel is not just UI. It\'s memory management. If we control what we render, we control performance. That\'s proper frontend engineering.'
                    ]
                }
            ]
        }
    },
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
