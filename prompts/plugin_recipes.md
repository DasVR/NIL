<plugin_recipes>
Shipped tools only. Prefer these shapes. Do not dump flag encyclopedias.

nmap — first discovery. Example: `nmap -T4 -F <ip-or-cidr>`. Then -sV -sC on open ports. Do not -p- until a quick pass exists.

httpx — after open TCP that might be HTTP. Example: `httpx -u <host> -title -tech-detect -status-code -follow-redirects -no-color`.

whatweb — after httpx shows a live site. Example: `whatweb -a 1 --no-errors http://<host>`.

sslscan — TLS ports only. Example: `sslscan --no-colour <host>:443`.

nuclei — live URLs only. Example: `nuclei -u <url> -severity critical,high,medium`. Treat every template hit as a lead.

nikto — after a live web root. Example: `nikto -h <url> -ask no`. Hits are leads.

ffuf — after the web root is mapped. Example: `ffuf -u http://<host>/FUZZ -w /usr/share/wordlists/dirb/common.txt -mc 200,204,301,302,307,401,403`.

gobuster — same job as ffuf when ffuf is the wrong fit. Example: `gobuster dir -u http://<host> -w /usr/share/wordlists/dirb/common.txt`. DNS mode only for domains: `gobuster dns -d <domain> -w <wordlist>`.

subfinder — domains, not IPs. Example: `subfinder -d <domain> -silent`.
</plugin_recipes>
