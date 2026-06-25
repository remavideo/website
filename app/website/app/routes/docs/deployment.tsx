import { createFileRoute } from "@tanstack/react-router";
import {
  Callout,
  CodeBlock,
  DataTable,
  DocPage,
  H2,
  H3,
  IC,
  P,
  type TocSection,
} from "../../components/docs/Doc";

export const Route = createFileRoute("/docs/deployment")({
  component: DeploymentDocsPage,
});

const toc: TocSection[] = [
  {
    id: "overview",
    label: "Overview",
    children: [
      { id: "docker-image", label: "Docker image" },
      { id: "ports", label: "Exposed ports" },
      { id: "volumes", label: "Persistent storage" },
    ],
  },
  {
    id: "capacity",
    label: "Capacity planning",
    children: [
      { id: "capacity-model", label: "Resource model" },
      { id: "capacity-example", label: "Worked example" },
    ],
  },
  {
    id: "aws",
    label: "AWS",
    children: [
      { id: "aws-instance", label: "Instance sizing" },
      { id: "aws-security", label: "Security group" },
      { id: "aws-deploy", label: "Deploying" },
      { id: "aws-loadbalancer", label: "Load balancer" },
    ],
  },
  {
    id: "flyio",
    label: "Fly.io",
    children: [
      { id: "fly-machine", label: "Machine sizing" },
      { id: "fly-config", label: "fly.toml" },
      { id: "fly-deploy", label: "Deploying" },
      { id: "fly-volumes", label: "Volumes" },
    ],
  },
  {
    id: "gcp",
    label: "Google Cloud",
    children: [
      { id: "gcp-instance", label: "Instance sizing" },
      { id: "gcp-firewall", label: "Firewall rules" },
      { id: "gcp-deploy", label: "Deploying" },
    ],
  },
  {
    id: "bundled",
    label: "Bundled deployment",
    children: [
      { id: "bundled-when", label: "When to use" },
      { id: "bundled-compose", label: "Docker Compose" },
      { id: "bundled-image", label: "Single image" },
      { id: "bundled-bun-deno", label: "Bun & Deno" },
    ],
  },
];

function DeploymentDocsPage() {
  return (
    <DocPage
      eyebrow="DEPLOYMENT"
      title="Run rema in production"
      intro={
        <>
          The rema server ships as a single Docker image. This guide covers
          general setup and step-by-step instructions for <IC>AWS</IC>,{" "}
          <IC>Fly.io</IC>, and <IC>Google Cloud</IC>, plus bundling rema with
          your own app.
        </>
      }
      toc={toc}
    >
      {/* ── Overview ────────────────────────────────────────────────────── */}
      <H2 id="overview">Overview</H2>

      <P>
        Rema server ships as a single, self-contained Docker image. No
        additional services or sidecars are required — the entrypoint handles
        startup and cleanly forwards stop signals when the container is stopped.
      </P>

      <H3 id="docker-image">Docker image</H3>
      <P>
        The image is published to the GitHub Container Registry on every
        release. Use a pinned version tag in production to avoid unexpected
        upgrades.
      </P>
      <CodeBlock
        language="bash"
        code={`# Latest stable release
docker pull ghcr.io/remavideo/rema-server:latest

# Pin to a specific version (recommended for production)
docker pull ghcr.io/remavideo/rema-server:1.0.0

# Nightly build (tracks the nightly branch — unstable)
docker pull ghcr.io/remavideo/rema-server:nightly`}
      />

      <H3 id="ports">Exposed ports</H3>
      <P>
        The container exposes four ports. Open only the ones your workload
        requires — port 8554 is used internally and does not need to be
        reachable from the public internet. To run on a different host port, use
        Docker's <IC>-p</IC> mapping (e.g. <IC>-p 18080:8080</IC>) rather than
        environment variables — the internal port values are fixed by the image.
      </P>
      <DataTable
        headers={["Port", "Protocol", "Purpose"]}
        rows={[
          [
            "8080",
            "TCP",
            "HTTP REST API, SSE pipeline events, and tRPC WebSocket. SDK clients and the web UI connect here.",
          ],
          [
            "1935",
            "TCP",
            "RTMP ingest. External encoders (OBS, hardware encoders, ffmpeg) push streams here.",
          ],
          ["9000", "UDP", "SRT ingest. Low-latency contribution over UDP."],
          [
            "8554",
            "TCP",
            "Internal port. Not needed externally — do not expose this to the internet.",
          ],
        ]}
      />

      <H3 id="volumes">Persistent storage</H3>
      <P>
        The container is stateless by default. If you use file output nodes
        (recordings, HLS segments written to disk) you must mount a volume so
        data survives container restarts.
      </P>
      <CodeBlock
        language="bash"
        filename="docker run"
        code={`docker run -d \\
  --name rema \\
  -p 8080:8080 \\
  -p 1935:1935 \\
  -p 9000:9000/udp \\
  -v /data/recordings:/recordings \\
  ghcr.io/remavideo/rema-server:latest`}
      />
      <Callout variant="tip">
        For HLS output, point your <IC>wf.output.hls()</IC> destinations at the
        mounted path (e.g. <IC>/recordings/hls</IC>) and serve the files with a
        CDN or object storage rather than from the container directly.
      </Callout>

      {/* ── Capacity planning ───────────────────────────────────────────── */}
      <H2 id="capacity">Capacity planning</H2>

      <P>
        The instance sizing tables below give a per-cloud rule of thumb, but the
        actual number of streams a box can hold follows directly from two
        measured numbers: a fixed baseline for the server process, and a
        marginal cost per active workflow.
      </P>

      <H3 id="capacity-model">Resource model</H3>
      <P>
        With zero active workflows, an idle rema server uses about{" "}
        <IC>30 MB</IC> of RAM and effectively <IC>0%</IC> CPU. Each active
        workflow then adds a marginal cost on top of that baseline. This was
        measured per-stream, at the container level (e.g. via{" "}
        <IC>docker stats</IC>), for rema's two pipeline paths: plain passthrough
        (no caption node in the graph — a single FFmpeg <IC>-c copy</IC>{" "}
        process) and the caption path (an H.264 SEI-injection pipeline that
        still avoids a real transcode):
      </P>
      <DataTable
        headers={["Pipeline path", "RAM per stream", "CPU per stream"]}
        rows={[
          ["Simple (passthrough, -c copy)", "~170 MB", "~5–10% of one core"],
          ["Caption path (SEI injection)", "~180 MB", "~4.5% of one core"],
        ]}
      />
      <P>
        The two paths cost about the same. The caption pipeline doesn't
        re-encode anything — it parses and injects SEI NAL units into the
        existing bitstream — so it doesn't carry the extra cost you'd expect
        from a real transcode. For sizing purposes, use a single conservative
        figure that covers both:{" "}
        <strong>
          ~180 MB RAM and ~10% of one CPU core per active workflow
        </strong>
        .
      </P>
      <Callout variant="warning">
        This model only covers <strong>conversion-free</strong> pipelines —
        plain passthrough and caption injection. A processor node that actually
        transcodes (resizing, bitrate/codec conversion) spins up real
        encode/decode work and costs substantially more CPU per stream. Size
        those workflows by load-testing your specific encode settings, not with
        the numbers on this page.
      </Callout>
      <P>Putting the baseline and marginal cost together:</P>
      <CodeBlock
        language="text"
        code={`RAM needed  (MB)    ≈ 30 + streams × 180
CPU needed (cores)  ≈ streams × 0.10`}
      />
      <P>
        That accounts for the container only. If you're running directly on a VM
        (rather than a fully managed container platform), also reserve some
        headroom for the host OS and Docker engine outside the container —
        roughly <IC>250–300 MB</IC> is a reasonable rule of thumb for a minimal
        Linux image, though this isn't something we've measured as precisely as
        the figures above.
      </P>

      <H3 id="capacity-example">Worked example</H3>
      <P>
        Take the smallest tier from the tables below — a 2 vCPU / 4 GB box.
        Plugging in the formula gives a <em>raw</em> ceiling of ~20 streams
        (CPU-bound: 2 cores ÷ 10% per stream). Whether you actually run at that
        ceiling depends on how much headroom you want to leave for OS jitter,
        reconnect bursts, and measurement variance:
      </P>
      <DataTable
        headers={["Headroom", "Max streams", "What it buys you"]}
        mono={[]}
        rows={[
          [
            "0% (raw math)",
            "20",
            "Every core allocated to streams — no margin for spikes.",
          ],
          [
            "25%",
            "15",
            "A quarter of capacity held back — a reasonable default for most production setups.",
          ],
          [
            "50%",
            "10",
            "Half held back — conservative; comfortable room for traffic spikes or co-located workloads.",
          ],
        ]}
      />
      <P>
        Larger instances scale linearly with vCPU count using the same formula —
        the per-cloud tables below list the raw (0% headroom) ceiling alongside
        a more conservative range so you can pick the number that matches your
        own risk tolerance.
      </P>
      <Callout variant="info">
        This is a CPU/RAM model only. At high concurrency, other limits — open
        file descriptors, network throughput, or a single RTMP listener's
        connection-handling overhead — may bind before CPU or RAM do. Load-test
        before committing to a number above a few dozen streams on one box.
      </Callout>

      {/* ── AWS ─────────────────────────────────────────────────────────── */}
      <H2 id="aws">AWS</H2>

      <P>
        The recommended AWS deployment runs the container on a single EC2
        instance. RTMP is a long-lived TCP connection and is not suited for the
        Application Load Balancer; use a Network Load Balancer (NLB) if you need
        a fixed hostname in front of the instance, or expose the instance IP
        directly.
      </P>

      <H3 id="aws-instance">Instance sizing</H3>
      <P>
        Rema is CPU-bound: each active pipeline (passthrough or captions) costs
        about <IC>10%</IC> of one core, so streams-per-box scales linearly with
        vCPU count — see{" "}
        <a href="#capacity" className="text-primary underline">
          Capacity planning
        </a>{" "}
        for the formula behind the numbers below. Choose compute-optimised
        instances (<IC>c7i</IC> or <IC>c6i</IC> family). General-purpose (
        <IC>m7i</IC>) instances work fine for moderate loads. A processor node
        that actually transcodes will need more headroom than these numbers
        assume.
      </P>
      <DataTable
        headers={["Instance", "vCPU", "RAM", "Typical use"]}
        rows={[
          [
            "c6i.large",
            "2",
            "4 GB",
            "Development: 10–20 passthrough/caption streams",
          ],
          [
            "c6i.xlarge",
            "4",
            "8 GB",
            "Production: 20–40 passthrough/caption streams",
          ],
          [
            "c6i.2xlarge",
            "8",
            "16 GB",
            "High-throughput: 40–80 passthrough/caption streams",
          ],
          [
            "c6i.4xlarge",
            "16",
            "32 GB",
            "Large-scale: 80–160 passthrough/caption streams",
          ],
        ]}
      />
      <Callout variant="tip">
        Use an arm64 instance (<IC>c7g.xlarge</IC>, Graviton3) for better
        price-performance on pure-passthrough pipelines. The Docker image ships
        both <IC>linux/amd64</IC> and <IC>linux/arm64</IC> manifests.
      </Callout>

      <H3 id="aws-security">Security group</H3>
      <P>
        Create an inbound rule for each port your workload needs. Restrict the
        RTMP source to known encoder IPs when possible.
      </P>
      <CodeBlock
        language="bash"
        filename="aws-cli"
        code={`# HTTP / WebSocket API (SDK clients, web UI)
aws ec2 authorize-security-group-ingress \\
  --group-id sg-xxxxxxxx \\
  --protocol tcp --port 8080 --cidr 0.0.0.0/0

# RTMP ingest
aws ec2 authorize-security-group-ingress \\
  --group-id sg-xxxxxxxx \\
  --protocol tcp --port 1935 --cidr 0.0.0.0/0

# SRT ingest (UDP)
aws ec2 authorize-security-group-ingress \\
  --group-id sg-xxxxxxxx \\
  --protocol udp --port 9000 --cidr 0.0.0.0/0`}
      />

      <H3 id="aws-deploy">Deploying</H3>
      <P>
        The following commands install Docker on an Amazon Linux 2023 instance
        and start the rema container with a systemd unit so it restarts on
        reboot.
      </P>
      <CodeBlock
        language="bash"
        filename="user-data.sh"
        code={`#!/bin/bash
set -e

# Install Docker
dnf install -y docker
systemctl enable --now docker

# Authenticate with GHCR if using a private image
# docker login ghcr.io -u YOUR_GITHUB_USER -p YOUR_PAT

# Pull the image
docker pull ghcr.io/remavideo/rema-server:latest

# Create a systemd unit
cat > /etc/systemd/system/rema.service << 'EOF'
[Unit]
Description=Rema Server
After=docker.service
Requires=docker.service

[Service]
Restart=always
ExecStartPre=-/usr/bin/docker rm -f rema
ExecStart=/usr/bin/docker run --rm --name rema \\
  -p 8080:8080 \\
  -p 1935:1935 \\
  -p 9000:9000/udp \\
  -v /data/recordings:/recordings \\
  ghcr.io/remavideo/rema-server:latest
ExecStop=/usr/bin/docker stop rema

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now rema`}
      />

      <H3 id="aws-loadbalancer">Load balancer (optional)</H3>
      <P>
        An Application Load Balancer (ALB) can front port 8080 for HTTPS
        termination and a stable DNS name. RTMP (port 1935) requires a Network
        Load Balancer (NLB) because it is raw TCP.
      </P>
      <Callout variant="warning">
        Do not put RTMP behind an ALB — ALB operates at layer 7 (HTTP) and will
        break the long-lived RTMP TCP connection. Use an NLB (layer 4) or expose
        the instance IP directly for port 1935.
      </Callout>
      <CodeBlock
        language="bash"
        filename="aws-cli"
        code={`# Create an NLB target group for RTMP (TCP)
aws elbv2 create-target-group \\
  --name rema-rtmp \\
  --protocol TCP --port 1935 \\
  --target-type instance \\
  --vpc-id vpc-xxxxxxxx

# Register your instance
aws elbv2 register-targets \\
  --target-group-arn arn:aws:elasticloadbalancing:... \\
  --targets Id=i-xxxxxxxxxxxxxxxxx`}
      />

      {/* ── Fly.io ──────────────────────────────────────────────────────── */}
      <H2 id="flyio">Fly.io</H2>

      <P>
        Fly.io is a good fit for rema because it supports dedicated IP
        addresses, raw TCP/UDP services, and persistent volumes — all needed for
        RTMP ingest and recording workflows. Machines run in Fly's global
        network and can be placed close to your encoders.
      </P>
      <Callout variant="warning">
        RTMP clients connect to a specific IP, not a load-balanced hostname.
        Allocate a dedicated IPv4 address (<IC>fly ips allocate-v4</IC>) so your
        RTMP URL stays stable across deployments.
      </Callout>

      <H3 id="fly-machine">Machine sizing</H3>
      <P>
        Fly machines are sized by CPU class and count. Choose{" "}
        <IC>performance</IC>-class CPUs for encoding workloads — they are
        dedicated cores, unlike shared <IC>shared</IC>-class vCPUs. See{" "}
        <a href="#capacity" className="text-primary underline">
          Capacity planning
        </a>{" "}
        for how the stream counts below were derived.
      </P>
      <DataTable
        headers={["Size", "vCPU", "RAM", "Typical use"]}
        rows={[
          [
            "performance-2x",
            "2",
            "4 GB",
            "Development: 10–20 passthrough/caption streams",
          ],
          [
            "performance-4x",
            "4",
            "8 GB",
            "Production: 20–40 passthrough/caption streams",
          ],
          [
            "performance-8x",
            "8",
            "16 GB",
            "High-throughput: 40–80 passthrough/caption streams",
          ],
        ]}
      />

      <H3 id="fly-config">fly.toml</H3>
      <P>
        The configuration below exposes all three public-facing ports. The RTMP
        and SRT services use <IC>type = "tcp"</IC> / <IC>type = "udp"</IC>{" "}
        handlers so Fly routes raw traffic directly to the container.
      </P>
      <CodeBlock
        language="toml"
        filename="fly.toml"
        code={`app = "my-rema-server"
primary_region = "iad"   # choose the region closest to your encoders

[build]
  image = "ghcr.io/remavideo/rema-server:latest"

[env]
  # Override defaults if needed
  # REMA_HTTP_PORT = "8080"
  # REMA_RTMP_PORT = "1935"
  # REMA_SRT_PORT  = "9000"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = false
  min_machines_running = 1

[[services]]
  protocol = "tcp"
  internal_port = 1935

  [[services.ports]]
    port = 1935
    handlers = ["tcp"]   # raw TCP passthrough — required for RTMP

[[services]]
  protocol = "udp"
  internal_port = 9000

  [[services.ports]]
    port = 9000

[[vm]]
  size = "performance-4x"

[mounts]
  source = "recordings"
  destination = "/recordings"
  initial_size = "50gb"`}
      />

      <H3 id="fly-deploy">Deploying</H3>
      <CodeBlock
        language="bash"
        code={`# Install the Fly CLI if you haven't already
brew install flyctl

# Authenticate
fly auth login

# Create the app (skip the build wizard — we use a pre-built image)
fly apps create my-rema-server --org personal

# Allocate a dedicated IPv4 for RTMP (billed ~$2/month)
fly ips allocate-v4 --app my-rema-server

# Create the persistent volume for recordings
fly volumes create recordings --region iad --size 50 --app my-rema-server

# Deploy
fly deploy --app my-rema-server

# Tail logs
fly logs --app my-rema-server`}
      />

      <H3 id="fly-volumes">Volumes &amp; storage</H3>
      <P>
        Fly volumes are pinned to a single machine and a single region. For
        production recording workflows consider writing HLS segments directly to
        S3-compatible storage (e.g. Tigris, which is natively integrated with
        Fly) instead of mounting a local volume, to avoid a single point of
        failure.
      </P>
      <CodeBlock
        language="toml"
        filename="fly.toml — Tigris HLS example"
        code={`[env]
  TIGRIS_BUCKET     = "my-hls-bucket"
  TIGRIS_ENDPOINT   = "https://fly.storage.tigris.dev"
  TIGRIS_REGION     = "auto"

# Secrets (set with fly secrets set, not in fly.toml)
# fly secrets set TIGRIS_ACCESS_KEY=... TIGRIS_SECRET_KEY=...`}
      />
      <Callout variant="tip">
        Use <IC>fly secrets set KEY=VALUE</IC> for credentials — never put
        access keys in <IC>fly.toml</IC> as it is committed to source control.
      </Callout>

      {/* ── Google Cloud ────────────────────────────────────────────────── */}
      <H2 id="gcp">Google Cloud</H2>

      <P>
        On Google Cloud, the recommended deployment is a single Compute Engine
        VM running Docker. Cloud Run is not suitable because it does not support
        raw TCP/UDP on arbitrary ports — RTMP and SRT require a VM or GKE node
        with host networking.
      </P>

      <H3 id="gcp-instance">Instance sizing</H3>
      <P>
        Choose compute-optimised (<IC>c2</IC> or <IC>c3</IC>) machine types. The{" "}
        <IC>n2-standard</IC> family is a good general-purpose alternative if
        compute-optimised availability is limited in your region. See{" "}
        <a href="#capacity" className="text-primary underline">
          Capacity planning
        </a>{" "}
        for how the stream counts below were derived — they scale with vCPU
        count, not RAM, since these workloads are CPU-bound first.
      </P>
      <DataTable
        headers={["Machine type", "vCPU", "RAM", "Typical use"]}
        rows={[
          [
            "c2-standard-4",
            "4",
            "16 GB",
            "Production: 20–40 passthrough/caption streams",
          ],
          [
            "c2-standard-8",
            "8",
            "32 GB",
            "High-throughput: 40–80 passthrough/caption streams",
          ],
          [
            "n2-standard-2",
            "2",
            "8 GB",
            "Development: 10–20 passthrough/caption streams",
          ],
          [
            "n2-standard-4",
            "4",
            "16 GB",
            "Production: 20–40 passthrough/caption streams",
          ],
        ]}
      />
      <Callout variant="tip">
        T2A (Ampere Altra, arm64) instances offer better price-performance for
        passthrough pipelines. The rema image ships a native arm64 layer.
      </Callout>

      <H3 id="gcp-firewall">Firewall rules</H3>
      <P>
        GCP blocks all ingress by default. Create VPC firewall rules for the
        ports your deployment needs. Tag your instance with <IC>rema-server</IC>{" "}
        and target the rules at that tag.
      </P>
      <CodeBlock
        language="bash"
        filename="gcloud"
        code={`# HTTP / WebSocket API
gcloud compute firewall-rules create rema-http \\
  --direction=INGRESS --priority=1000 \\
  --network=default --action=ALLOW \\
  --rules=tcp:8080 \\
  --source-ranges=0.0.0.0/0 \\
  --target-tags=rema-server

# RTMP ingest
gcloud compute firewall-rules create rema-rtmp \\
  --direction=INGRESS --priority=1000 \\
  --network=default --action=ALLOW \\
  --rules=tcp:1935 \\
  --source-ranges=0.0.0.0/0 \\
  --target-tags=rema-server

# SRT ingest (UDP)
gcloud compute firewall-rules create rema-srt \\
  --direction=INGRESS --priority=1000 \\
  --network=default --action=ALLOW \\
  --rules=udp:9000 \\
  --source-ranges=0.0.0.0/0 \\
  --target-tags=rema-server`}
      />

      <H3 id="gcp-deploy">Deploying</H3>
      <P>
        Create the instance with a startup script that installs Docker and
        starts the rema container. Attach a persistent disk for recordings.
      </P>
      <CodeBlock
        language="bash"
        filename="gcloud — create instance"
        code={`gcloud compute instances create rema-prod \\
  --zone=us-central1-a \\
  --machine-type=c2-standard-4 \\
  --image-family=cos-stable \\
  --image-project=cos-cloud \\
  --boot-disk-size=20GB \\
  --create-disk=name=rema-recordings,size=100GB,type=pd-ssd,auto-delete=no \\
  --tags=rema-server \\
  --metadata-from-file=startup-script=startup.sh`}
      />
      <CodeBlock
        language="bash"
        filename="startup.sh"
        code={`#!/bin/bash
set -e

# Container-Optimized OS ships Docker — no installation needed.

# Mount the recordings disk
DISK_DEV=/dev/disk/by-id/google-rema-recordings
if ! blkid "$DISK_DEV"; then
  mkfs.ext4 -F "$DISK_DEV"
fi
mkdir -p /mnt/recordings
mount "$DISK_DEV" /mnt/recordings

# Pull and start the container
docker run -d --restart=always --name rema \\
  -p 8080:8080 \\
  -p 1935:1935 \\
  -p 9000:9000/udp \\
  -v /mnt/recordings:/recordings \\
  ghcr.io/remavideo/rema-server:latest`}
      />
      <Callout variant="info">
        GCP's Container-Optimized OS (COS) is the recommended base for running
        Docker containers — it ships with Docker pre-installed, has a minimal
        attack surface, and auto-updates the OS layer. Pass{" "}
        <IC>--image-family=cos-stable --image-project=cos-cloud</IC> to use it.
      </Callout>

      {/* ── Bundled deployment ──────────────────────────────────────────── */}
      <H2 id="bundled">Bundled deployment</H2>

      <P>
        If your application is a Node.js (or Bun / Deno) program that talks to
        rema via the SDK, you can ship your code and the rema server together so
        they run as a single deployable unit. There are two ways to do this.
      </P>

      <H3 id="bundled-when">When to use — and when not to</H3>
      <DataTable
        headers={["Use bundled when…", "Keep them separate when…"]}
        mono={[]}
        rows={[
          [
            "The platform only handles one container per app (some PaaS)",
            "You need to scale your app and rema independently",
          ],
          [
            "You want one thing to deploy, monitor, and restart",
            "Multiple apps share a single rema instance",
          ],
          [
            "The SDK calls are latency-sensitive (no network hop)",
            "You update your code and rema on different release cycles",
          ],
        ]}
      />

      <H3 id="bundled-compose">Docker Compose (recommended)</H3>
      <P>
        The simplest approach is a Compose file with two services that share the
        same Docker network. Your app connects to rema using the service name as
        the hostname. Port 8080 is never published externally — it stays on the
        internal network.
      </P>
      <CodeBlock
        language="yaml"
        filename="docker-compose.yml"
        code={`services:
  rema:
    image: ghcr.io/remavideo/rema-server:latest
    ports:
      - "1935:1935"
      - "9000:9000/udp"
    healthcheck:
      test: ["CMD", "curl", "-sf", "http://localhost:8080/api/pipeline"]
      interval: 2s
      retries: 15
    restart: unless-stopped

  app:
    build: .
    environment:
      REMA_HOST: rema      # Docker resolves this to the rema container
      REMA_PORT: "8080"
    depends_on:
      rema:
        condition: service_healthy
    restart: unless-stopped`}
      />
      <P>
        Read the connection details from environment variables in your app so
        the same image works locally (<IC>localhost</IC>) and in Compose (
        <IC>rema</IC>):
      </P>
      <CodeBlock
        code={`import { Rema } from "@remavideo/sdk";

const rema = await Rema.connect({
  host: process.env.REMA_HOST ?? "localhost",
  port: Number(process.env.REMA_PORT ?? 8080),
});`}
      />

      <H3 id="bundled-image">Single image</H3>
      <P>
        For platforms that require a single container, build your image{" "}
        <IC>FROM</IC> the rema image, add your code on top, and replace the
        entrypoint with a script that starts rema in the background, waits for
        it to be ready, then runs your app in the foreground.
      </P>
      <CodeBlock
        language="bash"
        filename="Dockerfile"
        code={`FROM ghcr.io/remavideo/rema-server:latest

# Switch to root to install your app's dependencies
USER root

WORKDIR /myapp
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY dist/ ./dist/

COPY bundle-entrypoint.sh /bundle-entrypoint.sh
RUN chmod +x /bundle-entrypoint.sh

# Drop back to the unprivileged user
USER node

ENTRYPOINT ["/bundle-entrypoint.sh"]`}
      />
      <CodeBlock
        language="bash"
        filename="bundle-entrypoint.sh"
        code={`#!/bin/sh
set -e

# Start the rema server in the background
/entrypoint.sh &
REMA_PID=$!

# Wait until the HTTP API accepts requests
until curl -sf "http://localhost:\${REMA_HTTP_PORT:-8080}/api/pipeline" >/dev/null 2>&1; do
  sleep 0.5
done

# Forward stop signals to both processes for clean shutdown
trap 'kill "$REMA_PID" "$APP_PID" 2>/dev/null' TERM INT

# Start the app
node /myapp/dist/index.js &
APP_PID=$!

# Block until the app exits, then stop rema
wait "$APP_PID"
kill "$REMA_PID" 2>/dev/null
wait "$REMA_PID" 2>/dev/null`}
      />
      <P>The SDK connects over localhost — no host configuration needed:</P>
      <CodeBlock
        code={`import { Rema } from "@remavideo/sdk";

const rema = await Rema.connect({ host: "localhost", port: 8080 });`}
      />
      <Callout variant="tip">
        In the single-image case, port 8080 is purely internal. Only publish{" "}
        <IC>1935</IC> and <IC>9000</IC> — omit <IC>-p 8080:8080</IC> unless you
        also need the web UI reachable from outside the container.
      </Callout>

      <H3 id="bundled-bun-deno">Bun &amp; Deno</H3>
      <P>
        The pattern is the same for other runtimes. Add a <IC>RUN</IC> step to
        install the runtime, then adjust the final command in{" "}
        <IC>bundle-entrypoint.sh</IC>.
      </P>
      <CodeBlock
        language="bash"
        filename="Dockerfile — Bun"
        code={`FROM ghcr.io/remavideo/rema-server:latest

USER root

# Install Bun into /usr/local so it is on PATH for all users
RUN curl -fsSL https://bun.sh/install | BUN_INSTALL=/usr/local bash

WORKDIR /myapp
COPY package.json bun.lockb ./
RUN bun install --production
COPY src/ ./src/

COPY bundle-entrypoint.sh /bundle-entrypoint.sh
RUN chmod +x /bundle-entrypoint.sh

USER node
ENTRYPOINT ["/bundle-entrypoint.sh"]`}
      />
      <P>
        In <IC>bundle-entrypoint.sh</IC>, replace the last app command:
      </P>
      <CodeBlock language="bash" code={`bun run /myapp/src/index.ts &`} />
      <CodeBlock
        language="bash"
        filename="Dockerfile — Deno"
        code={`FROM ghcr.io/remavideo/rema-server:latest

USER root

RUN curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh

WORKDIR /myapp
COPY deno.json ./
COPY src/ ./src/

COPY bundle-entrypoint.sh /bundle-entrypoint.sh
RUN chmod +x /bundle-entrypoint.sh

USER node
ENTRYPOINT ["/bundle-entrypoint.sh"]`}
      />
      <P>
        In <IC>bundle-entrypoint.sh</IC>, replace the last app command:
      </P>
      <CodeBlock
        language="bash"
        code={`deno run --allow-net --allow-env /myapp/src/index.ts &`}
      />
    </DocPage>
  );
}
