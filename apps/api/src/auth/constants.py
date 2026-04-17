import re

USERNAME_PATTERN = re.compile(r"^[a-zA-Z][a-zA-Z0-9_.-]*$")
OAUTH_STATE_COOKIE_NAME = "wearwise_oauth_state"
