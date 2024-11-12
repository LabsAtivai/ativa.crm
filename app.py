import os
from flask import Flask, redirect, request, jsonify
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

app = Flask(__name__)

# Configurações e variáveis globais
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]
TOKEN_PATH = "token.json"
CREDENTIALS_PATH = "credentials.json"  # Atualize para apontar para o arquivo correto

def authenticate():
    """Autentica e retorna um cliente OAuth2 com credenciais."""
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    else:
        creds = None

    if not creds or not creds.valid:
        flow = Flow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
        flow.redirect_uri = request.base_url.replace("/oauth2callback", "") + "/oauth2callback"
        auth_url, _ = flow.authorization_url(access_type="offline", prompt="consent")
        return redirect(auth_url)

    return creds

def get_email_history(creds):
    """Recupera o histórico de interações com cada usuário que já enviou um e-mail."""
    service = build('gmail', 'v1', credentials=creds)
    messages = []
    page_token = None

    # Loop para buscar todas as mensagens, usando paginação
    while True:
        results = service.users().messages().list(userId='me', pageToken=page_token, maxResults=100).execute()
        messages.extend(results.get('messages', []))
        page_token = results.get('nextPageToken')
        if not page_token:
            break

    email_history = {}
    for message in messages:
        msg = service.users().messages().get(userId='me', id=message['id']).execute()
        headers = msg.get("payload", {}).get("headers", [])

        from_address = None
        subject = None
        date = None

        # Extrai os campos "From", "Subject" e "Date"
        for header in headers:
            if header['name'] == 'From':
                from_address = header['value']
            elif header['name'] == 'Subject':
                subject = header['value']
            elif header['name'] == 'Date':
                date = header['value']

        # Ignora mensagens sem remetente
        if not from_address:
            continue

        # Organiza mensagens por remetente
        if from_address not in email_history:
            email_history[from_address] = []

        email_history[from_address].append({
            'subject': subject,
            'date': date,
            'snippet': msg.get("snippet", ""),
            'message_id': message['id']
        })

    return email_history

@app.route("/google_login")
def google_login():
    """Inicia o fluxo de autenticação e redireciona para a URL de autorização."""
    flow = Flow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
    flow.redirect_uri = request.base_url.replace("/google_login", "") + "/oauth2callback"
    auth_url, _ = flow.authorization_url(access_type="offline", prompt="consent")
    return redirect(auth_url)

@app.route("/oauth2callback")
def oauth2callback():
    """Callback para receber o código de autorização e salvar o token."""
    flow = Flow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
    flow.redirect_uri = request.base_url.replace("/oauth2callback", "") + "/oauth2callback"
    flow.fetch_token(code=request.args["code"])

    creds = flow.credentials
    with open(TOKEN_PATH, "w") as token_file:
        token_file.write(creds.to_json())
    
    # Obter histórico de e-mails agrupado por remetente
    email_history = get_email_history(creds)
    
    return jsonify(email_history)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
    