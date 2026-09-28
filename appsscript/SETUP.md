# Backend Setup

1. Create a new (https://script.google.com) project.
2. Paste the contents of `Code.gs` into the editor.
3. Run the `setup()` function once from the editor to initialize the backing Google Sheet structure.
4. Click **Deploy** → **New deployment** → Select type **Web app**.
5. Set execution to **Me** and access to **Anyone**.
6. Copy the generated `/exec` URL — this is both your student-facing web board and your AI agent's webhook endpoint.
