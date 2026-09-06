# Profiles and Friends

## Goal

- show user profile;
- update profile;
- show stats;
- manage friends.

## What Exists

- profile page;
- username display;
- avatar URL;
- profile update form;
- aggregate stats;
- progression display;
- badges;
- badge sprite sheet;
- public profile panel from chat/friends context;
- friends list;
- add friend;
- remove friend.

## Flow

Profile:

- user opens profile;
- frontend requests current user;
- backend reads user and stats;
- frontend displays profile.

Update:

- user edits username or avatar;
- frontend sends update;
- backend updates database;
- frontend refreshes user data.

Friends:

- user enters friend id;
- backend connects or disconnects relation;
- frontend reloads friends list.

## Key Files

- `backend/src/routes/users.js`
- `backend/src/routes/friends.js`
- `frontend/src/pages/ProfilePage.jsx`
- `frontend/src/pages/FriendsPage.jsx`
- `frontend/src/features/profile/`
- `frontend/src/features/friends/`
- `frontend/src/features/chat/PublicProfilePanel.jsx`

## API Contracts

- `GET /api/users/me`
- `GET /api/users/:userId`
- `PATCH /api/users/me`
- `GET /api/users/search`
- `GET /api/friends`
- `POST /api/friends/:id`
- `DELETE /api/friends/:id`

## Validation

Automatic checks:

- auth required;
- empty username rejected;
- avatar URL checked;
- friend id parsed;
- self-add rejected;
- missing target user rejected.

## Progression Rules

- games played badges;
- wins badges;
- damage dealt badges;
- damage received badges;
- gold earned badges.

## Manual Checks

- open profile;
- update username;
- update avatar;
- add friend;
- remove friend;
- test invalid friend id;
- check profile stats.

## Current Limitations

- avatar is URL only;
- friend online status is not implemented.
