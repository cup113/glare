<script lang="ts">
    import { marked } from "marked";
    import { Quote, Trash2, Gavel, Copy, Check, X, Plus } from "lucide-svelte";

    // --- Types ---
    type AIModel = {
        id: number;
        name: string;
        content: string;
        isEditing: boolean;
        color: string;
    };

    type AIQuote = {
        modelName: string;
        text: string;
        modelColor: string;
    };

    // --- Color Palette for Model Identity ---
    const MODEL_COLORS = [
        "bg-blue-100 text-blue-700 border-blue-200",
        "bg-purple-100 text-purple-700 border-purple-200",
        "bg-emerald-100 text-emerald-700 border-emerald-200",
        "bg-orange-100 text-orange-700 border-orange-200",
    ];

    const getColorForIndex = (index: number): string => {
        return MODEL_COLORS[index % MODEL_COLORS.length];
    };

    // --- State (Runes) ---
    let models = $state<AIModel[]>([
        { id: 1, name: "Model A", content: "", isEditing: true, color: getColorForIndex(0) },
        { id: 2, name: "Model B", content: "", isEditing: true, color: getColorForIndex(1) },
    ]);

    let quotes = $state<AIQuote[]>([]);
    let arbitration = $state({ isOpen: false, userNote: "" });
    let selectionCoords = $state({
        x: 0,
        y: 0,
        active: false,
        currentText: "",
        currentModelId: null as number | null,
    });

    // Copy feedback state
    let copyFeedback = $state({ isCopied: false, timestamp: 0 });

    // --- Persistence Effects ---
    $effect(() => {
        const saved = localStorage.getItem("glare-state");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.models) models = parsed.models;
                if (parsed.quotes) quotes = parsed.quotes;
            } catch (e) {
                console.warn("Failed to load saved state", e);
            }
        }
    });

    $effect(() => {
        const state = { models, quotes };
        localStorage.setItem("glare-state", JSON.stringify(state));
    });

    // --- Derived (Runes) ---
    let arbitrationPrompt = $derived.by(() => {
        let prompt = '';
        if (arbitration.userNote) {
            prompt += `<user_instructions>\n      ${arbitration.userNote}\n</user_instructions>\n`;
        }
        prompt += `<evidence>\n`;
        quotes.forEach((q) => {
            prompt += `  <quote model="${q.modelName}">\n    ${q.text}\n  </quote>\n`;
        });
        prompt += `</evidence>\n\n`;
        prompt += `<task>\n  Please analyze the quotes above based on the user instructions and determine which model is more accurate/helpful. Provide reasoning for your decision.\n</task>\n`;
        return prompt;
    });

    // --- Methods ---
    function addModel() {
        if (models.length < 4) {
            models.push({
                id: Date.now(),
                name: `Model ${String.fromCharCode(65 + models.length)}`,
                content: "",
                isEditing: true,
                color: getColorForIndex(models.length),
            });
        }
    }

    function handleMouseUp(modelId: number) {
        const selection = window.getSelection();
        if (!selection) return;

        const text = selection.toString().trim();
        if (text) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            selectionCoords = {
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY - 40,
                active: true,
                currentText: text,
                currentModelId: modelId,
            };
        } else {
            selectionCoords.active = false;
        }
    }

    function addQuote() {
        const model = models.find((m) => m.id === selectionCoords.currentModelId);
        quotes.push({
            modelName: model?.name ?? "Unknown",
            text: selectionCoords.currentText,
            modelColor: model?.color ?? MODEL_COLORS[0],
        });
        selectionCoords.active = false;
        window.getSelection()?.removeAllRanges();
    }

    function removeQuote(index: number) {
        quotes.splice(index, 1);
    }

    async function copyPrompt() {
        await navigator.clipboard.writeText(arbitrationPrompt);
        copyFeedback.isCopied = true;
        copyFeedback.timestamp = Date.now();
        setTimeout(() => {
            copyFeedback.isCopied = false;
        }, 2000);
    }

    function clearAll() {
        if (confirm("Clear all models and quotes? This cannot be undone.")) {
            models = [
                { id: 1, name: "Model A", content: "", isEditing: true, color: getColorForIndex(0) },
                { id: 2, name: "Model B", content: "", isEditing: true, color: getColorForIndex(1) },
            ];
            quotes = [];
            arbitration.userNote = "";
            localStorage.removeItem("glare-state");
        }
    }
</script>

<div class="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans selection:bg-yellow-200">
    <!-- Header -->
    <header class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center">
        <div class="flex items-center gap-2">
            <span class="text-2xl">⚖️</span>
            <h1 class="font-black tracking-tight text-xl uppercase italic">
                GLARE
            </h1>
        </div>
        <div class="flex gap-3">
            <button
                onclick={clearAll}
                class="p-2 hover:bg-red-50 text-red-500 rounded-full transition"
                aria-label="Clear All"
                title="Clear All"
            >
                <Trash2 size={20} />
            </button>
            {#if models.length < 4}
                <button
                    onclick={addModel}
                    class="p-2 hover:bg-zinc-100 rounded-full transition"
                    aria-label="Add Model"
                >
                    <Plus size={20} />
                </button>
            {/if}
            <button
                onclick={() => arbitration.isOpen = true}
                disabled={quotes.length === 0}
                class="bg-black text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 disabled:opacity-30 transition-all active:scale-95"
            >
                <Gavel size={16} /> Arbitrate ({quotes.length})
            </button>
        </div>
    </header>

    <!-- Main View: Horizontal Scroll -->
    <main class="flex h-[calc(100vh-73px)] overflow-x-auto snap-x snap-mandatory p-4 gap-6 scroll-smooth">
        {#each models as model (model.id)}
            <div class="snap-center shrink-0 w-[85vw] md:w-[45vw] flex flex-col bg-white border-2 border-zinc-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <!-- Card Header -->
                <div class="p-4 border-b flex justify-between items-center bg-zinc-50/50">
                    <div class="flex items-center gap-2">
                        <span class={`w-3 h-3 rounded-full ${model.color.split(' ')[0].replace('bg-', 'bg-')}`}></span>
                        <input
                            bind:value={model.name}
                            class="bg-transparent font-bold text-xs uppercase tracking-widest outline-none focus:text-blue-600"
                        />
                    </div>
                    <button
                        onclick={() => model.isEditing = !model.isEditing}
                        class="text-[10px] font-bold text-zinc-400 hover:text-black uppercase"
                    >
                        {model.isEditing ? "👀 View" : "✏️ Edit"}
                    </button>
                </div>

                <!-- Content Area -->
                <div class="flex-1 overflow-y-auto p-6">
                    {#if model.isEditing}
                        <textarea
                            bind:value={model.content}
                            placeholder="Paste Markdown here..."
                            class="w-full h-full resize-none outline-none text-sm font-mono leading-relaxed"
                        ></textarea>
                    {:else}
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                            onmouseup={() => handleMouseUp(model.id)}
                            class="prose prose-sm prose-zinc max-w-none break-words"
                        >
                            {@html marked.parse(model.content || '*No content provided*')}
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
    </main>

    <!-- Floating Selection Menu -->
    {#if selectionCoords.active}
        <div
            style="left: {selectionCoords.x}px; top: {selectionCoords.y}px;"
            class="absolute z-50 flex bg-black rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150"
        >
            <button
                onclick={addQuote}
                class="text-white px-3 py-1.5 text-xs font-bold flex items-center gap-2 hover:bg-zinc-800"
            >
                <Quote size={12} /> Quote
            </button>
        </div>
    {/if}

    <!-- Arbitration Modal -->
    {#if arbitration.isOpen}
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                onclick={() => arbitration.isOpen = false}
            ></div>
            <div class="relative bg-white w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                <div class="p-6 border-b flex justify-between items-center">
                    <h2 class="text-xl font-black italic uppercase">
                        Arbitration Request
                    </h2>
                    <button
                        onclick={() => arbitration.isOpen = false}
                        class="p-2 hover:bg-zinc-100 rounded-full"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div class="flex-1 flex overflow-hidden">
                    <!-- Left: User Notes -->
                    <div class="w-1/3 border-r p-6 flex flex-col gap-4">
                        <label class="text-[10px] font-bold uppercase text-zinc-400">Your Instructions</label>
                        <textarea
                            bind:value={arbitration.userNote}
                            placeholder="Explain why these quotes need checking..."
                            class="flex-1 w-full bg-zinc-50 rounded-xl p-4 text-sm outline-none focus:ring-2 ring-zinc-200 resize-none"
                        ></textarea>

                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold uppercase text-zinc-400">Current Quotes</label>
                            <div class="max-h-40 overflow-y-auto space-y-2">
                                {#each quotes as q, i}
                                    <div class={`text-[10px] p-2 rounded flex justify-between group border ${q.modelColor}`}>
                                        <span class="truncate pr-2"><strong>{q.modelName}:</strong> {q.text}</span>
                                        <button
                                            onclick={() => removeQuote(i)}
                                            class="opacity-0 group-hover:opacity-100 text-red-500"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>

                    <!-- Right: Generated Prompt -->
                    <div class="w-2/3 p-6 bg-zinc-50 flex flex-col relative">
                        <label class="text-[10px] font-bold uppercase text-zinc-400 mb-4">Generated Prompt (Click to copy)</label>
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                            onclick={copyPrompt}
                            class="flex-1 bg-white border border-zinc-200 rounded-xl p-6 font-mono text-sm overflow-y-auto cursor-pointer hover:border-zinc-400 transition-colors group"
                        >
                            <div class="absolute top-8 right-8 transition-colors" class:text-zinc-300={!copyFeedback.isCopied} class:text-green-500={copyFeedback.isCopied}>
                                {#if copyFeedback.isCopied}
                                    <Check size={20} />
                                {:else}
                                    <Copy size={20} />
                                {/if}
                            </div>
                            <pre class="whitespace-pre-wrap">{arbitrationPrompt}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Custom Scrollbar for the horizontal experience */
    :global(::-webkit-scrollbar) {
        height: 6px;
        width: 6px;
    }
    :global(::-webkit-scrollbar-track) {
        background: transparent;
    }
    :global(::-webkit-scrollbar-thumb) {
        background: #e4e4e7;
        border-radius: 10px;
    }
    :global(::-webkit-scrollbar-thumb:hover) {
        background: #d4d4d8;
    }

    /* Prose Typography Overrides for better markdown rendering */
    :global(.prose) {
        color: #18181b;
    }
    :global(.prose h1),
    :global(.prose h2),
    :global(.prose h3) {
        color: #18181b;
        font-weight: 700;
    }
    :global(.prose code) {
        background: #f4f4f5;
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-size: 0.875em;
    }
    :global(.prose pre) {
        background: #27272a;
        color: #f4f4f5;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
    }
    :global(.prose pre code) {
        background: transparent;
        padding: 0;
        color: inherit;
    }
    :global(.prose blockquote) {
        border-left-color: #27272a;
        color: #52525b;
    }
    :global(.prose a) {
        color: #2563eb;
        text-decoration: underline;
    }
</style>
