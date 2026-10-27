# Glossary (plain English)

| Term | Meaning |
|---|---|
| **Asset** | Anything worth protecting: data, systems, credentials, reputation. |
| **Attack surface** | All the places an attacker can try to interact with your system (endpoints, ports, inputs, people). |
| **Authentication (AuthN)** | Proving who you are. |
| **Authorization (AuthZ)** | Deciding what you're allowed to do. |
| **BOLA / IDOR** | Broken Object Level Authorization / Insecure Direct Object Reference — accessing another user's object by changing its ID. |
| **Blast radius** | How much damage is possible once something is compromised. |
| **CIA triad** | Confidentiality, Integrity, Availability. |
| **CSP** | Content Security Policy — browser header restricting where scripts/resources may load from. |
| **CSRF** | Cross-Site Request Forgery — tricking a logged-in browser into sending an unwanted request. |
| **CVE** | Common Vulnerabilities and Exposures — a public ID for a known vulnerability (e.g. CVE-2021-44228). |
| **CVSS** | Common Vulnerability Scoring System — a 0–10 severity score. |
| **CWE** | Common Weakness Enumeration — a catalogue of weakness *types* (e.g. CWE-89 SQL injection). |
| **DAST** | Dynamic testing of a running application. |
| **Defense in depth** | Multiple independent layers of controls so one failure isn't fatal. |
| **Detective control** | Something that tells you an attack happened (logs, alerts). |
| **DFD** | Data-flow diagram used in threat modeling. |
| **Exploit** | Code or technique that takes advantage of a vulnerability. |
| **IaC** | Infrastructure as Code (Terraform, CloudFormation). |
| **IAM** | Identity and Access Management. |
| **IOC** | Indicator of Compromise — evidence (IP, hash, domain) that a system was attacked. |
| **JWT** | JSON Web Token — a signed (sometimes encrypted) token carrying claims. |
| **Least privilege** | Only the minimum permissions needed, for the minimum time. |
| **MFA** | Multi-factor authentication. |
| **OIDC** | OpenID Connect — identity layer on top of OAuth 2.0. |
| **OAuth 2.0** | Delegated authorization framework (granting an app limited access on your behalf). |
| **Preventive control** | Something that stops an attack (input validation, firewall, IAM policy). |
| **Residual risk** | Risk remaining after controls are applied. |
| **RCE** | Remote Code Execution. |
| **SAST** | Static analysis of source code. |
| **SBOM** | Software Bill of Materials — a list of every component in your software. |
| **SCA** | Software Composition Analysis — finding vulnerable dependencies. |
| **SIEM** | Security Information and Event Management — central log search + alerting. |
| **SSRF** | Server-Side Request Forgery — making the server fetch a URL the attacker chooses. |
| **STRIDE** | Threat categories: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. |
| **Threat** | A potential cause of harm (an actor + their intent/capability). |
| **Trust boundary** | Where data or control crosses between components with different trust levels. |
| **Vulnerability** | A weakness that can be exploited. |
| **XSS** | Cross-Site Scripting. |
| **XXE** | XML External Entity injection. |
| **Zero trust** | Never trust based on network location; verify every request. |
