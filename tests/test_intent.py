from finn_pentest.core.intent import guess_shell_tool, looks_like_chat, looks_like_command


def test_guess_tool_skips_sudo_and_env():
    assert guess_shell_tool("sudo nmap -sV 10.0.0.1") == "nmap"
    assert guess_shell_tool("FOO=1 nmap -F 10.0.0.1") == "nmap"


def test_english_goes_to_finn():
    assert looks_like_chat("Can you use nmap -p 1-1000 192.168.1.0/24")
    assert looks_like_chat("explain this error")
    assert looks_like_chat("/ask what ports are open")
    assert looks_like_chat("why did that fail?")
    assert looks_like_chat("please scan the host and summarize")
    assert looks_like_chat("what is listening on 443")


def test_real_commands_stay_in_the_shell():
    assert looks_like_command("nmap -p 1-1000 192.168.1.0/24")
    assert not looks_like_chat("nmap -p 1-1000 192.168.1.0/24")
    assert looks_like_command("sudo nmap -sV 10.0.0.1")
    assert not looks_like_chat("sudo nmap -sV 10.0.0.1")
    assert looks_like_command("FOO=1 nmap -F 10.0.0.1")
    assert looks_like_command("ls -la")
    assert looks_like_command("docker ps")
    assert looks_like_command("gobuster dir -u http://10.0.0.1")
    assert not looks_like_chat("curl -I https://app.example.com")
