import { createFileRoute } from "@tanstack/react-router";
import {
  CodeBlock,
  DocPage,
  FnName,
  H2,
  H3,
  IC,
  P,
  PropTable,
  type TocSection,
} from "../../components/docs/Doc";

export const Route = createFileRoute("/docs/")({
  component: SdkDocsPage,
});

const toc: TocSection[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    children: [
      { id: "installation", label: "Installation" },
      { id: "quick-start", label: "Quick Start" },
    ],
  },
  {
    id: "core-concepts",
    label: "Core Concepts",
    children: [
      { id: "concept-rema", label: "The Rema class" },
      { id: "concept-workflows", label: "Workflows" },
      { id: "concept-nodes", label: "Nodes" },
      { id: "concept-subscriptions", label: "Subscriptions" },
      { id: "concept-gate", label: "Activation Gates" },
    ],
  },
  {
    id: "input-nodes",
    label: "Input Nodes",
    children: [
      { id: "input-file", label: "file()" },
      { id: "input-rtmp-reader", label: "rtmpReader()" },
      { id: "input-rtmp-announcer", label: "rtmpAnnouncer()" },
      { id: "input-rtmp-multiplexer", label: "rtmpMultiplexer()" },
      { id: "input-srt-reader", label: "srtReader()" },
      { id: "input-srt-announcer", label: "srtAnnouncer()" },
      { id: "input-stream-input", label: "streamInput()" },
      { id: "input-captions", label: "captions()" },
    ],
  },
  {
    id: "output-nodes",
    label: "Output Nodes",
    children: [
      { id: "output-rtmp", label: "rtmp()" },
      { id: "output-srt", label: "srt()" },
      { id: "output-file", label: "file()" },
      { id: "output-hls", label: "hls()" },
    ],
  },
  {
    id: "processor-nodes",
    label: "Processor Nodes",
    children: [
      { id: "processor-cea608", label: "cea608()" },
      { id: "processor-ffprobe", label: "ffprobeMonitor()" },
      { id: "processor-gemini-translate", label: "geminiTranslate()" },
    ],
  },
  {
    id: "examples",
    label: "Examples",
    children: [
      { id: "example-rtmp-relay", label: "RTMP relay" },
      { id: "example-file-to-rtmp", label: "File to RTMP" },
      { id: "example-live-captions", label: "Live captions" },
      { id: "example-scheduled-captions", label: "Scheduled captions" },
      { id: "example-hls-s3", label: "HLS to S3" },
    ],
  },
];

function SdkDocsPage() {
  return (
    <DocPage
      eyebrow="SDK GUIDE"
      title="Build pipelines with the SDK"
      intro={
        <>
          Compose realtime media pipelines in TypeScript with{" "}
          <IC>@remavideo/sdk</IC>. Create nodes, wire streams together, inject
          broadcast-grade captions — all from code.
        </>
      }
      toc={toc}
    >
      {/* ── Getting Started ─────────────────────────────────────────────── */}
      <H2 id="getting-started">Getting Started</H2>

      <H3 id="installation">Installation</H3>
      <P>
        Install the SDK as a dependency in your Node.js project. The rema server
        must be running separately — the SDK only connects to it.
      </P>
      <CodeBlock
        language="bash"
        code={`npm install @remavideo/sdk
# or
pnpm add @remavideo/sdk`}
      />

      <H3 id="quick-start">Quick Start</H3>
      <P>
        This example accepts a single RTMP stream on the server and re-pushes it
        to a destination URL. It demonstrates the full lifecycle: connect,
        create a workflow, create nodes, subscribe, then clean up on exit.
      </P>
      <CodeBlock
        filename="rtmp-relay.ts"
        code={`import { Rema, selectAll } from "@remavideo/sdk";

const rema = await Rema.connect({ host: "localhost", port: 8080 });
const wf = await rema.workflow.create({ name: "rtmp-relay" });

// Accept an RTMP publisher at rtmp://server/live/stream
const input = await wf.input.rtmpReader({
  app: "live",
  sourceName: "stream",
  onPublish: () => console.log("publisher connected"),
});

// Re-push to a destination
const output = await wf.output.rtmp({ url: "rtmp://live.example.com/app/key" });
await output.subscribe([{ source: input, sourceSelector: selectAll }]);

// Clean up on exit
const shutdown = async () => {
  await wf.close();
  await rema.close();
  process.exit(0);
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);`}
      />

      {/* ── Core Concepts ───────────────────────────────────────────────── */}
      <H2 id="core-concepts">Core Concepts</H2>

      <H3 id="concept-rema">The Rema class</H3>
      <P>
        <IC>Rema</IC> is the entry point. Call <IC>Rema.connect()</IC> to
        establish a WebSocket connection to the server. It returns a{" "}
        <IC>Rema</IC> handle you use to create workflows.
      </P>
      <CodeBlock
        code={`import { Rema } from "@remavideo/sdk";

const rema = await Rema.connect({
  host: "localhost",   // default: "127.0.0.1"
  port: 8080,          // default: 8080
  onReady: () => console.log("connected"),
  onFailedToConnect: () => { console.error("connection failed"); process.exit(1); },
});

// ...later
await rema.close();`}
      />
      <PropTable
        props={[
          {
            name: "host",
            type: "string",
            default: '"127.0.0.1"',
            description: "Hostname or IP of the rema server.",
          },
          {
            name: "port",
            type: "number",
            default: "8080",
            description: "Port the rema server listens on.",
          },
          {
            name: "onReady",
            type: "() => void",
            description: "Called once the WebSocket connection is established.",
          },
          {
            name: "onFailedToConnect",
            type: "() => void",
            description: "Called when the initial ping to the server fails.",
          },
        ]}
      />

      <H3 id="concept-workflows">Workflows</H3>
      <P>
        A workflow is an isolated namespace on the server. Nodes in one workflow
        cannot subscribe to nodes in another. Each SDK client typically creates
        one or more workflows for its pipelines.
      </P>
      <CodeBlock
        code={`const wf = await rema.workflow.create({
  name: "my-pipeline",          // shown in the web UI
  closeOnDisconnect: true,      // auto-close when rema.close() is called
});

// List all active workflows on the server
const all = await rema.workflow.list();

// Close the workflow and all its nodes
await wf.close();`}
      />
      <PropTable
        props={[
          {
            name: "name",
            type: "string",
            description: "Human-readable label shown in the web UI.",
          },
          {
            name: "workflowId",
            type: "string",
            description: "Stable ID. Auto-generated if omitted.",
          },
          {
            name: "closeOnDisconnect",
            type: "boolean",
            default: "false",
            description:
              "When true, this workflow is closed when rema.close() is called.",
          },
          {
            name: "parentId",
            type: "string",
            description:
              "ID of an existing workflow to nest under in the web UI.",
          },
          {
            name: "closeWithParent",
            type: "boolean",
            default: "false",
            description: "Auto-close when the parent workflow is closed.",
          },
        ]}
      />

      <H3 id="concept-nodes">Nodes</H3>
      <P>
        Nodes are the building blocks of a pipeline. There are three categories
        — input, output, and processor — all created through the workflow
        handle:
      </P>
      <CodeBlock
        code={`// Input nodes — produce media streams
const fileIn   = await wf.input.file({ fileName: "/data/video.mp4" });
const rtmpIn   = await wf.input.rtmpReader({ app: "live", sourceName: "key" });
const captions = await wf.input.captions();

// Output nodes — consume media streams
const rtmpOut  = await wf.output.rtmp({ url: "rtmp://..." });
const fileOut  = await wf.output.file({ fileName: "/tmp/out.mp4" });
const hlsOut   = await wf.output.hls({ destinations: [...] });

// Processor nodes — transform or analyse streams
const encoder  = await wf.processor.cea608();
const probe    = await wf.processor.ffprobeMonitor();

// Every node can be closed individually
await rtmpIn.close();`}
      />

      <H3 id="concept-subscriptions">Subscriptions &amp; selectors</H3>
      <P>
        Wiring nodes together is done with <IC>node.subscribe()</IC>. You pass
        an array of source specifications, each with a source node and a
        selector that picks which streams to route.
      </P>
      <CodeBlock
        code={`import { selectAll, selectVideo, selectAudio, selectCaptions } from "@remavideo/sdk";

// Wire a single source — copy all streams
await output.subscribe([{ source: input, sourceSelector: selectAll }]);

// Split video and audio from the same source
await output.subscribe([
  { source: input, sourceSelector: selectVideo },
  { source: input, sourceSelector: selectAudio },
]);

// Fan-in: video from one source, captions from another
await encoder.subscribe([
  { source: videoInput, sourceSelector: selectAll },
  { source: captionSource, sourceSelector: selectCaptions },
]);`}
      />
      <P>
        Selectors are plain strings: <IC>selectAll</IC> is <IC>"ALL"</IC>,{" "}
        <IC>selectVideo</IC> is <IC>"VIDEO"</IC>, etc. Use the named exports for
        type safety.
      </P>
      <P>
        Beyond routing, each subscription owns its per-stream behaviour: delay,
        codec, and rendition metadata. The available fields depend on the
        selector — the SDK types are discriminated on <IC>sourceSelector</IC>,
        so e.g. <IC>audio</IC> metadata only type-checks on <IC>"AUDIO"</IC>/
        <IC>"ALL"</IC> subscriptions.
      </P>
      <PropTable
        props={[
          {
            name: "delayMs",
            type: "number (all selectors)",
            description:
              "Delay this stream by N milliseconds before it reaches the subscribing node (applied server-side). Typical use: delay the A/V subscriptions of a node so a slower caption source has lead time — captions sent during the window are already queued when the first frame arrives.",
          },
          {
            name: "codec",
            type: "{ name: string, options?: Record<string, string | number> } (VIDEO and AUDIO)",
            description:
              'FFmpeg codec applied to this stream by the receiving output node (e.g. -c:a:1 aac -b:a:1 128k for an HLS rendition). Options are bare FFmpeg option names — "preset", "b", "g" — never stream-specified ("b:v"). Omitted = stream copy.',
          },
          {
            name: "videoCodec / audioCodec",
            type: "CodecSpec (ALL only)",
            description:
              "Same as codec, but addressing the video and audio track of a combined A/V subscription separately.",
          },
          {
            name: "audio",
            type: "{ language?, label?, defaultTrack? } (AUDIO and ALL)",
            description:
              'Audio rendition metadata for HLS master playlists: BCP-47 language tag (default "und"), label shown in player track menus (default "Audio"), and whether the track is pre-selected (default false). Ignored by non-HLS outputs.',
          },
          {
            name: "video",
            type: "{ label? } (VIDEO and ALL)",
            description:
              "Video rendition metadata for HLS outputs: the label is sanitized into the variant name used for playlist and segment filenames (multi-rendition HLS). Ignored by non-HLS outputs.",
          },
        ]}
      />
      <CodeBlock
        code={`import { selectVideo, selectAudio, selectCaptions } from "@remavideo/sdk";

await hlsOut.subscribe([
  {
    source: cam,
    sourceSelector: selectVideo,
    delayMs: 5000, // give captions 5 s of lead time
    codec: { name: "libx264", options: { preset: "veryfast", b: "3M" } },
    video: { label: "Main" },
  },
  {
    source: cam,
    sourceSelector: selectAudio,
    delayMs: 5000, // keep every media subscription equally delayed
    audio: { language: "en", label: "English", defaultTrack: true },
  },
  // Captions stay undelayed so they are queued before the first segment.
  { source: captions, sourceSelector: selectCaptions },
]);`}
      />
      <P>
        Codec precedence on HLS outputs: per-subscription <IC>codec</IC> beats
        the node-level <IC>audioCodec</IC>/<IC>videoCodec</IC> fallback, which
        beats the built-in default (stream copy; or AAC when several audio
        renditions are connected, since hls.js requires all alternate-audio
        renditions to share one codec).
      </P>

      <H3 id="concept-gate">Activation Gates</H3>
      <P>
        By default, <IC>node.subscribe()</IC> connects the node immediately. An{" "}
        <em>activation gate</em> defers that connection until a specific
        condition on the subscribed sources is met. Pass a gate as the second
        argument to <IC>subscribe()</IC>:
      </P>
      <CodeBlock
        code={`import { selectAll } from "@remavideo/sdk";

await output.subscribe(
  [{ source: input, sourceSelector: selectAll }],
  { gate: { type: "all_stream_active" } },
);`}
      />
      <P>
        While the gate condition is pending the subscription edge is registered
        and visible in the web UI, but the node does not start processing. As
        soon as the condition becomes true the server connects the node
        automatically — no client round-trip needed.
      </P>
      <P>There are two gate types:</P>
      <PropTable
        props={[
          {
            name: "all_stream_active",
            type: '{ type: "all_stream_active" }',
            description:
              "Wait until every subscribed source is in the ACTIVE state. Useful when a node requires all inputs to be live before it makes sense to start (e.g. a fan-in encoder that needs both video and captions).",
          },
          {
            name: "min_active_by_selector",
            type: '{ type: "min_active_by_selector", selector: StreamSelector, count: number }',
            description:
              "Wait until at least count sources matching selector are ACTIVE. Useful when you subscribe many optional sources but only need a minimum number live before starting.",
          },
        ]}
      />
      <CodeBlock
        code={`import { selectAll, selectVideo } from "@remavideo/sdk";

// Connect only after ALL sources are streaming
await encoder.subscribe(
  [
    { source: videoInput,   sourceSelector: selectAll },
    { source: captionSource, sourceSelector: selectCaptions },
  ],
  { gate: { type: "all_stream_active" } },
);

// Connect once at least 2 video sources are active
await mixer.subscribe(
  [
    { source: cam1, sourceSelector: selectVideo },
    { source: cam2, sourceSelector: selectVideo },
    { source: cam3, sourceSelector: selectVideo },
  ],
  { gate: { type: "min_active_by_selector", selector: "VIDEO", count: 2 } },
);`}
      />
      <P>
        If the gate condition is already satisfied when <IC>subscribe()</IC> is
        called (e.g. sources are already live), the node connects immediately —
        the gate is a no-op in that case. If the node is closed before the gate
        ever passes, the pending subscription is cleaned up automatically.
      </P>

      {/* ── Input Nodes ─────────────────────────────────────────────────── */}
      <H2 id="input-nodes">Input Nodes</H2>

      <H3 id="input-file">
        <FnName>wf.input.file()</FnName> — FileInputNode
      </H3>
      <P>
        Reads a local media file (MP4, TS, MKV, …) and streams it downstream.
        Supports looping and optional delayed start via <IC>disabled</IC>.
      </P>
      <PropTable
        props={[
          {
            name: "fileName",
            type: "string",
            required: true,
            description: "Absolute path to the media file.",
          },
          {
            name: "loop",
            type: "boolean",
            default: "false",
            description: "Loop the file indefinitely.",
          },
          {
            name: "sourceName",
            type: "string",
            description: "Label used to identify this source's streams.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Start paused; call .enable() to begin streaming.",
          },
          {
            name: "onReady",
            type: "() => void",
            description: "Called when the node transitions to the ready state.",
          },
          {
            name: "onStreamStart",
            type: "(wallClockMs: number) => void",
            description:
              "Called when the first data packet arrives. The wallClockMs is the server's Date.now() at that moment — use it to convert absolute caption timestamps to stream-relative offsets.",
          },
          {
            name: "onEnded",
            type: "() => void",
            description:
              "Called once the file finishes playing (reaches EOF). Never fires when loop is true.",
          },
        ]}
      />
      <CodeBlock
        code={`const input = await wf.input.file({
  fileName: "/data/video.mp4",
  loop: true,
  disabled: true,           // start paused
  onStreamStart(wallClockMs) {
    // schedule captions relative to this timestamp
    const offset = myAbsoluteMs - wallClockMs;
    captions.send("Hello", { startAt: offset, duration: 4000 });
  },
});

await input.enable();       // start streaming`}
      />

      <H3 id="input-rtmp-reader">
        <FnName>wf.input.rtmpReader()</FnName> — RtmpReaderNode
      </H3>
      <P>
        Waits for a single RTMP publisher to connect at a given <IC>app</IC> /{" "}
        <IC>sourceName</IC> (stream key). Fires <IC>onPublish</IC> when the
        stream goes live.
      </P>
      <PropTable
        props={[
          {
            name: "app",
            type: "string",
            required: true,
            description: 'RTMP app name, e.g. "live".',
          },
          {
            name: "sourceName",
            type: "string",
            required: true,
            description: "Stream key (source name).",
          },
          {
            name: "onPublish",
            type: "(info) => void",
            description: "Called when an RTMP publisher connects.",
          },
          {
            name: "onStreamStart",
            type: "(wallClockMs: number) => void",
            description:
              "Called when the first MPEG-TS data packet arrives at the server.",
          },
          {
            name: "onStreamEnded",
            type: "() => void",
            description:
              "Called when the publisher disconnects (the underlying FFmpeg pull exits).",
          },
        ]}
      />
      <CodeBlock
        code={`const input = await wf.input.rtmpReader({
  app: "live",
  sourceName: "mystream",
  onPublish: ({ app, internalUrl }) => {
    console.log(\`Publisher connected on \${app}, relay URL: \${internalUrl}\`);
  },
});`}
      />

      <H3 id="input-rtmp-announcer">
        <FnName>wf.input.rtmpAnnouncer()</FnName> — RtmpAnnouncerNode
      </H3>
      <P>
        Watches for any RTMP publisher connection on an <IC>app</IC> without
        creating a stream node. Use this to react to publish events and spin up
        separate workflows or nodes dynamically.
      </P>
      <PropTable
        props={[
          {
            name: "app",
            type: "string",
            default: '"live"',
            description: "RTMP app name to watch.",
          },
          {
            name: "onConnect",
            type: "(info) => void",
            required: true,
            description: "Called when any publisher connects.",
          },
          {
            name: "onDisconnect",
            type: "(info) => void",
            description: "Called when a publisher disconnects.",
          },
        ]}
      />
      <CodeBlock
        code={`const announcer = await wf.input.rtmpAnnouncer({
  app: "live",
  onConnect({ app, sourceName }) {
    console.log(\`\${sourceName} started publishing on \${app}\`);
    // create a separate workflow / pipeline here
  },
  onDisconnect({ sourceName }) {
    console.log(\`\${sourceName} disconnected\`);
  },
});`}
      />

      <H3 id="input-rtmp-multiplexer">
        <FnName>wf.input.rtmpMultiplexer()</FnName> — RtmpMultiplexerNode
      </H3>
      <P>
        Accepts any number of simultaneous RTMP publishers under an <IC>app</IC>{" "}
        name. For each connection, <IC>onStream</IC> is called with a dedicated{" "}
        <IC>RtmpStreamNode</IC> that can be wired into its own downstream
        pipeline.
      </P>
      <PropTable
        props={[
          {
            name: "app",
            type: "string",
            default: '"live"',
            description: "RTMP app name to listen on.",
          },
          {
            name: "onConnect",
            type: "(info) => Promise<{ accept }> | { accept } | void",
            description:
              "Called when a publisher connects. Return { accept: false } to reject the connection.",
          },
          {
            name: "onStream",
            type: "(node: RtmpStreamNode) => void",
            required: true,
            description:
              "Called with a per-publisher RtmpStreamNode. Build the downstream pipeline here.",
          },
          {
            name: "onStreamEnd",
            type: "(node: RtmpStreamNode) => void",
            description:
              "Called when a publisher disconnects. Close any downstream nodes created in onStream.",
          },
        ]}
      />
      <CodeBlock
        code={`const mux = await wf.input.rtmpMultiplexer({
  app: "live",
  onConnect({ sourceName }) {
    console.log(\`\${sourceName} connecting\`);
    return { accept: true };
  },
  async onStream(rtmpIn) {
    const out = await wf.output.rtmp({ url: \`rtmp://relay/live/\${rtmpIn.sourceName}\` });
    await out.subscribe([{ source: rtmpIn, sourceSelector: selectAll }]);
    activeOutputs.set(rtmpIn.sourceName, out);
  },
  async onStreamEnd(rtmpIn) {
    const out = activeOutputs.get(rtmpIn.sourceName);
    activeOutputs.delete(rtmpIn.sourceName);
    await out?.close();
  },
});`}
      />

      <H3 id="input-srt-reader">
        <FnName>wf.input.srtReader()</FnName> — SrtReaderNode
      </H3>
      <P>
        Waits for a single SRT publisher to connect at a given <IC>app</IC> /{" "}
        <IC>sourceName</IC>, ingested by MediaMTX and pulled back into the
        pipeline over RTSP internally. Fires <IC>onPublish</IC> when the stream
        goes live.
      </P>
      <PropTable
        props={[
          {
            name: "app",
            type: "string",
            required: true,
            description: 'SRT app name, e.g. "live".',
          },
          {
            name: "sourceName",
            type: "string",
            required: true,
            description: "Stream key (source name).",
          },
          {
            name: "onPublish",
            type: "(info) => void",
            description: "Called when an SRT publisher connects.",
          },
          {
            name: "onStreamStart",
            type: "(wallClockMs: number) => void",
            description:
              "Called when the first MPEG-TS data packet arrives at the server.",
          },
          {
            name: "onStreamEnded",
            type: "() => void",
            description:
              "Called when the publisher disconnects (the underlying FFmpeg pull exits).",
          },
        ]}
      />
      <CodeBlock
        code={`const input = await wf.input.srtReader({
  app: "live",
  sourceName: "mystream",
  onPublish: ({ app, internalUrl }) => {
    console.log(\`Publisher connected on \${app}, relay URL: \${internalUrl}\`);
  },
});`}
      />
      <P>
        Push a test stream with FFmpeg:{" "}
        <IC>
          ffmpeg -re -i input.mp4 -f mpegts
          "srt://localhost:9000?streamid=publish:live/mystream"
        </IC>
        .
      </P>

      <H3 id="input-srt-announcer">
        <FnName>wf.input.srtAnnouncer()</FnName> — SrtAnnouncerNode
      </H3>
      <P>
        Watches for any SRT publisher connection on an <IC>app</IC> without
        creating a stream node. Use this to react to publish events and spin up
        separate workflows or nodes dynamically — the same role{" "}
        <IC>rtmpAnnouncer()</IC> plays for RTMP.
      </P>
      <PropTable
        props={[
          {
            name: "app",
            type: "string",
            default: '"live"',
            description: "SRT app name to watch.",
          },
          {
            name: "passphrase",
            type: "string",
            description:
              "Passphrase to include in connection events, mirroring the MediaMTX path config.",
          },
          {
            name: "latencyMs",
            type: "number",
            description:
              "SRT latency in milliseconds to include in connection events.",
          },
          {
            name: "onConnect",
            type: "(info) => void",
            required: true,
            description: "Called when any publisher connects.",
          },
          {
            name: "onDisconnect",
            type: "(info) => void",
            description: "Called when a publisher disconnects.",
          },
        ]}
      />
      <CodeBlock
        code={`const announcer = await wf.input.srtAnnouncer({
  app: "live",
  latencyMs: 200,
  onConnect({ app, sourceName }) {
    console.log(\`\${sourceName} started publishing on \${app}\`);
    // create a separate workflow / pipeline here
  },
  onDisconnect({ sourceName }) {
    console.log(\`\${sourceName} disconnected\`);
  },
});`}
      />

      <H3 id="input-stream-input">
        <FnName>wf.input.streamInput()</FnName> — NodeStreamInputNode
      </H3>
      <P>
        Pushes an in-process audio stream — any Node.js <IC>Readable</IC> or{" "}
        <IC>AsyncIterable&lt;Buffer&gt;</IC> — directly into the pipeline by
        calling <IC>.stream(source)</IC> on the returned node. Useful for TTS
        output, microphone capture, or any audio you generate in your own
        process rather than read from a file or network source.
      </P>
      <PropTable
        props={[
          {
            name: "format",
            type: "string",
            required: true,
            description:
              'FFmpeg format identifier for the incoming audio data. Raw PCM: "s16le", "f32le". Encoded: "wav", "mp3", "aac", "flac".',
          },
          {
            name: "sampleRate",
            type: "number",
            description:
              "Sample rate in Hz. Required when format is a raw PCM format.",
          },
          {
            name: "channels",
            type: "number",
            description:
              "Number of audio channels. Required when format is a raw PCM format.",
          },
          {
            name: "audioCodec",
            type: "string",
            default: '"aac"',
            description:
              'FFmpeg codec for the MPEG-TS output. Use "copy" only when the input is already MPEG-TS-compatible AAC.',
          },
          {
            name: "label",
            type: "string",
            description: "Human-readable label shown in the dashboard.",
          },
          {
            name: "onReady",
            type: "() => void",
            description: "Called when the node transitions to the ready state.",
          },
          {
            name: "onStreamStart",
            type: "(wallClockMs: number) => void",
            description:
              "Called once when the first audio packet is written to the server.",
          },
          {
            name: "onEnded",
            type: "() => void",
            description:
              "Called once the underlying FFmpeg process exits cleanly after end().",
          },
        ]}
      />
      <CodeBlock
        code={`const audioInput = await wf.input.streamInput({
  format: "s16le",
  sampleRate: 24_000,
  channels: 1,
  audioCodec: "aac",
});

// Push any AsyncIterable<Buffer> — a Readable, a PassThrough, a TTS SDK stream...
await audioInput.stream(ttsStream);

// Mix it into an output alongside a file's video track
await output.subscribe([
  { source: fileInput, sourceSelector: "VIDEO" },
  { source: audioInput, sourceSelector: "AUDIO" },
]);`}
      />

      <H3 id="input-captions">
        <FnName>wf.input.captions()</FnName> — CaptionSourceNode
      </H3>
      <P>
        A format-agnostic caption schedule. Call <IC>captions.send()</IC> to
        queue text for injection, or load an entire SRT/WebVTT file at once with{" "}
        <IC>sendFile()</IC> / <IC>sendFileByPath()</IC>. Wire this node to a{" "}
        <IC>cea608()</IC> encoder or HLS output (for WebVTT). Does not produce
        video — it is a pure caption source.
      </P>
      <PropTable
        props={[
          {
            name: "replayCount",
            type: "number",
            default: "0",
            description:
              "How many past entries to replay to an encoder that subscribes later. Use Infinity when pre-scheduling all captions upfront.",
          },
          {
            name: "language",
            type: "string",
            default: '"und"',
            description: "BCP-47 language tag for HLS subtitle tracks.",
          },
          {
            name: "label",
            type: "string",
            default: '"Subtitles"',
            description: "Track label shown in player subtitle menus.",
          },
          {
            name: "defaultTrack",
            type: "boolean",
            default: "true",
            description: "Pre-select this track when the player loads.",
          },
          {
            name: "maxLineLength",
            type: "number",
            description:
              "Maximum characters per caption line. Longer captions are split into sequential chunks on the server, each chunk's duration proportional to its share of the original text.",
          },
        ]}
      />
      <CodeBlock
        code={`const captions = await wf.input.captions();

// Send immediately (next frame) — stays until the next caption replaces it
await captions.send("Live caption text", { duration: 4000 });

// Send with a longer duration
await captions.send("Timed caption", { duration: 8000 });

// Schedule at a stream-relative offset (ms from first video frame)
await captions.send("Scheduled text", { startAt: 5000, duration: 3000 });

// Load an entire SRT/WebVTT file's entries at once
const { count } = await captions.sendFileByPath("/data/captions.en.srt");
console.log(\`scheduled \${count} entries\`);`}
      />

      {/* ── Output Nodes ────────────────────────────────────────────────── */}
      <H2 id="output-nodes">Output Nodes</H2>

      <H3 id="output-rtmp">
        <FnName>wf.output.rtmp()</FnName> — RtmpOutputNode
      </H3>
      <P>
        Pushes the subscribed streams to an RTMP destination URL using FFmpeg.
        To hold back output (e.g. so time-locked captions are injected before
        delivery), set <IC>delayMs</IC> on the subscription.
      </P>
      <P>
        You can subscribe to multiple sources at once: the first subscription
        with a <IC>VIDEO</IC> or <IC>ALL</IC> selector provides the video track,
        and the first with an <IC>AUDIO</IC> or <IC>ALL</IC> selector provides
        the audio track (the same subscription can provide both via <IC>ALL</IC>
        ). Any <IC>CAPTIONS</IC> subscriptions are ignored. Since the video
        track is stream-copied, CEA-608/708 captions injected into it (e.g. by{" "}
        <IC>Cea608EncoderNode</IC>) pass through unchanged.
      </P>
      <PropTable
        props={[
          {
            name: "url",
            type: "string",
            required: true,
            description:
              'Full RTMP URL, e.g. "rtmp://live.twitch.tv/app/stream-key".',
          },
          {
            name: "onError",
            type: "(err: Error) => void",
            description:
              "Called when the FFmpeg output process exits with an error after the node is created.",
          },
        ]}
      />
      <CodeBlock
        code={`const output = await wf.output.rtmp({
  url: "rtmp://live.twitch.tv/app/YOUR_STREAM_KEY",
  onError: (err) => console.error("RTMP output error:", err.message),
});
await output.subscribe([{ source: encoder, sourceSelector: selectAll }]);`}
      />

      <H3 id="output-srt">
        <FnName>wf.output.srt()</FnName> — SrtOutputNode
      </H3>
      <P>
        Pushes the subscribed streams to an SRT destination URL as MPEG-TS using
        FFmpeg. Transport parameters (latency, passphrase, stream ID,
        caller/listener mode) are passed as query params on the URL itself.
      </P>
      <P>
        Like <IC>file()</IC>, it accepts multiple subscriptions at once: each
        subscription's tracks are mapped into the output independently (
        <IC>VIDEO</IC> maps its video track, <IC>AUDIO</IC> maps its audio
        track, and <IC>ALL</IC> maps both) — so you can combine a video source
        with one or more separate audio sources in a single SRT stream.
      </P>
      <PropTable
        props={[
          {
            name: "url",
            type: "string",
            required: true,
            description:
              'Full SRT URL, e.g. "srt://host:port?streamid=publish:live/key&mode=caller&latency=200".',
          },
          {
            name: "onError",
            type: "(err: Error) => void",
            description:
              "Called when the FFmpeg output process exits with an error after the node is created.",
          },
        ]}
      />
      <CodeBlock
        code={`const output = await wf.output.srt({
  url: "srt://relay.example.com:9000?streamid=publish:live/key&mode=caller&latency=200",
  onError: (err) => console.error("SRT output error:", err.message),
});
await output.subscribe([{ source: encoder, sourceSelector: selectAll }]);`}
      />

      <H3 id="output-file">
        <FnName>wf.output.file()</FnName> — FileOutputNode
      </H3>
      <P>
        Records the subscribed stream(s) to a local file. The container format
        is inferred from the extension, or set explicitly with <IC>format</IC>.
      </P>
      <P>
        You can subscribe to multiple sources at once: each subscription's
        tracks are mapped into the output (<IC>VIDEO</IC> maps its video track,{" "}
        <IC>AUDIO</IC> maps its audio track, and <IC>ALL</IC> maps both), so
        e.g. a video source plus one or more separate audio-track sources all
        land as distinct tracks in the file. Use a multi-track-capable container
        such as MKV when combining more than one video or audio source.
      </P>
      <PropTable
        props={[
          {
            name: "fileName",
            type: "string",
            required: true,
            description: "Absolute path for the output file.",
          },
          {
            name: "format",
            type: "string",
            description:
              'Container format: "mp4", "ts", "mkv", etc. Inferred from extension if omitted.',
          },
          {
            name: "overwrite",
            type: "boolean",
            description:
              "Overwrite fileName if it already exists. Default: true.",
          },
        ]}
      />
      <CodeBlock
        code={`const recording = await wf.output.file({
  fileName: \`/recordings/\${Date.now()}.mp4\`,
  format: "mp4",
});
await recording.subscribe([{ source: input, sourceSelector: selectAll }]);`}
      />

      <H3 id="output-hls">
        <FnName>wf.output.hls()</FnName> — HlsOutputNode
      </H3>
      <P>
        Produces an HLS stream and writes segments + playlists to one or more
        destinations: local file system, S3-compatible storage (AWS, Tigris,
        MinIO, Cloudflare R2), or an HTTP server.
      </P>
      <PropTable
        props={[
          {
            name: "destinations",
            type: "HlsDestination[]",
            required: true,
            description:
              'One or more output targets. Each can be { type: "file", path }, { type: "s3", ... }, or { type: "http", baseUrl }.',
          },
          {
            name: "segmentTime",
            type: "number",
            default: "2",
            description: "Target HLS segment duration in seconds.",
          },
          {
            name: "listSize",
            type: "number",
            default: "3",
            description:
              "Segments kept in the live playlist window. 0 = VOD (keep all).",
          },
          {
            name: "audioCodec",
            type: "string",
            default: '"copy"',
            description:
              'Node-level fallback audio codec for subscriptions without their own codec. With several audio renditions and no codecs set anywhere, the default becomes "aac" so all renditions share one codec (required by hls.js).',
          },
          {
            name: "videoCodec",
            type: "string",
            default: '"copy"',
            description:
              "Node-level fallback video codec for subscriptions without their own codec.",
          },
        ]}
      />
      <P>
        For a caption-readiness buffer, set the same <IC>delayMs</IC> on each
        media subscription and leave the CAPTIONS subscriptions undelayed —
        captions sent during the window are queued before the first segment is
        written.
      </P>
      <CodeBlock
        code={`// File system output
const hls = await wf.output.hls({
  destinations: [{ type: "file", path: "/var/www/hls/stream" }],
  segmentTime: 4,
  listSize: 5,
});
await hls.subscribe([{ source: input, sourceSelector: selectAll }]);

// S3 / Tigris output
const hls = await wf.output.hls({
  destinations: [{
    type: "s3",
    bucket: "my-bucket",
    region: "auto",
    endpoint: "https://fly.storage.tigris.dev",
    keyPrefix: "live/stream",
    makePrefixUnique: true,   // append a session suffix to avoid cache collisions
    accessKeyId: process.env.TIGRIS_ACCESS_KEY!,
    secretAccessKey: process.env.TIGRIS_SECRET_KEY!,
  }],
});
await hls.subscribe([{ source: input, sourceSelector: selectAll }]);

// Get the effective segment path after subscribing
const [path] = await hls.effectivePaths();
console.log(\`HLS live at \${path}/master.m3u8\`);`}
      />

      {/* ── Processor Nodes ─────────────────────────────────────────────── */}
      <H2 id="processor-nodes">Processor Nodes</H2>

      <H3 id="processor-cea608">
        <FnName>wf.processor.cea608()</FnName> — Cea608EncoderNode
      </H3>
      <P>
        Injects CEA-608/708 closed captions directly into the H.264 SEI NAL
        units of the video stream. Subscribe it to both a video source and a{" "}
        <IC>captions()</IC> node. The output is broadcast-compatible (cable,
        streaming platforms, broadcast IRD).
      </P>
      <PropTable
        props={[
          {
            name: "channel",
            type: "1 | 2 | 3 | 4",
            default: "1",
            description: "CEA-608 channel: 1=CC1, 2=CC2, 3=CC3, 4=CC4.",
          },
          {
            name: "mode",
            type: '"rollUp" | "popOn" | "paintOn"',
            default: '"rollUp"',
            description: "Caption display mode.",
          },
          {
            name: "rows",
            type: "2 | 3 | 4",
            default: "2",
            description:
              "Max visible rows. Sets the roll-up window height, or caps pop-on line count.",
          },
          {
            name: "autoWrap",
            type: "boolean",
            default: "false",
            description:
              "popOn only: word-wrap text to CEA-608's 32-column width and lay it out as a bottom-anchored multi-line card (capped at rows), instead of requiring you to insert \\n yourself.",
          },
        ]}
      />
      <CodeBlock
        code={`const encoder = await wf.processor.cea608({
  channel: 1,
  mode: "rollUp",
  rows: 2,
});

// Subscribe to video AND captions. delayMs buffers the A/V stream while the
// caption subscription flows freely, so pre-scheduled captions are already
// queued when the first video frame arrives.
await encoder.subscribe([
  { source: fileInput,  sourceSelector: selectAll, delayMs: 5000 },
  { source: captions,   sourceSelector: selectCaptions },
]);

// Output node subscribes to the encoder (not the raw input)
await rtmpOut.subscribe([{ source: encoder, sourceSelector: selectAll }]);`}
      />

      <H3 id="processor-ffprobe">
        <FnName>wf.processor.ffprobeMonitor()</FnName> — FfprobeMonitorNode
      </H3>
      <P>
        Periodically probes the attached stream with ffprobe and publishes
        codec, resolution, frame-rate, and bitrate info. Does not modify the
        stream — subscribe an output node to the original source, not to this
        node.
      </P>
      <PropTable
        props={[
          {
            name: "intervalMs",
            type: "number",
            default: "30000",
            description: "How often (ms) to re-run ffprobe.",
          },
          {
            name: "probeSizeBytes",
            type: "number",
            default: "1048576",
            description:
              "Bytes of stream data fed into each ffprobe invocation (1 MB default).",
          },
        ]}
      />
      <CodeBlock
        code={`const probe = await wf.processor.ffprobeMonitor({ intervalMs: 15_000 });
await probe.subscribe([{ source: input, sourceSelector: selectAll }]);

// Subscribe to the stream-info monitor
const sub = probe.observe("stream-info", (event) => {
  if (event.kind === "status") {
    console.log("Stream info:", event.data);
    // { codec_name: "h264", width: "1920", height: "1080", ... }
  }
});

// Later: stop receiving events
sub.unsubscribe();`}
      />

      <H3 id="processor-gemini-translate">
        <FnName>wf.processor.geminiTranslate()</FnName> — GeminiTranslateNode
      </H3>
      <P>
        Translates an audio stream in real time via the Gemini Live Translate
        API. Subscribe it to an audio/media source; the server decodes the
        subscribed audio to PCM, streams it to Gemini, and outputs the
        translated speech as an audio-only MPEG-TS stream — wire it into an HLS
        or RTMP output as an alternate audio track.
      </P>
      <PropTable
        props={[
          {
            name: "apiKey",
            type: "string",
            required: true,
            description: "Gemini API key.",
          },
          {
            name: "targetLanguageCode",
            type: "string",
            required: true,
            description:
              'BCP-47 target language code for the translation output, e.g. "it", "es", "fr".',
          },
          {
            name: "label",
            type: "string",
            description: "Human-readable label shown in the dashboard.",
          },
        ]}
      />
      <CodeBlock
        code={`const geminiTranslate = await wf.processor.geminiTranslate({
  apiKey: process.env.GEMINI_API_KEY!,
  targetLanguageCode: "it",
  label: "Gemini (it)",
});
await geminiTranslate.subscribe([{ source: fileInput, sourceSelector: "AUDIO" }]);

// Wire the translated track in as an alternate HLS audio rendition
await hlsOut.subscribe([
  { source: fileInput, sourceSelector: selectAll, audio: { language: "en", label: "Original", defaultTrack: true } },
  { source: geminiTranslate, sourceSelector: "AUDIO", audio: { language: "it", label: "Italian" } },
]);`}
      />

      {/* ── Examples ────────────────────────────────────────────────────── */}
      <H2 id="examples">Examples</H2>

      <H3 id="example-rtmp-relay">RTMP relay</H3>
      <P>
        The simplest pipeline: accept any number of simultaneous RTMP streams
        and re-push each one to a destination.
      </P>
      <CodeBlock
        filename="rtmp-relay.ts"
        code={`import { type BaseNode, Rema, selectAll } from "@remavideo/sdk";

const rema = await Rema.connect({ host: "localhost", port: 8080 });
const wf = await rema.workflow.create({ name: "rtmp-relay" });

const active = new Map<string, BaseNode>();

const mux = await wf.input.rtmpMultiplexer({
  app: "live",
  async onStream(rtmpIn) {
    const out = await wf.output.rtmp({ url: \`rtmp://relay/live/\${rtmpIn.sourceName}\` });
    await out.subscribe([{ source: rtmpIn, sourceSelector: selectAll }]);
    active.set(rtmpIn.sourceName, out);
  },
  async onStreamEnd(rtmpIn) {
    const out = active.get(rtmpIn.sourceName);
    active.delete(rtmpIn.sourceName);
    await out?.close();
  },
});

process.once("SIGINT", async () => { await mux.close(); await wf.close(); await rema.close(); process.exit(0); });`}
      />

      <H3 id="example-file-to-rtmp">File to RTMP</H3>
      <P>
        Loop a local MP4 file and push it to an RTMP destination. Also records a
        plain copy to disk in parallel.
      </P>
      <CodeBlock
        filename="file-to-rtmp.ts"
        code={`import { Rema, selectAll } from "@remavideo/sdk";

const rema = await Rema.connect({ host: "localhost", port: 8080 });
const wf = await rema.workflow.create({ name: "file-to-rtmp" });

const input = await wf.input.file({
  fileName: "/data/video.mp4",
  loop: true,
  onReady: () => console.log("file opened"),
});

// Push to RTMP
const live = await wf.output.rtmp({ url: "rtmp://live.example.com/app/key" });
await live.subscribe([{ source: input, sourceSelector: selectAll }]);

// Record a copy
const rec = await wf.output.file({ fileName: \`/tmp/\${Date.now()}.mp4\` });
await rec.subscribe([{ source: input, sourceSelector: selectAll }]);

process.once("SIGINT", async () => { await wf.close(); await rema.close(); process.exit(0); });`}
      />

      <H3 id="example-live-captions">Live CEA-608 captions</H3>
      <P>
        Inject live captions into an RTMP stream as CEA-608/708 data. Captions
        are sent immediately and appear on the next available video frame.
      </P>
      <CodeBlock
        filename="live-captions.ts"
        code={`import { Rema, selectAll, selectCaptions } from "@remavideo/sdk";

const rema = await Rema.connect({ host: "localhost", port: 8080 });
const wf = await rema.workflow.create({ name: "live-captions" });

const input = await wf.input.rtmpReader({ app: "live", sourceName: "stream" });
const captions = await wf.input.captions();

const encoder = await wf.processor.cea608({ channel: 1, mode: "popOn", rows: 2 });
await encoder.subscribe([
  { source: input,    sourceSelector: selectAll },
  { source: captions, sourceSelector: selectCaptions },
]);

const output = await wf.output.rtmp({ url: "rtmp://live.example.com/app/key" });
await output.subscribe([{ source: encoder, sourceSelector: selectAll }]);

// Send captions from your transcription service, UI, etc.
async function onTranscript(text: string) {
  await captions.send(text, { duration: 4000 });
}

process.once("SIGINT", async () => { await wf.close(); await rema.close(); process.exit(0); });`}
      />

      <H3 id="example-scheduled-captions">Scheduled captions</H3>
      <P>
        Pre-schedule an SRT caption track against a looping file. Captions are
        sent before the pipeline starts; <IC>replayCount: Infinity</IC> ensures
        the encoder receives them all even if it connects after some entries
        were already queued.
      </P>
      <CodeBlock
        filename="scheduled-captions.ts"
        code={`import { Rema, selectAll, selectCaptions } from "@remavideo/sdk";

const rema = await Rema.connect({ host: "localhost", port: 8080 });
const wf = await rema.workflow.create({ name: "scheduled-captions" });

// replayCount: Infinity so late-connecting encoders get the full schedule
const captions = await wf.input.captions({ replayCount: Infinity });

// Pre-load the schedule before the file opens
const srt = [
  { startAt: 140,  endAt: 5150,  text: "Welcome to the stream." },
  { startAt: 5150, endAt: 9500,  text: "Today we are covering..." },
];
for (const { startAt, endAt, text } of srt) {
  await captions.send(text, { startAt, duration: endAt - startAt });
}

// Start the file (disabled so it waits for .enable())
const input = await wf.input.file({ fileName: "/data/video.mp4", loop: true, disabled: true });

const encoder = await wf.processor.cea608({
  channel: 1,
  mode: "rollUp",
  rows: 2,
});
await encoder.subscribe([
  // delayMs buffers the A/V to guarantee captions precede the first frame
  { source: input,    sourceSelector: selectAll, delayMs: 5000 },
  { source: captions, sourceSelector: selectCaptions },
]);

const output = await wf.output.rtmp({ url: "rtmp://live.example.com/app/key" });
await output.subscribe([{ source: encoder, sourceSelector: selectAll }]);

await input.enable();   // start the stream

process.once("SIGINT", async () => { await wf.close(); await rema.close(); process.exit(0); });`}
      />

      <H3 id="example-hls-s3">HLS output to S3 / Tigris</H3>
      <P>
        Stream a local file as HLS directly to an S3-compatible bucket. Each
        session gets a unique key prefix so browser-cached segments from a
        previous session are never served for a new one.
      </P>
      <CodeBlock
        filename="file-to-hls-tigris.ts"
        code={`import { Rema, selectVideo, selectAudio } from "@remavideo/sdk";

const rema = await Rema.connect({ host: "localhost", port: 8080 });
const wf = await rema.workflow.create({ name: "file-to-hls" });

const input = await wf.input.file({ fileName: "/data/video.mp4", loop: true });

const hls = await wf.output.hls({
  destinations: [{
    type: "s3",
    bucket: process.env.TIGRIS_BUCKET!,
    region: "auto",
    endpoint: "https://fly.storage.tigris.dev",
    keyPrefix: "hls/stream",
    makePrefixUnique: true,
    accessKeyId: process.env.TIGRIS_ACCESS_KEY!,
    secretAccessKey: process.env.TIGRIS_SECRET_KEY!,
  }],
  segmentTime: 4,
  listSize: 5,
});

// Subscribe video and audio separately to enable multi-track HLS
await hls.subscribe([
  { source: input, sourceSelector: selectVideo },
  { source: input, sourceSelector: selectAudio, audio: { language: "eng", label: "English", defaultTrack: true } },
]);

const [s3Path] = await hls.effectivePaths();
const keyPath = s3Path?.replace(/^s3:\\/\\/[^/]+\\//, "") ?? "hls/stream";
console.log(\`HLS → https://\${process.env.TIGRIS_BUCKET}.fly.storage.tigris.dev/\${keyPath}/master.m3u8\`);

process.once("SIGINT", async () => { await wf.close(); await rema.close(); process.exit(0); });`}
      />
    </DocPage>
  );
}
