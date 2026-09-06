# Terms of Service

## Context

ft_transcendence is:

- a 42 student project;
- a local evaluation build;
- not a commercial service.

## Accepted Use

Users should:

- create valid accounts;
- keep credentials private;
- use rooms for gameplay/testing;
- use chat respectfully;
- avoid abusive behavior;
- avoid disrupting other players.

Users should not:

- bypass authentication;
- send malicious payloads;
- abuse WebSocket events;
- attack the API;
- attack the database.

## Service Limits

The app may be:

- restarted;
- rebuilt;
- reset;
- cleaned before demo.

Data may be lost after:

- database reset;
- Docker volume reset;
- redeployment;
- manual cleanup.

Affected data:

- profile data;
- match history;
- leaderboard;
- game stats;
- rooms.

## Multiplayer and Chat

Chat is for:

- gameplay coordination;
- project testing;
- evaluation demo.

Validation rule:

- frontend validation helps users;
- backend validation is required;
- remaining validation work is tracked.

## Security

Use the HTTPS endpoint:

```txt
https://localhost:4242
```

Not accepted:

- auth bypass;
- invalid payload attacks;
- WebSocket abuse;
- database abuse.
