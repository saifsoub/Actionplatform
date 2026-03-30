import anthropic as anthropic_sdk

from app.core.config import settings

# Single shared AsyncAnthropic client reused across requests to avoid repeated TLS handshakes.
# Lazily initialized on first use.
_client: anthropic_sdk.AsyncAnthropic | None = None


def get_anthropic_client() -> anthropic_sdk.AsyncAnthropic:
    global _client
    if _client is None:
        _client = anthropic_sdk.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client
