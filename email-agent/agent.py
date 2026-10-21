"""
Email management agent powered by Claude.

Prerequisites:
  1. pip install -r requirements.txt
  2. Copy .env.example to .env and add your ANTHROPIC_API_KEY
  3. Place credentials.json (from Google Cloud Console) in this directory
  4. Run: python3 gmail_setup.py   (once, to authorise Gmail access)
  5. Run: python3 agent.py
"""

import os
import base64
import re
import requests
from email import message_from_bytes

import anthropic
from dotenv import load_dotenv
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.readonly",
]

# --------------------------------------------------------------------- #
#  Gmail helpers
# --------------------------------------------------------------------- #

def get_gmail_service():
    if not os.path.exists("token.json"):
        raise FileNotFoundError(
            "token.json not found. Run `python3 gmail_setup.py` first."
        )
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return build("gmail", "v1", credentials=creds)


def _header(msg, name):
    for h in msg["payload"]["headers"]:
        if h["name"].lower() == name.lower():
            return h["value"]
    return ""


def _body_text(msg):
    """Extract plain-text body from a Gmail message."""
    def _walk(part):
        mime = part.get("mimeType", "")
        if mime == "text/plain":
            data = part.get("body", {}).get("data", "")
            return base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace")
        for sub in part.get("parts", []):
            result = _walk(sub)
            if result:
                return result
        return ""

    text = _walk(msg["payload"])
    return text[:3000] if text else msg.get("snippet", "")


def _unsubscribe_url(msg):
    """Extract the first HTTP/S unsubscribe URL from List-Unsubscribe header."""
    header = _header(msg, "List-Unsubscribe")
    urls = re.findall(r"<(https?://[^>]+)>", header)
    return urls[0] if urls else None


# --------------------------------------------------------------------- #
#  Tool definitions
# --------------------------------------------------------------------- #

TOOLS = [
    {
        "name": "list_emails",
        "description": (
            "List recent unread emails from the inbox. "
            "Returns ID, sender, subject, and a short snippet for each."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "max_results": {
                    "type": "integer",
                    "description": "Maximum number of emails to fetch (default 25, max 50).",
                }
            },
        },
    },
    {
        "name": "read_email",
        "description": "Read the full body of a specific email by its ID.",
        "input_schema": {
            "type": "object",
            "properties": {
                "email_id": {"type": "string", "description": "The Gmail message ID."}
            },
            "required": ["email_id"],
        },
    },
    {
        "name": "delete_email",
        "description": (
            "Permanently delete an email. "
            "Use only when confident it is spam, automated junk, or an unsolicited ad."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "email_id": {"type": "string"},
                "reason": {"type": "string", "description": "One-line reason for deletion."},
            },
            "required": ["email_id", "reason"],
        },
    },
    {
        "name": "unsubscribe_and_delete",
        "description": (
            "Unsubscribe from a mailing list via its List-Unsubscribe URL, "
            "then delete the email. Use for marketing or newsletter emails."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "email_id": {"type": "string"},
                "sender": {"type": "string"},
            },
            "required": ["email_id", "sender"],
        },
    },
    {
        "name": "flag_for_user",
        "description": (
            "Flag an email as important so the user knows to read it. "
            "Use for personal messages, bills, action items, or anything uncertain."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "email_id": {"type": "string"},
                "sender": {"type": "string"},
                "subject": {"type": "string"},
                "summary": {
                    "type": "string",
                    "description": "One or two sentences explaining what the email is about.",
                },
                "reason": {
                    "type": "string",
                    "description": "Why does this need the user's attention?",
                },
            },
            "required": ["email_id", "sender", "subject", "summary", "reason"],
        },
    },
]


# --------------------------------------------------------------------- #
#  Tool execution
# --------------------------------------------------------------------- #

def execute_tool(name: str, inputs: dict, gmail, flagged: list, dry_run: bool) -> str:
    if name == "list_emails":
        max_r = min(inputs.get("max_results", 25), 50)
        results = gmail.users().messages().list(
            userId="me", labelIds=["INBOX", "UNREAD"], maxResults=max_r
        ).execute()
        messages = results.get("messages", [])
        if not messages:
            return "Inbox is empty or all emails are read."
        lines = []
        for m in messages:
            msg = gmail.users().messages().get(
                userId="me", id=m["id"], format="metadata"
            ).execute()
            lines.append(
                f"ID: {m['id']} | "
                f"From: {_header(msg, 'From')} | "
                f"Subject: {_header(msg, 'Subject')} | "
                f"Snippet: {msg.get('snippet', '')[:120]}"
            )
        return "\n".join(lines)

    elif name == "read_email":
        msg = gmail.users().messages().get(
            userId="me", id=inputs["email_id"], format="full"
        ).execute()
        return (
            f"From: {_header(msg, 'From')}\n"
            f"Subject: {_header(msg, 'Subject')}\n"
            f"Date: {_header(msg, 'Date')}\n\n"
            f"{_body_text(msg)}"
        )

    elif name == "delete_email":
        if dry_run:
            return f"[DRY RUN] Would delete {inputs['email_id']} — {inputs['reason']}"
        gmail.users().messages().delete(userId="me", id=inputs["email_id"]).execute()
        return f"Deleted {inputs['email_id']}."

    elif name == "unsubscribe_and_delete":
        msg = gmail.users().messages().get(
            userId="me", id=inputs["email_id"], format="full"
        ).execute()
        url = _unsubscribe_url(msg)
        result_parts = []
        if url:
            if dry_run:
                result_parts.append(f"[DRY RUN] Would GET {url}")
            else:
                try:
                    resp = requests.get(url, timeout=10)
                    result_parts.append(f"Unsubscribed via {url} (HTTP {resp.status_code})")
                except Exception as e:
                    result_parts.append(f"Unsubscribe request failed: {e}")
        else:
            result_parts.append("No List-Unsubscribe URL found — skipping unsubscribe step.")
        if dry_run:
            result_parts.append(f"[DRY RUN] Would delete {inputs['email_id']}")
        else:
            gmail.users().messages().delete(userId="me", id=inputs["email_id"]).execute()
            result_parts.append(f"Deleted {inputs['email_id']}.")
        return " | ".join(result_parts)

    elif name == "flag_for_user":
        flagged.append(inputs)
        return f"Flagged for user attention: {inputs['subject']}"

    return f"Unknown tool: {name}"


# --------------------------------------------------------------------- #
#  Agent loop
# --------------------------------------------------------------------- #

def run_agent(dry_run: bool = False):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY not set. Add it to your .env file.")

    client = anthropic.Anthropic(api_key=api_key)
    gmail = get_gmail_service()
    flagged = []

    mode = "[DRY RUN MODE — no emails will actually be deleted]" if dry_run else ""
    print(f"Starting email agent... {mode}\n")

    messages = [
        {
            "role": "user",
            "content": (
                "Please check my Gmail inbox and process my unread emails. "
                "For each email:\n"
                "1. Start by calling list_emails to see what's in my inbox.\n"
                "2. Delete obvious spam, automated notifications I don't need, "
                "and unsolicited advertisements.\n"
                "3. For marketing emails or newsletters, call unsubscribe_and_delete "
                "so I stop receiving them in future.\n"
                "4. Flag anything that needs my attention: personal messages, "
                "bills, invoices, shipping updates, anything requiring a reply, "
                "or anything you're unsure about.\n"
                "5. When in doubt, always flag rather than delete.\n"
                "6. After processing everything, give me a brief summary of what you did."
            ),
        }
    ]

    while True:
        response = client.messages.create(
            model="claude-opus-4-8",
            max_tokens=4096,
            thinking={"type": "adaptive"},
            tools=TOOLS,
            messages=messages,
        )

        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text") and block.text:
                    print("\n=== Agent Summary ===")
                    print(block.text)
            break

        if response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    print(f"  → {block.name}({', '.join(f'{k}={repr(v)[:40]}' for k, v in block.input.items())})")
                    result = execute_tool(block.name, block.input, gmail, flagged, dry_run)
                    tool_results.append(
                        {
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": result,
                        }
                    )
            messages.append({"role": "user", "content": tool_results})

    if flagged:
        print("\n=== Emails Needing Your Attention ===")
        for i, e in enumerate(flagged, 1):
            print(f"\n{i}. [{e['sender']}] {e['subject']}")
            print(f"   {e['summary']}")
            print(f"   Why: {e['reason']}")


# --------------------------------------------------------------------- #
#  Entry point
# --------------------------------------------------------------------- #

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Claude email management agent")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview actions without actually deleting any emails.",
    )
    args = parser.parse_args()

    run_agent(dry_run=args.dry_run)
