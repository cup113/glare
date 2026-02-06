<script setup lang="ts">
import { ref, computed } from "vue";
import { marked } from "marked";
import { Quote, Trash2, Gavel, Copy, X, Plus } from "lucide-vue-next";

// --- State ---
const models = ref([
    { id: 1, name: "Model A", content: "", isEditing: true },
    { id: 2, name: "Model B", content: "", isEditing: true },
]);
const quotes = ref<
    {
        modelName: string;
        text: string;
    }[]
>([]);
const arbitration = ref({ isOpen: false, userNote: "" });
const selectionCoords = ref({
    x: 0,
    y: 0,
    active: false,
    currentText: "",
    currentModelId: null as number | null,
});

// --- Methods ---
const addModel = () => {
    if (models.value.length < 4) {
        models.value.push({
            id: Date.now(),
            name: `Model ${String.fromCharCode(65 + models.value.length)}`,
            content: "",
            isEditing: true,
        });
    }
};

const handleMouseUp = (modelId: number) => {
    const selection = window.getSelection();
    if (!selection) return;
    const text = selection.toString().trim();
    if (text) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        selectionCoords.value = {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY - 40,
            active: true,
            currentText: text,
            currentModelId: modelId,
        };
    } else {
        selectionCoords.value.active = false;
    }
};

const addQuote = () => {
    const model = models.value.find(
        (m) => m.id === selectionCoords.value.currentModelId,
    );
    quotes.value.push({
        modelName: model?.name ?? "Unknown",
        text: selectionCoords.value.currentText,
    });
    selectionCoords.value.active = false;
    window.getSelection()?.removeAllRanges();
};

const arbitrationPrompt = computed(() => {
    let prompt = `I am seeking an arbitration between multiple AI responses.\n\n`;
    if (arbitration.value.userNote) {
        prompt += `--- Context ---\n${arbitration.value.userNote}\n\n`;
    }
    prompt += `--- QUOTED EVIDENCE ---\n`;
    quotes.value.forEach((q) => {
        prompt += `[${q.modelName}]: "${q.text}"\n\n`;
    });
    prompt += `--- TASK ---\nPlease analyze the quotes above based on my notes and determine which model is more accurate/helpful.`;
    return prompt;
});

const copyPrompt = () => {
    navigator.clipboard.writeText(arbitrationPrompt.value);
    alert("Arbitration prompt copied! 🚀");
};
</script>

<template>
    <div
        class="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans selection:bg-yellow-200"
    >
        <!-- Header -->
        <header
            class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center"
        >
            <div class="flex items-center gap-2">
                <span class="text-2xl">⚖️</span>
                <h1 class="font-black tracking-tight text-xl uppercase italic">
                    GLARE
                </h1>
            </div>
            <div class="flex gap-3">
                <button
                    @click="addModel"
                    v-if="models.length < 4"
                    class="p-2 hover:bg-zinc-100 rounded-full transition"
                >
                    <Plus :size="20" />
                </button>
                <button
                    @click="arbitration.isOpen = true"
                    :disabled="quotes.length === 0"
                    class="bg-black text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 disabled:opacity-30 transition-all active:scale-95"
                >
                    <Gavel :size="16" /> Arbitrate ({{ quotes.length }})
                </button>
            </div>
        </header>

        <!-- Main View: Horizontal Scroll -->
        <main
            class="flex h-[calc(100vh-73px)] overflow-x-auto snap-x snap-mandatory p-4 gap-6 scroll-smooth"
        >
            <div
                v-for="model in models"
                :key="model.id"
                class="snap-center shrink-0 w-[85vw] md:w-[45vw] flex flex-col bg-white border-2 border-zinc-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
                <!-- Card Header -->
                <div
                    class="p-4 border-b flex justify-between items-center bg-zinc-50/50"
                >
                    <input
                        v-model="model.name"
                        class="bg-transparent font-bold text-xs uppercase tracking-widest outline-none focus:text-blue-600"
                    />
                    <button
                        @click="model.isEditing = !model.isEditing"
                        class="text-[10px] font-bold text-zinc-400 hover:text-black uppercase"
                    >
                        {{ model.isEditing ? "👀 View" : "✏️ Edit" }}
                    </button>
                </div>

                <!-- Content Area -->
                <div class="flex-1 overflow-y-auto p-6">
                    <textarea
                        v-if="model.isEditing"
                        v-model="model.content"
                        placeholder="Paste Markdown here..."
                        class="w-full h-full resize-none outline-none text-sm font-mono leading-relaxed"
                    ></textarea>
                    <div
                        v-else
                        @mouseup="handleMouseUp(model.id)"
                        class="markdown-body prose prose-sm prose-zinc max-w-none wrap-break-word"
                        v-html="
                            marked(model.content || '*No content provided*')
                        "
                    ></div>
                </div>
            </div>
        </main>

        <!-- Floating Selection Menu -->
        <div
            v-if="selectionCoords.active"
            :style="{
                left: `${selectionCoords.x}px`,
                top: `${selectionCoords.y}px`,
            }"
            class="absolute z-50 flex bg-black rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150"
        >
            <button
                @click="addQuote"
                class="text-white px-3 py-1.5 text-xs font-bold flex items-center gap-2 hover:bg-zinc-800"
            >
                <Quote :size="12" /> Quote
            </button>
        </div>

        <!-- Arbitration Modal -->
        <div
            v-if="arbitration.isOpen"
            class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div
                class="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                @click="arbitration.isOpen = false"
            ></div>
            <div
                class="relative bg-white w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
                <div class="p-6 border-b flex justify-between items-center">
                    <h2 class="text-xl font-black italic uppercase">
                        Arbitration Request
                    </h2>
                    <button
                        @click="arbitration.isOpen = false"
                        class="p-2 hover:bg-zinc-100 rounded-full"
                    >
                        <X :size="24" />
                    </button>
                </div>

                <div class="flex-1 flex overflow-hidden">
                    <!-- Left: User Notes -->
                    <div class="w-1/3 border-r p-6 flex flex-col gap-4">
                        <label
                            class="text-[10px] font-bold uppercase text-zinc-400"
                            >Your Instructions</label
                        >
                        <textarea
                            v-model="arbitration.userNote"
                            placeholder="Explain why these quotes need checking..."
                            class="flex-1 w-full bg-zinc-50 rounded-xl p-4 text-sm outline-none focus:ring-2 ring-zinc-200 resize-none"
                        ></textarea>

                        <div class="flex flex-col gap-2">
                            <label
                                class="text-[10px] font-bold uppercase text-zinc-400"
                                >Current Quotes</label
                            >
                            <div class="max-h-40 overflow-y-auto space-y-2">
                                <div
                                    v-for="(q, i) in quotes"
                                    :key="i"
                                    class="text-[10px] bg-zinc-100 p-2 rounded flex justify-between group"
                                >
                                    <span class="truncate pr-2"
                                        ><strong>{{ q.modelName }}:</strong>
                                        {{ q.text }}</span
                                    >
                                    <button
                                        @click="quotes.splice(i, 1)"
                                        class="opacity-0 group-hover:opacity-100 text-red-500"
                                    >
                                        <Trash2 :size="12" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Generated Prompt -->
                    <div class="w-2/3 p-6 bg-zinc-50 flex flex-col relative">
                        <label
                            class="text-[10px] font-bold uppercase text-zinc-400 mb-4"
                            >Generated Prompt (Click to copy)</label
                        >
                        <div
                            @click="copyPrompt"
                            class="flex-1 bg-white border border-zinc-200 rounded-xl p-6 font-mono text-sm overflow-y-auto cursor-pointer hover:border-zinc-400 transition-colors group"
                        >
                            <div
                                class="absolute top-8 right-8 text-zinc-300 group-hover:text-black transition-colors"
                            >
                                <Copy :size="20" />
                            </div>
                            <pre class="whitespace-pre-wrap">{{
                                arbitrationPrompt
                            }}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
/* Custom Scrollbar for the horizontal experience */
::-webkit-scrollbar {
    height: 6px;
    width: 6px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: #e4e4e7;
    border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
    background: #d4d4d8;
}
</style>
