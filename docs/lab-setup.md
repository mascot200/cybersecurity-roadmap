# Lab Setup — Step by Step

Goal: a safe, repeatable environment for every lab in this course. Total time: 1–3 hours.

```mermaid
flowchart TB
  subgraph Laptop["Your computer (host)"]
    Browser["Browser + Burp Suite Community"]
    subgraph VM["Ubuntu 24.04 LTS VM (or WSL2 / native Linux)"]
      Docker["Docker Engine + Compose"]
      Node["Node.js LTS + npm"]
      Tools["Security tools: nmap, semgrep, trivy, gitleaks..."]
      Docker --> Labs["Vulnerable labs bound to 127.0.0.1"]
    end
  end
  Cloud["AWS account (from Month 7)<br/>budget alerts + MFA"] -.-> Laptop
```

## Step 1 — Get a Linux environment

Pick **one**:

| Option | Best for | How |
|---|---|---|
| **A. VirtualBox/UTM VM** (recommended) | Full isolation, snapshot/restore | Install VirtualBox (Windows/Intel Mac/Linux) or UTM (Apple Silicon). Create a VM with 4 GB RAM, 2 CPUs, 40 GB disk. Install **Ubuntu Server or Desktop 24.04 LTS**. |
| B. WSL2 (Windows) | Low resources | `wsl --install -d Ubuntu-24.04` in an admin PowerShell |
| C. Native Linux | Already on Linux | Use a separate user account for labs |

**Take a VM snapshot right after install** (name it `clean-install`). You'll roll back to it when you break things.

## Step 2 — Base packages

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install curl wget git vim jq unzip net-tools dnsutils \
  tcpdump nmap openssl build-essential ca-certificates gnupg ufw
```

Verify:

```bash
git --version && nmap --version | head -1 && dig -v 2>&1 | head -1
```

## Step 3 — Docker Engine + Compose

Follow the official instructions: <https://docs.docker.com/engine/install/ubuntu/>. Short version:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh   # read it before running!
less get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker "$USER"   # log out and back in afterwards
docker run --rm hello-world
docker compose version
```

> 🔐 **Security note:** membership of the `docker` group is effectively **root** on that host
> (you can mount `/` into a container). Fine for a personal lab VM; you'll learn why it matters in Month 6.

## Step 4 — Node.js LTS (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v && npm -v
```

## Step 5 — PostgreSQL client (server runs in Docker)

```bash
sudo apt -y install postgresql-client
docker run -d --name lab-pg -e POSTGRES_PASSWORD=labpass -p 127.0.0.1:5432:5432 postgres:16
psql "postgresql://postgres:labpass@127.0.0.1:5432/postgres" -c "select version();"
docker rm -f lab-pg
```

## Step 6 — Burp Suite Community Edition (on the host)

1. Download from <https://portswigger.net/burp/communitydownload>.
2. Start Burp → *Proxy* → *Intercept* → **Open browser** (Burp's built-in Chromium is pre-configured).
3. Visit `http://127.0.0.1:3000` of a lab app and confirm requests appear in *HTTP history*.

## Step 7 — Security tools (installed as needed per month)

| Tool | Month | Install |
|---|---|---|
| Semgrep | 5 | `python3 -m pip install --user pipx && pipx install semgrep` |
| Gitleaks | 5 | download a release binary from <https://github.com/gitleaks/gitleaks/releases> |
| OSV-Scanner | 5 | release binary from <https://github.com/google/osv-scanner/releases> |
| Trivy | 6 | <https://trivy.dev/latest/getting-started/installation/> |
| Syft / Grype | 6 | <https://github.com/anchore/syft> · <https://github.com/anchore/grype> |
| AWS CLI v2 | 7 | <https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html> |
| Terraform | 8 | <https://developer.hashicorp.com/terraform/install> |
| Checkov | 8 | `pipx install checkov` |
| kind + kubectl | 9 | <https://kind.sigs.k8s.io/> · <https://kubernetes.io/docs/tasks/tools/> |
| Prowler | 9 | `pipx install prowler` |

> Always install from **official sources**, check what a script does before piping it to a shell,
> and prefer pinned versions. Supply-chain attacks target developers' machines too.

## Step 8 — Your journal repo

```bash
mkdir -p ~/cybersecurity-journey/{notes,labs,projects,diagrams,reports}
cd ~/cybersecurity-journey && git init
printf ".env\n*.pem\n*.key\nnode_modules/\n*.tfstate*\n.terraform/\n" > .gitignore
git add . && git commit -m "Initial journal structure"
```

Push it to GitHub and enable **Secret scanning** and **Push protection** in *Settings → Code security*.

## Step 9 — Verify your lab (post this in issue #1)

```bash
echo "OS: $(lsb_release -ds)"; echo "Docker: $(docker --version)"; \
echo "Node: $(node -v)"; echo "nmap: $(nmap --version | head -1)"
```

- [ ] VM snapshot `clean-install` exists
- [ ] `docker run --rm hello-world` works without sudo
- [ ] Node LTS installed
- [ ] Burp shows traffic from its built-in browser
- [ ] Journal repo pushed with secret scanning enabled
