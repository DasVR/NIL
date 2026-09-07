<scan_methodology>
Walk the recon spine in order. Do not fire the whole chain at once.

nmap (hosts and open ports)
  → httpx (which ports speak HTTP)
    → whatweb (fingerprint the stack)
    → sslscan (TLS on 443 or other TLS ports)
    → nuclei (templates against live URLs) — hits are leads
    → nikto (web misconfig) — hits are leads
    → ffuf / gobuster (content discovery on confirmed web services)
subfinder (passive subdomains when the target is a domain, not an IP)

Match the tool to the target: nmap takes IPs/CIDRs; HTTP tools take hosts or URLs. Do not run nuclei before live HTTP is confirmed. One command unless YOLO is on. Sequential over parallel unless two steps are independent and cheap.
</scan_methodology>
