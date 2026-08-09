# Footnote: EC2 Deploy Runbook

Written for the first deploy on 2026-08-09. Kept in the repo as `docs/deploy.md`
so every future deploy follows the same steps. Instance: fresh t3.micro,
separate from the blog instance by design (blast-radius isolation for a judged
demo; see DECISIONS.md).

Every step ends with a CHECK. Do not move on until the check passes.

---

## Part 1: AWS Console

### Step 1. Launch the instance
1. AWS Console → EC2 → **Launch instance**.
2. Name: `footnote`.
3. AMI: **Ubuntu Server 24.04 LTS** (64-bit x86).
4. Instance type: **t3.micro**.
5. Key pair: **Create new key pair** → name `footnote-key` → type RSA →
   format `.pem` → Create. The file downloads once; keep it.
6. Network settings → **Edit**:
   - Create security group, name `footnote-sg`.
   - Rule 1: SSH, port 22, Source: **My IP**.
   - Rule 2: HTTP, port 80, Source: Anywhere (0.0.0.0/0).
   - Rule 3: HTTPS, port 443, Source: Anywhere (0.0.0.0/0).
   - Nothing else. Port 3001 stays closed; nginx proxies to it internally.
7. Storage: **20 GB gp3**.
8. **Launch instance.**

CHECK: instance state shows Running, both status checks eventually pass (2/2).

### Step 2. Elastic IP (stable address)
1. EC2 left menu → Network & Security → **Elastic IPs** → Allocate → Allocate.
2. Select the new IP → Actions → **Associate Elastic IP address** → pick the
   `footnote` instance → Associate.
3. Write the IP down; it appears as YOUR-IP in every step below.

CHECK: the instance summary now shows the Elastic IP as its public IPv4.

### Step 3. DNS
1. At the registrar for alessandrarye.com: add an **A record**:
   host/name `footnote`, value YOUR-IP, TTL default (or 300).
2. Propagation takes minutes; start it now, verify later in Step 12.

CHECK (later): `nslookup footnote.alessandrarye.com` returns YOUR-IP.

---

## Part 2: On your desktop (foundry)

### Step 4. Secure the key and connect
```bash
cd ~/Downloads
chmod 400 footnote-key.pem
mv footnote-key.pem ~/.ssh/
ssh -i ~/.ssh/footnote-key.pem ubuntu@YOUR-IP
```
First connection asks to trust the host fingerprint: type `yes`.

CHECK: prompt changes to `ubuntu@ip-...:~$`. You are on the server; every
step in Part 3 runs there.

---

## Part 3: On the server

### Step 5. System update and base packages
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx git
sudo npm install -g pm2
```
If `apt upgrade` shows a pink screen about restarting services: Enter/OK on
the defaults.

CHECK: `node -v` prints v22.x, `nginx -v` prints a version, `pm2 -v` prints
a version.

### Step 6. Swap file (t3.micro has 1 GB RAM; Vite builds need more)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

CHECK: `free -h` shows a Swap line with 2.0Gi total.

### Step 7. Clone and start the API
```bash
cd ~
git clone https://github.com/Alessandrarye/footnote.git
cd footnote/server
npm ci
pm2 start index.js --name footnote-api
pm2 startup
```
`pm2 startup` prints a long `sudo env PATH=...` command. Copy that exact
command, paste it, run it. Then:
```bash
pm2 save
```

CHECK: `curl http://localhost:3001/api/health` on the server returns the
health JSON. `pm2 status` shows footnote-api online.

### Step 8. Build the client
```bash
cd ~/footnote/client
npm ci
npm run build
```
The build takes a minute on a micro; the swap file is what keeps it alive.

CHECK: `ls dist/` shows index.html and an assets/ folder.

### Step 9. Nginx site
```bash
sudo nano /etc/nginx/sites-available/footnote
```
Paste exactly:
```nginx
server {
    listen 80;
    server_name footnote.alessandrarye.com;

    root /home/ubuntu/footnote/client/dist;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
Save (Ctrl+O, Enter) and exit (Ctrl+X). Then:
```bash
sudo ln -s /etc/nginx/sites-available/footnote /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```
`nginx -t` must say syntax ok / test successful before the reload.

CHECK: `curl http://localhost/api/health` on the server returns the health
JSON (this proves the nginx → API proxy works).

### Step 10. Verify from the outside
On your desktop browser:
- `http://YOUR-IP` shows the Vite starter page.
- `http://YOUR-IP/api/health` returns the JSON.

CHECK: both load. If the page loads but /api/health 404s, recheck Step 9's
location /api/ block.

### Step 11. Verify DNS
```bash
nslookup footnote.alessandrarye.com
```
CHECK: returns YOUR-IP. If not yet, wait; nothing else proceeds until it does.

### Step 12. TLS with certbot
Back on the server:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d footnote.alessandrarye.com
```
Prompts: your email; agree to terms; newsletter optional (No is fine); when
asked about redirecting HTTP to HTTPS, choose **redirect**.

CHECK: `https://footnote.alessandrarye.com` loads with a padlock, and
`https://footnote.alessandrarye.com/api/health` returns the JSON.
Auto-renewal test: `sudo certbot renew --dry-run` succeeds.

---

## Part 4: Close the loop in the repo (on foundry)

### Step 13. Commit this runbook and the decision
```bash
cd ~/dev/footnote
git checkout main && git pull
git checkout -b docs/deploy-runbook
mkdir -p docs
# put this file at docs/deploy.md; note any deviations you hit
```
Append to DECISIONS.md:
```
## 2026-08-09 · Fresh EC2 instance (not shared with blog)
Blast-radius isolation for a judged demo; clean documented infra from
scratch; accepted ~$10/mo. Elastic IP + footnote.alessandrarye.com,
nginx + pm2 + certbot. Runbook: docs/deploy.md.
```
```bash
git add docs/deploy.md DECISIONS.md
git commit -m "Add deploy runbook and infra decision"
git push -u origin docs/deploy-runbook
```
Open the PR on GitHub, merge, delete branch, then locally:
```bash
git checkout main && git pull
```

CHECK: docs/deploy.md visible on GitHub main.

---

## Every future deploy (after each merged PR you want live)

SSH in, then:
```bash
cd ~/footnote
git pull
cd server && npm ci && cd ../client && npm ci && npm run build
pm2 restart footnote-api
```
(Skip the npm ci lines when package.json didn't change. nginx never needs
touching for app updates.) Worth scripting as `deploy.sh` in week 2.

---

## Troubleshooting quick hits

- **SSH times out**: security group SSH rule is pinned to My IP; if your home
  IP changed, edit the rule.
- **pm2 gone after reboot**: the `pm2 startup` printed command wasn't run, or
  `pm2 save` wasn't. Redo both.
- **Vite build killed**: swap missing; recheck Step 6.
- **502 from nginx on /api/**: API not running (`pm2 status`, `pm2 logs
  footnote-api`).
- **certbot fails**: DNS not propagated yet (Step 11), or port 80 blocked
  (security group), or the server_name doesn't match the domain.
- **Site shows nginx default page**: the default site wasn't removed or
  reload didn't happen; redo the tail of Step 9.
